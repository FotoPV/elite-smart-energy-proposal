import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function ProposalBin() {
  const utils = trpc.useUtils();
  
  const { data: binItems, isLoading } = trpc.proposals.getBinItems.useQuery();
  
  const restoreMutation = trpc.proposals.restore.useMutation({
    onSuccess: () => {
      utils.proposals.getBinItems.invalidate();
      utils.proposals.list.invalidate();
      toast.success("Proposal restored");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  
  const permanentDeleteMutation = trpc.proposals.permanentDelete.useMutation({
    onSuccess: () => {
      utils.proposals.getBinItems.invalidate();
      toast.success("Permanently deleted");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  
  const emptyBinMutation = trpc.proposals.emptyBin.useMutation({
    onSuccess: (data) => {
      utils.proposals.getBinItems.invalidate();
      toast.success(`Bin emptied - ${data.count} proposal(s) permanently deleted`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-extrabold tracking-tight">Bin</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Deleted proposals are stored here. Restore or permanently delete them.
          </p>
        </div>
        
        {binItems && binItems.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={emptyBinMutation.isPending}
              >
                {emptyBinMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Empty Bin
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Empty Bin?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {binItems.length} proposal(s) in the bin. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => emptyBinMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !binItems || binItems.length === 0 ? (
        <Card className="border border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Trash2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-heading font-bold text-muted-foreground">Bin is empty</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 font-body">
              Deleted proposals will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {binItems.map((item) => (
            <Card key={item.id} className="border border-border/50 hover:border-border transition-colors">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-ui font-semibold text-sm truncate">
                      {item.title || `Proposal #${item.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {item.customerName || "Unknown Customer"} · Deleted {formatDate(item.deletedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate({ id: item.id })}
                    disabled={restoreMutation.isPending}
                    className="text-primary border-primary/30 hover:bg-primary/10"
                  >
                    {restoreMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Restore
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={permanentDeleteMutation.isPending}
                      >
                        {permanentDeleteMutation.isPending ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Permanently Delete?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{item.title || `Proposal #${item.id}`}". 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => permanentDeleteMutation.mutate({ id: item.id })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Permanently Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
