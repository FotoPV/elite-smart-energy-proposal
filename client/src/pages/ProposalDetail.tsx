import { useState, useCallback } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { 
  ArrowLeft,
  Calculator,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  TrendingUp,
  Battery,
  Sun,
  Loader2,
  Edit,
  Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { SlideViewer } from "@/components/SlideViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Client-side PDF generation: renders each slide HTML in a hidden iframe,
 * captures with html2canvas, and assembles into a PDF with jsPDF.
 * This works in production without needing Puppeteer/Chrome on the server.
 */
async function generatePdfClientSide(
  slideHtmlArray: string[],
  onProgress?: (step: string, percent: number) => void
): Promise<Blob> {
  // Dynamic imports for code splitting
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas-pro'),
    import('jspdf'),
  ]);

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Create a hidden container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1120px;
    height: 630px;
    overflow: hidden;
    z-index: -1;
  `;
  document.body.appendChild(container);

  try {
    for (let i = 0; i < slideHtmlArray.length; i++) {
      if (i > 0) pdf.addPage();

      const pct = Math.round(((i + 1) / slideHtmlArray.length) * 100);
      onProgress?.(`Rendering slide ${i + 1} of ${slideHtmlArray.length}...`, pct);

      // Render slide
      container.innerHTML = `
        <div style="
          width: 1120px;
          height: 630px;
          background: #000000;
          color: #ffffff;
          overflow: hidden;
          position: relative;
          font-family: 'General Sans', sans-serif;
        ">
          ${slideHtmlArray[i]}
        </div>
      `;

      // Wait for rendering
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: 1120,
        height: 630,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

// Update and Publish Button Component - Recalculates, regenerates slides, then exports PDF client-side
function UpdateAndPublishButton({ proposalId, customerName, onComplete }: { proposalId: number; customerName: string; onComplete: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  
  const calculateMutation = trpc.proposals.calculate.useMutation();
  const generateMutation = trpc.proposals.generate.useMutation();
  const utils = trpc.useUtils();
  
  const handleUpdateAndPublish = async () => {
    setIsProcessing(true);
    setProgress(0);
    try {
      // Step 1: Recalculate (0-20%)
      setCurrentStep('Recalculating...');
      setProgress(10);
      await calculateMutation.mutateAsync({ proposalId });
      setProgress(20);
      
      // Step 2: Regenerate slides (20-40%)
      setCurrentStep('Generating slides...');
      setProgress(30);
      await generateMutation.mutateAsync({ proposalId });
      setProgress(40);
      
      // Step 3: Fetch slide HTML (40-50%)
      setCurrentStep('Fetching slide data...');
      setProgress(45);
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated');
      }
      setProgress(50);
      
      // Step 4: Generate PDF client-side (50-95%)
      setCurrentStep('Creating PDF...');
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(50 + Math.round(pct * 0.45));
      });
      
      setProgress(95);
      
      // Step 5: Upload to server for storage
      setCurrentStep('Uploading PDF...');
      const fileName = `${customerName.replace(/\s+/g, '_')}_Proposal_${Date.now()}.pdf`;
      
      // Convert blob to base64 for upload
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = (reader.result as string).split(',')[1];
          resolve(base64data);
        };
        reader.readAsDataURL(pdfBlob);
      });
      
      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfData: base64,
          fileName,
          proposalId: proposalId.toString(),
        }),
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        // Also trigger a download
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Just download locally if upload fails
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      
      setProgress(100);
      toast.success('Proposal updated and PDF generated successfully!');
      onComplete();
    } catch (error: any) {
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
      setProgress(0);
    }
  };
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={handleUpdateAndPublish}
        disabled={isProcessing}
        className="lightning-button-primary w-full"
      >
        {isProcessing ? (
          <>
            <Clock className="mr-2 h-4 w-4 animate-pulse" />
            {currentStep} ({progress}%)
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Update & Publish
          </>
        )}
      </Button>
      {isProcessing && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            <Clock className="inline h-3 w-3 mr-1" />
            {progress}% Complete
          </p>
        </div>
      )}
    </div>
  );
}

// Publish PDF Button Component - Client-side PDF generation
function PublishPDFButton({ proposalId, customerName }: { proposalId: number; customerName: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const utils = trpc.useUtils();
  
  const handlePublish = async () => {
    setIsGenerating(true);
    setProgress(0);
    toast.info('Generating PDF... This may take a moment.');
    
    try {
      // Fetch slide HTML
      setCurrentStep('Fetching slides...');
      setProgress(10);
      const slidesResult = await utils.proposals.getSlideHtml.fetch({ proposalId });
      
      if (!slidesResult?.slides || slidesResult.slides.length === 0) {
        throw new Error('No slides generated. Run calculations and generate slides first.');
      }
      
      setProgress(20);
      
      // Generate PDF client-side
      const slideHtmlArray = slidesResult.slides.map((s: any) => s.html);
      
      const pdfBlob = await generatePdfClientSide(slideHtmlArray, (step, pct) => {
        setCurrentStep(step);
        setProgress(20 + Math.round(pct * 0.7));
      });
      
      setProgress(90);
      setCurrentStep('Preparing download...');
      
      // Download the PDF
      const fileName = `${customerName.replace(/\s+/g, '_')}_Proposal.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also upload to S3 for storage
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
          };
          reader.readAsDataURL(pdfBlob);
        });
        
        await fetch('/api/upload-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfData: base64,
            fileName: `${customerName.replace(/\s+/g, '_')}_Proposal_${Date.now()}.pdf`,
            proposalId: proposalId.toString(),
          }),
        });
      } catch {
        // Upload to S3 is optional, PDF already downloaded
      }
      
      setProgress(100);
      toast.success('PDF generated and downloaded!');
    } catch (error: any) {
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={handlePublish}
        disabled={isGenerating}
        className="lightning-button-primary"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {currentStep || 'Generating PDF...'}
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Publish PDF
          </>
        )}
      </Button>
      {isGenerating && (
        <Progress value={progress} className="h-2" />
      )}
    </div>
  );
}



