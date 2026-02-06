import { useState } from "react";
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
  Upload,
  Share2,
  Copy,
  Link,
  ExternalLink,
  BarChart3,
  Eye,
  Users,
  Timer,
  Monitor,
  Smartphone,
  Tablet,
  Globe
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { SlideViewer } from "@/components/SlideViewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Update and Publish Button Component - Recalculates, regenerates slides, then exports PDF
function UpdateAndPublishButton({ proposalId, customerName, onComplete }: { proposalId: number; customerName: string; onComplete: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  
  const calculateMutation = trpc.proposals.calculate.useMutation();
  const generateMutation = trpc.proposals.generate.useMutation();
  const exportMutation = trpc.proposals.exportPdf.useMutation();
  
  const handleUpdateAndPublish = async () => {
    setIsProcessing(true);
    setProgress(0);
    try {
      // Step 1: Recalculate (0-33%)
      setCurrentStep('Recalculating...');
      setProgress(10);
      await calculateMutation.mutateAsync({ proposalId });
      setProgress(33);
      
      // Step 2: Regenerate slides (33-66%)
      setCurrentStep('Generating slides...');
      setProgress(40);
      await generateMutation.mutateAsync({ proposalId });
      setProgress(66);
      
      // Step 3: Export PDF (66-100%)
      setCurrentStep('Creating PDF...');
      setProgress(75);
      const result = await exportMutation.mutateAsync({ proposalId });
      setProgress(100);
      
      // Download the PDF
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.download = `${customerName.replace(/\s+/g, '_')}_Proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
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

// Publish PDF Button Component
function PublishPDFButton({ proposalId, customerName }: { proposalId: number; customerName: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const exportMutation = trpc.proposals.exportPdf.useMutation({
    onSuccess: (data) => {
      // Create download link
      const link = document.createElement('a');
      link.href = data.fileUrl;
      link.download = `${customerName.replace(/\s+/g, '_')}_Proposal.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF generated successfully!');
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
      setIsGenerating(false);
    }
  });
  
  const handlePublish = () => {
    setIsGenerating(true);
    toast.info('Generating PDF... This may take a moment.');
    exportMutation.mutate({ proposalId });
  };
  
  return (
    <Button 
      onClick={handlePublish}
      disabled={isGenerating || exportMutation.isPending}
      className="lightning-button-primary"
    >
      {isGenerating || exportMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Publish PDF
        </>
      )}
    </Button>
  );
}

