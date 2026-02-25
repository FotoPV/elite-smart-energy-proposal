import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, RotateCcw, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProposalBin() {
  const utils = trpc.useUtils();
  
  const { data: binItems, isLoading } = trpc.proposals.getBinItems.useQuery();
  
  const restoreMutation = trpc.proposals.restore.useMutation({
    onSuccess: () => {
      utils.proposals.getBinItems.invalidate();
      utils.proposals.list.invalidate();
      toast.success("Proposal restored");
    },
    onError: (err) => toast.error(err.message),
  });
  
  const permanentDeleteMutation = trpc.proposals.permanentDelete.useMutation({
    onSuccess: () => {
      utils.proposals.getBinItems.invalidate();
      toast.success("Permanently deleted");
    },
    onError: (err) => toast.error(err.message),
  });
  
  const emptyBinMutation = trpc.proposals.emptyBin.useMutation({
    onSuccess: (data) => {
      utils.proposals.getBinItems.invalidate();
      toast.success(`Bin emptied — ${data.count} proposal(s) permanently deleted`);
    },
    onError: (err) => toast.error(err.message),
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl uppercase tracking-tight text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
              Bin
            </h1>
            <p className="text-xs uppercase tracking-[0.15em] mt-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: '#4A6B8A' }}>
              Deleted proposals — restore or permanently remove
            </p>
          </div>
          
          {binItems && binItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                  style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' }}
                  disabled={emptyBinMutation.isPending}
                >
                  {emptyBinMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  EMPTY BIN
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Empty Bin?
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ fontFamily: "'Open Sans', sans-serif" }}>
                    This will permanently delete all {binItems.length} proposal(s). This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel style={{ fontFamily: "'Montserrat', sans-serif" }}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => emptyBinMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Permanently Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : !binItems || binItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ border: '1px solid rgba(128,130,133,0.15)' }}>
            <Trash2 className="h-16 w-16 mb-4" style={{ color: '#4A6B8A', opacity: 0.3 }} />
            <h3 className="text-base text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
              Bin is empty
            </h3>
            <p className="text-sm text-center" style={{ fontFamily: "'Open Sans', sans-serif", color: '#4A6B8A' }}>
              Deleted proposals will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {binItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-xl transition-all"
                style={{ border: '1px solid rgba(128,130,133,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(128,130,133,0.2)' }}>
                    <FileText className="h-5 w-5" style={{ color: '#4A6B8A' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {item.title || `Proposal #${item.id}`}
                    </p>
                    <p className="text-xs mt-1" style={{ fontFamily: "'Open Sans', sans-serif", color: '#4A6B8A' }}>
                      {item.customerName || "Unknown"} · Deleted {formatDate(item.deletedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => restoreMutation.mutate({ id: item.id })}
                    disabled={restoreMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, border: '1px solid rgba(0,234,211,0.3)', color: '#46B446' }}
                  >
                    {restoreMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Restore
                  </button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={permanentDeleteMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                      >
                        {permanentDeleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Permanently Delete?
                        </AlertDialogTitle>
                        <AlertDialogDescription style={{ fontFamily: "'Open Sans', sans-serif" }}>
                          This will permanently delete "{item.title || `Proposal #${item.id}`}". This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel style={{ fontFamily: "'Montserrat', sans-serif" }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => permanentDeleteMutation.mutate({ id: item.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          Permanently Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] pt-4" style={{ fontFamily: "'Open Sans', sans-serif", color: '#4A6B8A', borderTop: '1px solid rgba(128,130,133,0.2)' }}>
          © Elite Smart Energy Solutions — Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}