export default function ProposalDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const proposalId = parseInt(params.id || '0');
  const [activeTab, setActiveTab] = useState<'overview' | 'slides'>('overview');
  
  const { data: proposal, isLoading, refetch } = trpc.proposals.get.useQuery({ id: proposalId });
  const calculateMutation = trpc.proposals.calculate.useMutation({
    onSuccess: () => {
      toast.success('Calculations completed!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Calculation failed: ${error.message}`);
    }
  });
  
  const generateMutation = trpc.proposals.generate.useMutation({
    onSuccess: () => {
      toast.success('Slides generated!');
      refetch();
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    }
  });
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Proposal Not Found</h2>
          <p className="text-muted-foreground mb-4">The proposal you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/proposals')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Proposals
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const calc = proposal.calculations as any;
  const customerName = (proposal as any).customer?.fullName || 'Customer';
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/proposals')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                <span className="lightning-text-gradient">{proposal.title}</span>
              </h1>
              <p className="text-muted-foreground">
                {customerName} • {proposal.status}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {proposal.status === 'generated' && (
              <PublishPDFButton proposalId={proposalId} customerName={customerName} />
            )}
            <UpdateAndPublishButton 
              proposalId={proposalId} 
              customerName={customerName}
              onComplete={refetch}
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {(['overview', 'slides'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold capitalize">{proposal.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Slide Count</p>
                      <p className="text-lg font-semibold">{proposal.slideCount || 0} slides</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-lg font-semibold">
                        {new Date(proposal.createdAt).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Calculations Summary */}
            {calc && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Calculation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground">Annual Usage</p>
                      <p className="text-xl font-bold font-mono">{calc.yearlyUsageKwh?.toLocaleString() || 0} kWh</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground">Annual Cost</p>
                      <p className="text-xl font-bold font-mono text-red-400">${calc.projectedAnnualCost?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground">Annual Savings</p>
                      <p className="text-xl font-bold font-mono text-primary">${calc.totalAnnualSavings?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted-foreground">Payback Period</p>
                      <p className="text-xl font-bold font-mono">{calc.paybackYears || 0} years</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">Solar System</p>
                      </div>
                      <p className="text-lg font-bold font-mono">{calc.recommendedSolarKw || 0} kW</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Battery className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">Battery</p>
                      </div>
                      <p className="text-lg font-bold font-mono">{calc.recommendedBatteryKwh || 0} kWh</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">Total Investment</p>
                      </div>
                      <p className="text-lg font-bold font-mono">${calc.totalInvestment?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <p className="text-xs text-muted-foreground">10-Year Savings</p>
                      </div>
                      <p className="text-lg font-bold font-mono text-primary">${((calc.totalAnnualSavings || 0) * 10).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => calculateMutation.mutate({ proposalId })}
                disabled={calculateMutation.isPending}
                variant="outline"
                className="border-primary/30 hover:border-primary"
              >
                {calculateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                Recalculate
              </Button>
              <Button
                onClick={() => generateMutation.mutate({ proposalId })}
                disabled={generateMutation.isPending || !calc}
                variant="outline"
                className="border-primary/30 hover:border-primary"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate Slides
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'slides' && (
          <SlideViewer proposalId={proposalId} />
        )}
        

        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}
