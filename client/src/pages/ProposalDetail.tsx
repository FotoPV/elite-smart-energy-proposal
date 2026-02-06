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
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { SlideViewer } from "@/components/SlideViewer";

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
              
              {proposal.status === 'generated' && (
                <PublishPDFButton proposalId={proposalId} customerName={customer?.fullName || 'Customer'} />
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