// Share Link Button Component - Generates a shareable link for customer portal
function ShareLinkButton({ proposalId, customerName }: { proposalId: number; customerName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const createLinkMutation = trpc.proposals.createShareLink.useMutation({
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}/portal/${data.token}`;
      setShareLink(fullUrl);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create link: ${error.message}`);
      setIsGenerating(false);
    }
  });
  
  const handleGenerateLink = () => {
    setIsGenerating(true);
    createLinkMutation.mutate({ proposalId, expiresInDays: 30 });
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard!');
  };
  
  const handleOpenPortal = () => {
    window.open(shareLink, '_blank');
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-primary/30 hover:bg-primary/10"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share with Customer
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Share Proposal
            </DialogTitle>
            <DialogDescription>
              Generate a secure link for {customerName} to view their proposal online.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!shareLink ? (
              <Button 
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="w-full lightning-button-primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 h-4 w-4" />
                    Generate Share Link
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <Label>Customer Portal Link</Label>
                <div className="flex gap-2">
                  <Input 
                    value={shareLink} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={handleOpenPortal}
                    className="flex-1 lightning-button-primary"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Portal
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Link expires in 30 days
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Analytics Dashboard Component
function ProposalAnalytics({ proposalId }: { proposalId: number }) {
  const { data: analytics, isLoading } = trpc.analytics.getProposalAnalytics.useQuery(
    { proposalId },
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );
  
  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#00EAD3]" />
            Customer Engagement Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!analytics) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#00EAD3]" />
            Customer Engagement Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No views yet. Share the proposal with your customer to start tracking engagement.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#00EAD3]" />
          Customer Engagement Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold font-mono">{analytics.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold font-mono">{analytics.uniqueVisitors}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg. Duration</p>
                <p className="text-2xl font-bold font-mono">{formatDuration(analytics.avgDurationSeconds)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Device Breakdown */}
        {analytics.deviceBreakdown.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Device Breakdown</h4>
            <div className="flex gap-4">
              {analytics.deviceBreakdown.map((device) => (
                <div key={device.deviceType} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                  {getDeviceIcon(device.deviceType)}
                  <span className="text-sm capitalize">{device.deviceType}</span>
                  <span className="text-sm font-bold text-primary">{device.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Slide Engagement */}
        {analytics.slideEngagement.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Slide Engagement</h4>
            <div className="space-y-2">
              {analytics.slideEngagement.map((slide) => {
                const maxTime = Math.max(...analytics.slideEngagement.map(s => s.avgTimeSpent), 1);
                const percentage = Math.round((slide.avgTimeSpent / maxTime) * 100);
                return (
                  <div key={slide.slideIndex} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6 text-right">{slide.slideIndex + 1}</span>
                    <span className="text-sm w-48 truncate" title={slide.slideTitle || slide.slideType}>
                      {slide.slideTitle || slide.slideType}
                    </span>
                    <div className="flex-1 h-6 bg-background rounded-full overflow-hidden border border-border">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00EAD3] to-[#00EAD3]/60 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-16 text-right">{formatDuration(slide.avgTimeSpent)}</span>
                    <span className="text-xs text-muted-foreground w-12 text-right">{slide.totalViews} views</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Recent Views */}
        {analytics.recentViews.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Recent Views</h4>
            <div className="space-y-2">
              {analytics.recentViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(view.deviceType || 'unknown')}
                    <div>
                      <p className="text-sm">
                        {view.browser || 'Unknown'} on {view.os || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {view.ipAddress ? view.ipAddress.substring(0, 12) + '...' : 'Unknown IP'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{formatDuration(view.durationSeconds || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      {view.viewedAt ? new Date(view.viewedAt).toLocaleDateString('en-AU', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      }) : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {analytics.totalViews === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No views yet. Share the proposal with your customer to start tracking engagement.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProposalDetail() {
  const params = useParams<{ id: string }>();
  const proposalId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: proposal, isLoading, refetch } = trpc.proposals.get.useQuery(
    { id: proposalId },
    { enabled: proposalId > 0 }
  );
  
  const { data: customer } = trpc.customers.get.useQuery(
    { id: proposal?.customerId || 0 },
    { enabled: !!proposal?.customerId }
  );
  
  const calculateMutation = trpc.proposals.calculate.useMutation({
    onSuccess: () => {
      toast.success("Calculations completed");
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });
  
  const generateMutation = trpc.proposals.generate.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.slideCount} slides`);
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">Proposal not found</h2>
          <Button onClick={() => setLocation("/proposals")} className="mt-4">
            Back to Proposals
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const calculations = proposal.calculations as any;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/proposals")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                {proposal.title}
              </h1>
              <p className="text-muted-foreground">
                {customer?.fullName} • {customer?.state}
              </p>
            </div>
          </div>
          <span className={`status-badge ${proposal.status}`}>{proposal.status}</span>
        </div>

        {/* Workflow Steps */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Proposal Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <WorkflowStep
                step={1}
                title="Bills Uploaded"
                completed={!!proposal.electricityBillId}
                active={!proposal.electricityBillId}
              />
              <div className="flex-1 h-0.5 bg-border" />
              <WorkflowStep
                step={2}
                title="Calculations"
                completed={!!proposal.calculations}
                active={!!proposal.electricityBillId && !proposal.calculations}
              />
              <div className="flex-1 h-0.5 bg-border" />
              <WorkflowStep
                step={3}
                title="Generated"
                completed={proposal.status === 'generated' || proposal.status === 'exported'}
                active={!!proposal.calculations && proposal.status !== 'generated'}
              />
              <div className="flex-1 h-0.5 bg-border" />
              <WorkflowStep
                step={4}
                title="Exported"
                completed={proposal.status === 'exported'}
                active={proposal.status === 'generated'}
              />
            </div>
            
            <div className="flex gap-3 mt-6">
              {!proposal.electricityBillId && (
                <Button 
                  onClick={() => setLocation(`/customers/${proposal.customerId}`)}
                  className="lightning-button-primary"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Upload Bills
                </Button>
              )}
              
              {proposal.electricityBillId && !proposal.calculations && (
                <Button 
                  onClick={() => calculateMutation.mutate({ proposalId })}
                  disabled={calculateMutation.isPending}
                  className="lightning-button-primary"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {calculateMutation.isPending ? "Calculating..." : "Run Calculations"}
                </Button>
              )}
              
              {proposal.calculations && proposal.status !== 'generated' && (
                <Button 
                  onClick={() => generateMutation.mutate({ proposalId })}
                  disabled={generateMutation.isPending}
                  className="lightning-button-primary"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {generateMutation.isPending ? "Generating..." : "Generate Slides"}
                </Button>
              )}
              
              {proposal.calculations && (
                <UpdateAndPublishButton 
                  proposalId={proposalId} 
                  customerName={customer?.fullName || 'Customer'} 
                  onComplete={() => refetch()}
                />
              )}
              
              {proposal.status === 'generated' && (
                <PublishPDFButton proposalId={proposalId} customerName={customer?.fullName || 'Customer'} />
              )}
              
              {proposal.status === 'generated' && (
                <ShareLinkButton proposalId={proposalId} customerName={customer?.fullName || 'Customer'} />
              )}
              
              {proposal.calculations && (
                <Button 
                  variant="outline"
                  onClick={() => calculateMutation.mutate({ proposalId })}
                  disabled={calculateMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalculate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calculations Summary */}
        {calculations && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Annual Savings"
                value={`$${calculations.totalAnnualSavings?.toLocaleString() || 0}`}
                icon={DollarSign}
                color="primary"
              />
              <SummaryCard
                title="Payback Period"
                value={`${calculations.paybackYears || 0} years`}
                icon={TrendingUp}
                color="accent"
              />
              <SummaryCard
                title="Battery Size"
                value={`${calculations.recommendedBatteryKwh || 0} kWh`}
                icon={Battery}
                color="primary"
              />
              <SummaryCard
                title="Solar Size"
                value={`${calculations.recommendedSolarKw || 0} kW`}
                icon={Sun}
                color="accent"
              />
            </div>

            {/* Detailed Calculations */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Energy Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DataRow label="Daily Average" value={`${calculations.dailyAverageKwh?.toFixed(1) || 0} kWh`} />
                  <DataRow label="Monthly Usage" value={`${calculations.monthlyUsageKwh?.toFixed(0) || 0} kWh`} />
                  <DataRow label="Yearly Usage" value={`${calculations.yearlyUsageKwh?.toFixed(0) || 0} kWh`} />
                  <DataRow label="Projected Annual Cost" value={`$${calculations.projectedAnnualCost?.toLocaleString() || 0}`} />
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Savings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculations.hotWaterSavings > 0 && (
                    <DataRow label="Hot Water Savings" value={`$${calculations.hotWaterSavings?.toLocaleString() || 0}/yr`} />
                  )}
                  {calculations.heatingCoolingSavings > 0 && (
                    <DataRow label="HVAC Savings" value={`$${calculations.heatingCoolingSavings?.toLocaleString() || 0}/yr`} />
                  )}
                  {calculations.vppAnnualValue > 0 && (
                    <DataRow label="VPP Income" value={`$${calculations.vppAnnualValue?.toLocaleString() || 0}/yr`} />
                  )}
                  {calculations.evAnnualSavings > 0 && (
                    <DataRow label="EV Savings" value={`$${calculations.evAnnualSavings?.toLocaleString() || 0}/yr`} />
                  )}
                  <div className="border-t border-border pt-4">
                    <DataRow 
                      label="Total Annual Savings" 
                      value={`$${calculations.totalAnnualSavings?.toLocaleString() || 0}`} 
                      highlight
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DataRow label="Total Investment" value={`$${calculations.totalInvestment?.toLocaleString() || 0}`} />
                  <DataRow label="Total Rebates" value={`-$${calculations.totalRebates?.toLocaleString() || 0}`} color="text-green-400" />
                  <div className="border-t border-border pt-4">
                    <DataRow label="Net Investment" value={`$${calculations.netInvestment?.toLocaleString() || 0}`} highlight />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>VPP Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {calculations.selectedVppProvider ? (
                    <>
                      <DataRow label="Provider" value={calculations.selectedVppProvider.name || "N/A"} />
                      <DataRow label="Program" value={calculations.selectedVppProvider.programName || "N/A"} />
                      <DataRow label="Annual Value" value={`$${calculations.vppAnnualValue?.toLocaleString() || 0}`} />
                    </>
                  ) : (
                    <p className="text-muted-foreground">No VPP provider selected</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Slides Preview - Professional Lightning Energy Design */}
        {calculations && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#00EAD3]" />
                Proposal Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SlideViewer proposalId={proposalId} />
            </CardContent>
          </Card>
        )}

        {/* Analytics Section */}
        {proposal.status === 'generated' && (
          <ProposalAnalytics proposalId={proposalId} />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}

function WorkflowStep({ step, title, completed, active }: { step: number; title: string; completed: boolean; active: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${active ? 'text-primary' : completed ? 'text-green-400' : 'text-muted-foreground'}`}>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
        completed ? 'bg-green-400/10 border-green-400' : 
        active ? 'bg-primary/10 border-primary animate-pulse' : 
        'bg-muted border-border'
      }`}>
        {completed ? <CheckCircle className="h-5 w-5" /> : <span className="font-semibold">{step}</span>}
      </div>
      <span className="text-xs font-medium">{title}</span>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: 'primary' | 'accent' }) {
  return (
    <Card className={`bg-card border-border border-l-2 ${color === 'primary' ? 'border-l-primary' : 'border-l-accent'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'}`}>
            <Icon className={`h-6 w-6 ${color === 'primary' ? 'text-primary' : 'text-accent'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataRow({ label, value, highlight = false, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${highlight ? 'font-semibold' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`font-medium ${highlight ? 'text-lg' : ''} ${color || ''}`}>{value}</span>
    </div>
  );
}
