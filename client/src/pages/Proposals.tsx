import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Search, 
  PlusCircle,
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type BatchStep = 'idle' | 'confirm' | 'recompressing' | 'resetting' | 'generating' | 'complete' | 'error';

export default function Proposals() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchStep, setBatchStep] = useState<BatchStep>('idle');
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [recompressResult, setRecompressResult] = useState<{ total: number; processed: number; failed: number } | null>(null);
  const [resetResult, setResetResult] = useState<{ resetCount: number; eligibleProposals: number } | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const { data: proposals, isLoading, refetch } = trpc.proposals.list.useQuery({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter
  });
  
  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposal moved to bin");
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  const recompressPhotos = trpc.admin.recompressPhotos.useMutation({
    onSuccess: (data) => {
      setRecompressResult({ total: data.total, processed: data.processed, failed: data.failed });
      setBatchStep('resetting');
      // Automatically proceed to reset
      regenerateAll.mutate();
    },
    onError: (error) => {
      setBatchError(`Photo recompression failed: ${error.message}`);
      setBatchStep('error');
    }
  });

  const regenerateAll = trpc.admin.regenerateAll.useMutation({
    onSuccess: (data) => {
      setResetResult({ resetCount: data.resetCount, eligibleProposals: data.eligibleProposals });
      setBatchStep('generating');
      // Automatically proceed to batch generate
      batchGenerate.mutate();
    },
    onError: (error) => {
      setBatchError(`Reset failed: ${error.message}`);
      setBatchStep('error');
    }
  });

  const batchGenerate = trpc.admin.batchGenerate.useMutation({
    onSuccess: (data) => {
      setBatchId(data.batchId);
    },
    onError: (error) => {
      setBatchError(`Batch generation failed: ${error.message}`);
      setBatchStep('error');
    }
  });

  // Poll batch progress
  const { data: batchProgress, refetch: refetchProgress } = trpc.admin.batchProgress.useQuery(
    { batchId: batchId || '' },
    { enabled: !!batchId && batchStep === 'generating', refetchInterval: 3000 }
  );

  // Auto-complete when batch finishes
  useEffect(() => {
    if (batchProgress && batchProgress.status === 'complete') {
      setBatchStep('complete');
      refetch();
    }
  }, [batchProgress]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleRegenerateAll = () => {
    setBatchStep('confirm');
    setBatchError(null);
    setRecompressResult(null);
    setResetResult(null);
    setBatchId(null);
  };

  const startBatchProcess = () => {
    setBatchStep('recompressing');
    recompressPhotos.mutate();
  };

  const closeDialog = () => {
    setBatchStep('idle');
    setBatchError(null);
    setRecompressResult(null);
    setResetResult(null);
    setBatchId(null);
  };

  const isDialogOpen = batchStep !== 'idle';
  const isProcessing = ['recompressing', 'resetting', 'generating'].includes(batchStep);

  const generatedCount = proposals?.filter(p => p.status === 'generated' || p.status === 'exported').length || 0;
  const draftCount = proposals?.filter(p => p.status === 'draft').length || 0;
  const totalCount = proposals?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl uppercase tracking-tight text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
               Bills and Photos
             </h1>
            <p className="text-xs uppercase tracking-[0.15em] mt-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: '#808285' }}>
              All uploaded customer bills and photos
            </p>
          </div>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <button 
                onClick={handleRegenerateAll}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all"
                style={{ 
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  backgroundColor: 'rgba(0,234,211,0.1)',
                  color: '#46B446',
                  border: '1px solid rgba(0,234,211,0.3)'
                }}
              >
                <RefreshCw className="h-4 w-4" />
                REGENERATE ALL
              </button>
            )}
            <button 
              onClick={() => setLocation("/proposals/new")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all"
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                backgroundColor: '#46B446',
                color: '#000000'
              }}
            >
              <PlusCircle className="h-4 w-4" />
              NEW PROPOSAL
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#808285' }} />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="calculating">Calculating</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-2">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all group"
                style={{ 
                  border: '1px solid rgba(128,130,133,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
                onClick={() => setLocation(`/proposals/${proposal.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,234,211,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(128,130,133,0.2)';
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(0,234,211,0.3)' }}>
                    <FileText className="h-5 w-5" style={{ color: '#46B446' }} />
                  </div>
                  <div>
                    <p className="text-sm text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {proposal.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                        <Calendar className="h-3 w-3" />
                        {new Date(proposal.createdAt).toLocaleDateString('en-AU')}
                      </span>
                      {proposal.slideCount && (
                        <span className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                          {proposal.slideCount} slides
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`status-badge ${proposal.status}`}>
                    {proposal.status}
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/proposals/${proposal.id}`);
                      }} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Move this proposal to the bin?")) {
                            deleteProposal.mutate({ id: proposal.id });
                          }
                        }}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Move to Bin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ border: '1px solid rgba(128,130,133,0.15)' }}>
            <FileText className="h-16 w-16 mb-4" style={{ color: '#808285', opacity: 0.3 }} />
            <h3 className="text-base text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
              {searchTerm || statusFilter !== "all" ? "No matching proposals" : "No proposals yet"}
            </h3>
            <p className="text-sm text-center mb-6" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Create your first proposal to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button 
                onClick={() => setLocation("/proposals/new")} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, backgroundColor: '#46B446', color: '#000000' }}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                NEW PROPOSAL
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] pt-4" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285', borderTop: '1px solid rgba(128,130,133,0.2)' }}>
          © Elite Smart Energy Solutions
        </div>
      </div>

      {/* Regenerate All Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open && !isProcessing) closeDialog(); }}>
        <DialogContent 
          className="sm:max-w-lg"
          style={{ 
            backgroundColor: '#1a1a1a', 
            border: '1px solid rgba(0,234,211,0.2)',
            color: '#ffffff'
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-xl uppercase tracking-tight text-white flex items-center gap-2"
              style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}
            >
              <Zap className="h-5 w-5" style={{ color: '#46B446' }} />
              Regenerate All Proposals
            </DialogTitle>
            <DialogDescription 
              className="text-sm mt-2"
              style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}
            >
              {batchStep === 'confirm' && (
                <>This will re-process all photos with correct rotation, recalculate all proposals, and regenerate all slides with the latest fixes. This process runs in the background and may take several minutes.</>
              )}
              {batchStep === 'recompressing' && 'Step 1/3 — Re-processing all photos with EXIF rotation correction...'}
              {batchStep === 'resetting' && 'Step 2/3 — Resetting all proposals to draft status...'}
              {batchStep === 'generating' && 'Step 3/3 — Generating slides for all proposals...'}
              {batchStep === 'complete' && 'All proposals have been regenerated successfully.'}
              {batchStep === 'error' && 'An error occurred during the batch process.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Step indicators */}
            <div className="space-y-3">
              {/* Step 1: Recompress Photos */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
                  backgroundColor: batchStep === 'recompressing' ? 'rgba(0,234,211,0.15)' : 
                    recompressResult ? 'rgba(0,234,211,0.1)' : 'rgba(128,130,133,0.1)',
                  border: `1px solid ${batchStep === 'recompressing' ? 'rgba(0,234,211,0.5)' : 
                    recompressResult ? 'rgba(0,234,211,0.3)' : 'rgba(128,130,133,0.2)'}`
                }}>
                  {batchStep === 'recompressing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#46B446' }} />
                  ) : recompressResult ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#46B446' }} />
                  ) : (
                    <ImageIcon className="h-4 w-4" style={{ color: '#808285' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                    Fix Photo Rotation
                  </p>
                  {recompressResult && (
                    <p className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                      {recompressResult.processed} of {recompressResult.total} photos re-processed
                      {recompressResult.failed > 0 && ` (${recompressResult.failed} failed)`}
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Reset Proposals */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
                  backgroundColor: batchStep === 'resetting' ? 'rgba(0,234,211,0.15)' : 
                    resetResult ? 'rgba(0,234,211,0.1)' : 'rgba(128,130,133,0.1)',
                  border: `1px solid ${batchStep === 'resetting' ? 'rgba(0,234,211,0.5)' : 
                    resetResult ? 'rgba(0,234,211,0.3)' : 'rgba(128,130,133,0.2)'}`
                }}>
                  {batchStep === 'resetting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#46B446' }} />
                  ) : resetResult ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#46B446' }} />
                  ) : (
                    <RefreshCw className="h-4 w-4" style={{ color: '#808285' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                    Reset Proposals
                  </p>
                  {resetResult && (
                    <p className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                      {resetResult.resetCount} of {resetResult.eligibleProposals} proposals reset to draft
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Generate Slides */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{
                  backgroundColor: batchStep === 'generating' ? 'rgba(0,234,211,0.15)' : 
                    batchStep === 'complete' ? 'rgba(0,234,211,0.1)' : 'rgba(128,130,133,0.1)',
                  border: `1px solid ${batchStep === 'generating' ? 'rgba(0,234,211,0.5)' : 
                    batchStep === 'complete' ? 'rgba(0,234,211,0.3)' : 'rgba(128,130,133,0.2)'}`
                }}>
                  {batchStep === 'generating' ? (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#46B446' }} />
                  ) : batchStep === 'complete' ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: '#46B446' }} />
                  ) : (
                    <Zap className="h-4 w-4" style={{ color: '#808285' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600 }}>
                    Generate All Slides
                  </p>
                  {batchProgress && batchStep === 'generating' && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-xs mb-1" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                        <span>
                          {batchProgress.completed + batchProgress.failed} of {batchProgress.total} proposals
                          {batchProgress.current && (
                            <span style={{ color: '#46B446' }}> — {batchProgress.current.title}</span>
                          )}
                        </span>
                        <span>{Math.round(((batchProgress.completed + batchProgress.failed) / Math.max(batchProgress.total, 1)) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(128,130,133,0.2)' }}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${((batchProgress.completed + batchProgress.failed) / Math.max(batchProgress.total, 1)) * 100}%`,
                            backgroundColor: '#46B446'
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {batchStep === 'complete' && batchProgress && (
                    <p className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                      {batchProgress.completed} succeeded, {batchProgress.failed} failed
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Error display */}
            {batchStep === 'error' && batchError && (
              <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
                <p className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#ef4444' }}>
                  {batchError}
                </p>
              </div>
            )}

            {/* Summary stats for confirm step */}
            {batchStep === 'confirm' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(128,130,133,0.08)', border: '1px solid rgba(128,130,133,0.15)' }}>
                  <p className="text-lg text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>{totalCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: '#808285' }}>Total</p>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(0,234,211,0.05)', border: '1px solid rgba(0,234,211,0.15)' }}>
                  <p className="text-lg" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: '#46B446' }}>{generatedCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: '#808285' }}>Generated</p>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ backgroundColor: 'rgba(255,165,0,0.05)', border: '1px solid rgba(255,165,0,0.15)' }}>
                  <p className="text-lg" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: '#FFA500' }}>{draftCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", color: '#808285' }}>Draft</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {batchStep === 'confirm' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={closeDialog}
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, borderColor: 'rgba(128,130,133,0.3)', color: '#808285' }}
                >
                  Cancel
                </Button>
                <button 
                  onClick={startBatchProcess}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, backgroundColor: '#46B446', color: '#000000' }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Start Regeneration
                </button>
              </>
            )}
            {batchStep === 'complete' && (
              <button 
                onClick={closeDialog}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, backgroundColor: '#46B446', color: '#000000' }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Done
              </button>
            )}
            {batchStep === 'error' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={closeDialog}
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, borderColor: 'rgba(128,130,133,0.3)', color: '#808285' }}
                >
                  Close
                </Button>
                <button 
                  onClick={startBatchProcess}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, backgroundColor: '#46B446', color: '#000000' }}
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </button>
              </>
            )}
            {isProcessing && (
              <p className="text-xs w-full text-center" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                Please keep this window open. Processing in background...
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
