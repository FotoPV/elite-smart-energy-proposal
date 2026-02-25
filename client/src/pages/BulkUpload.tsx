import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface BillFile {
  id: string;
  file: File;
  name: string;
  status: "pending" | "processing" | "success" | "error";
  proposalId?: number;
  customerName?: string;
  error?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BulkUpload() {
  const [, setLocation] = useLocation();
  const [bills, setBills] = useState<BillFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkCreate = trpc.proposals.bulkCreate.useMutation();

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => f.type === "application/pdf");
    if (newFiles.length === 0) {
      toast.error("Only PDF files are supported.");
      return;
    }
    setBills((prev) => {
      const combined = [...prev, ...newFiles.map((f) => ({
        id: Math.random().toString(36).slice(2),
        file: f,
        name: f.name,
        status: "pending" as const,
      }))];
      if (combined.length > 10) {
        toast.warning("Maximum 10 bills per batch. Extra files were ignored.");
        return combined.slice(0, 10);
      }
      return combined;
    });
  }, []);

  const removeFile = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleProcess = async () => {
    const pending = bills.filter((b) => b.status === "pending");
    if (pending.length === 0) return;

    setIsProcessing(true);

    // Mark all pending as processing
    setBills((prev) =>
      prev.map((b) => (b.status === "pending" ? { ...b, status: "processing" } : b))
    );

    try {
      // Convert all files to base64
      const billInputs = await Promise.all(
        pending.map(async (b) => ({
          fileData: await fileToBase64(b.file),
          fileName: b.name,
        }))
      );

      const { results } = await bulkCreate.mutateAsync({ bills: billInputs });

      // Update statuses based on results
      setBills((prev) =>
        prev.map((b) => {
          const result = results.find((r) => r.fileName === b.name);
          if (!result) return b;
          if (result.status === "success") {
            return {
              ...b,
              status: "success",
              proposalId: result.proposalId,
              customerName: result.customerName,
            };
          } else {
            return { ...b, status: "error", error: result.error };
          }
        })
      );

      const successCount = results.filter((r) => r.status === "success").length;
      const errorCount = results.filter((r) => r.status === "error").length;

      if (successCount > 0) {
        toast.success(
          `${successCount} proposal${successCount > 1 ? "s" : ""} created successfully!`
        );
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} bill${errorCount > 1 ? "s" : ""} failed to process.`);
      }
    } catch (err) {
      toast.error("Bulk upload failed. Please try again.");
      setBills((prev) =>
        prev.map((b) =>
          b.status === "processing"
            ? { ...b, status: "error", error: "Upload failed" }
            : b
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = bills.filter((b) => b.status === "pending").length;
  const successCount = bills.filter((b) => b.status === "success").length;
  const processingCount = bills.filter((b) => b.status === "processing").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1
            className="text-3xl uppercase tracking-tight text-white"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}
          >
            Bulk Upload
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload up to 10 electricity bills at once. A proposal will be automatically
            created for each bill.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
            ${isDragging
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-accent/30"
            }
            ${isProcessing ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
          <Upload className="mx-auto mb-3 text-primary" size={40} />
          <p className="text-white font-semibold text-lg">
            {isDragging ? "Drop bills here" : "Drag & drop electricity bills"}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            or click to browse — PDF files only, up to 10 at a time
          </p>
          {bills.length > 0 && (
            <span className="absolute top-3 right-4 text-xs text-muted-foreground">
              {bills.length}/10 loaded
            </span>
          )}
        </div>

        {/* File List */}
        {bills.length > 0 && (
          <div className="space-y-2">
            {bills.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {b.status === "pending" && (
                    <FileText size={18} className="text-muted-foreground" />
                  )}
                  {b.status === "processing" && (
                    <Loader2 size={18} className="text-primary animate-spin" />
                  )}
                  {b.status === "success" && (
                    <CheckCircle2 size={18} className="text-green-400" />
                  )}
                  {b.status === "error" && (
                    <AlertCircle size={18} className="text-destructive" />
                  )}
                </div>

                {/* File name + result */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{b.name}</p>
                  {b.status === "success" && b.customerName && (
                    <p className="text-xs text-green-400 mt-0.5">
                      {b.customerName} — Proposal #{b.proposalId}
                    </p>
                  )}
                  {b.status === "error" && b.error && (
                    <p className="text-xs text-destructive mt-0.5 truncate">{b.error}</p>
                  )}
                  {b.status === "processing" && (
                    <p className="text-xs text-primary mt-0.5">Extracting & generating…</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {b.status === "success" && b.proposalId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-primary hover:text-primary"
                      onClick={() => setLocation(`/proposals/${b.proposalId}`)}
                    >
                      View <ArrowRight size={12} className="ml-1" />
                    </Button>
                  )}
                  {b.status === "pending" && !isProcessing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(b.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Bar */}
        {bills.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {successCount > 0 && (
                <span className="text-green-400 font-medium">{successCount} created </span>
              )}
              {pendingCount > 0 && (
                <span>{pendingCount} ready to process</span>
              )}
              {processingCount > 0 && (
                <span className="text-primary">{processingCount} processing…</span>
              )}
            </p>
            <div className="flex gap-3">
              {!isProcessing && pendingCount === 0 && successCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setBills([]);
                  }}
                >
                  Clear All
                </Button>
              )}
              {pendingCount > 0 && (
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Generate {pendingCount} Proposal{pendingCount > 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              )}
              {successCount > 0 && pendingCount === 0 && !isProcessing && (
                <Button onClick={() => setLocation("/proposals")}>
                  View All Proposals <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
