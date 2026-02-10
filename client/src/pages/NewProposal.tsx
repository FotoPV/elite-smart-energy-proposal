import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch } from "wouter";
import { useState, useCallback, useEffect, useRef } from "react";
import { 
  ArrowLeft, ArrowRight, Users, Upload, Zap, CheckCircle, FileText,
  Loader2, Camera, X, Eye, Trash2, Plus, ImageIcon
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  docType: string;
  status: 'uploading' | 'done' | 'error';
}

export default function NewProposal() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const preselectedCustomerId = searchParams.get("customerId");

  const [step, setStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    preselectedCustomerId ? parseInt(preselectedCustomerId) : null
  );
  const [proposalTitle, setProposalTitle] = useState("");
  const [electricityBillId, setElectricityBillId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  // Multi-file upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const multiFileRef = useRef<HTMLInputElement>(null);

  const { data: customers, refetch: refetchCustomers } = trpc.customers.list.useQuery({});
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: '', email: '', phone: '', address: '', state: 'VIC',
    hasPool: false, hasEV: false, notes: '',
  });
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: (data) => {
      toast.success('Customer created successfully');
      refetchCustomers();
      setSelectedCustomerId(data.id);
      setShowNewCustomerDialog(false);
      setNewCustomer({ fullName: '', email: '', phone: '', address: '', state: 'VIC', hasPool: false, hasEV: false, notes: '' });
    },
    onError: (err) => toast.error(err.message),
  });
  const { data: selectedCustomer } = trpc.customers.get.useQuery(
    { id: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );
  const { data: existingBills, refetch: refetchBills } = trpc.bills.listByCustomer.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );
  const { data: existingDocuments, refetch: refetchDocuments } = trpc.documents.list.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );

  const uploadBill = trpc.bills.upload.useMutation();
  const extractBill = trpc.bills.extract.useMutation();
  const uploadDocument = trpc.documents.upload.useMutation();
  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: (data) => {
      toast.success("Proposal created");
      setLocation(`/proposals/${data.id}`);
    },
    onError: (error) => toast.error(error.message)
  });

  // Auto-select existing electricity bill
  useEffect(() => {
    if (existingBills) {
      const elecBill = existingBills.find(b => b.billType === 'electricity');
      if (elecBill) setElectricityBillId(elecBill.id);
    }
  }, [existingBills]);

  // Load existing documents into uploaded files list
  // When server data arrives, replace the entire list with server entries
  // plus any still-uploading local entries (to avoid duplicates)
  useEffect(() => {
    if (existingDocuments && existingDocuments.length > 0) {
      const serverFiles: UploadedFile[] = existingDocuments.map(d => ({
        id: `existing-${d.id}`,
        name: d.fileName || d.documentType,
        type: d.mimeType || 'application/octet-stream',
        url: d.fileUrl,
        docType: d.documentType,
        status: 'done' as const,
      }));
      setUploadedFiles(prev => {
        // Keep only local entries that are still uploading (not yet on server)
        const stillUploading = prev.filter(f => f.status === 'uploading');
        // Merge: server files (authoritative) + still-uploading local files
        return [...serverFiles, ...stillUploading];
      });
    }
  }, [existingDocuments]);

  // Auto-set proposal title
  useEffect(() => {
    if (selectedCustomer && !proposalTitle) {
      setProposalTitle(`Electrification Proposal for ${selectedCustomer.fullName}`);
    }
  }, [selectedCustomer, proposalTitle]);

  const handleElectricityBillUpload = async (file: globalThis.File) => {
    if (!selectedCustomerId) return;
    setIsUploading(true);
    setUploadingType('electricity');
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadBill.mutateAsync({
        customerId: selectedCustomerId,
        billType: 'electricity',
        fileData: base64,
        fileName: file.name
      });
      toast.success("Bill uploaded, extracting data...");
      try {
        await extractBill.mutateAsync({ billId: result.id });
        toast.success("Bill data extracted successfully");
      } catch {
        toast.error("Extraction failed, you can manually enter data later");
      }
      setElectricityBillId(result.id);
      refetchBills();
    } catch {
      toast.error("Failed to upload bill");
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  // Multi-file upload handler for photos and PDFs
  const handleMultiFileUpload = useCallback(async (files: FileList | globalThis.File[]) => {
    if (!selectedCustomerId) return;
    const fileArray = Array.from(files);

    const newEntries: UploadedFile[] = fileArray.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type,
      url: '',
      docType: file.type.startsWith('image/') ? 'photo' : 'document_pdf',
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newEntries]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const entryId = newEntries[i].id;
      const docType = file.type.startsWith('image/') ? 'switchboard_photo' : 'solar_proposal_pdf';

      try {
        const base64 = await fileToBase64(file);
        const result = await uploadDocument.mutateAsync({
          customerId: selectedCustomerId,
          documentType: docType,
          fileData: base64,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        });
        setUploadedFiles(prev => prev.map(f =>
          f.id === entryId ? { ...f, status: 'done', url: result.fileUrl } : f
        ));
        toast.success(`${file.name} uploaded`);
      } catch {
        setUploadedFiles(prev => prev.map(f =>
          f.id === entryId ? { ...f, status: 'error' } : f
        ));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    refetchDocuments();
  }, [selectedCustomerId]);

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleMultiFileUpload(files);
  }, [handleMultiFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleCreateProposal = () => {
    if (!selectedCustomerId) { toast.error("Please select a customer"); return; }
    if (!electricityBillId) { toast.error("Please upload an electricity bill"); return; }
    createProposal.mutate({
      customerId: selectedCustomerId,
      title: proposalTitle,
      electricityBillId,
    });
  };

  const completedUploads = uploadedFiles.filter(f => f.status === 'done');
  const photoCount = completedUploads.filter(f => f.type.startsWith('image/')).length;
  const pdfCount = completedUploads.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf')).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/proposals")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="lightning-text-gradient">New Proposal</span>
            </h1>
            <p className="text-muted-foreground">Create a new electrification proposal</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-4">
          <StepIndicator step={1} currentStep={step} label="Customer" />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator step={2} currentStep={step} label="Upload" />
          <div className="w-16 h-0.5 bg-border" />
          <StepIndicator step={3} currentStep={step} label="Create" />
        </div>

        {/* Step 1: Select Customer */}
        {step === 1 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Select Customer
              </CardTitle>
              <CardDescription>Choose an existing customer or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={selectedCustomerId?.toString() || ""}
                  onValueChange={(v) => setSelectedCustomerId(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.fullName} - {customer.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomer && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium">{selectedCustomer.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedCustomer.hasPool && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Pool</span>
                    )}
                    {selectedCustomer.hasEV && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400">EV</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowNewCustomerDialog(true)}>
                  Add New Customer
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedCustomerId}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload Bills & Documents */}
        {step === 2 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Files
              </CardTitle>
              <CardDescription>Upload electricity bill, photos, and supporting documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Electricity Bill - Required */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Electricity Bill (Required)
                </Label>
                {electricityBillId ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Electricity bill uploaded</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Upload electricity bill (PDF)</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="electricity-upload"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleElectricityBillUpload(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('electricity-upload')?.click()}
                      disabled={isUploading}
                    >
                      {uploadingType === 'electricity' ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                      ) : "Select File"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">ADDITIONAL DOCUMENTS (Optional)</h3>
                <p className="text-xs text-muted-foreground mb-4">Upload multiple photos (switchboard, roof, meter) and PDFs (solar proposals, quotes)</p>
              </div>

              {/* Multi-file drop zone */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => multiFileRef.current?.click()}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports multiple photos (JPG, PNG) and PDFs</p>
                <input
                  ref={multiFileRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMultiFileUpload(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      Uploaded Files ({completedUploads.length})
                      {photoCount > 0 && <span className="ml-2 text-xs">{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>}
                      {pdfCount > 0 && <span className="ml-2 text-xs">{pdfCount} PDF{pdfCount !== 1 ? 's' : ''}</span>}
                    </Label>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {uploadedFiles.map(file => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          file.status === 'done' ? 'bg-green-500/5 border-green-500/20' :
                          file.status === 'error' ? 'bg-red-500/5 border-red-500/20' :
                          'bg-muted/30 border-border'
                        }`}
                      >
                        {file.type.startsWith('image/') ? (
                          file.status === 'done' && file.url ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="h-10 w-10 object-cover rounded cursor-pointer"
                              onClick={(e) => { e.stopPropagation(); setPreviewUrl(file.url); }}
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )
                        ) : (
                          <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{file.name}</p>
                          {file.status === 'uploading' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Uploading...</span>
                            </div>
                          )}
                          {file.status === 'error' && (
                            <p className="text-xs text-red-400 mt-0.5">Upload failed</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {file.status === 'done' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              {file.type.startsWith('image/') && file.url && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setPreviewUrl(file.url); }}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              {!file.type.startsWith('image/') && file.url && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.id); }}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!electricityBillId}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Create Proposal */}
        {step === 3 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Create Proposal
              </CardTitle>
              <CardDescription>Review and create the proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Proposal Title</Label>
                <Input
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Enter proposal title"
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h4 className="font-medium">Summary</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span>{selectedCustomer?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{selectedCustomer?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Electricity Bill:</span>
                    <span className="text-green-400">Uploaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Additional Files:</span>
                    <span className={completedUploads.length > 0 ? "text-green-400" : "text-muted-foreground"}>
                      {completedUploads.length > 0
                        ? `${completedUploads.length} file${completedUploads.length !== 1 ? 's' : ''} (${photoCount} photo${photoCount !== 1 ? 's' : ''}, ${pdfCount} PDF${pdfCount !== 1 ? 's' : ''})`
                        : "None"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleCreateProposal}
                  disabled={createProposal.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {createProposal.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                  ) : (
                    <><Zap className="mr-2 h-4 w-4" />Create Proposal</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Add New Customer
            </DialogTitle>
            <DialogDescription>Enter customer details to create a new record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={newCustomer.fullName}
                onChange={(e) => setNewCustomer(p => ({ ...p, fullName: e.target.value }))}
                placeholder="John Smith"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  placeholder="0412 345 678"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={newCustomer.address}
                onChange={(e) => setNewCustomer(p => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, Melbourne VIC 3000"
              />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Select value={newCustomer.state} onValueChange={(v) => setNewCustomer(p => ({ ...p, state: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIC">VIC</SelectItem>
                  <SelectItem value="NSW">NSW</SelectItem>
                  <SelectItem value="QLD">QLD</SelectItem>
                  <SelectItem value="SA">SA</SelectItem>
                  <SelectItem value="WA">WA</SelectItem>
                  <SelectItem value="TAS">TAS</SelectItem>
                  <SelectItem value="NT">NT</SelectItem>
                  <SelectItem value="ACT">ACT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-muted-foreground">Property Details</Label>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasPool"
                  checked={newCustomer.hasPool}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasPool: !!c }))}
                />
                <label htmlFor="hasPool" className="text-sm cursor-pointer">Has Swimming Pool</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasEV"
                  checked={newCustomer.hasEV}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasEV: !!c }))}
                />
                <label htmlFor="hasEV" className="text-sm cursor-pointer">Has / Interested in EV</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!newCustomer.fullName.trim() || !newCustomer.address.trim()) {
                    toast.error('Name and address are required');
                    return;
                  }
                  createCustomer.mutate({
                    fullName: newCustomer.fullName,
                    email: newCustomer.email || undefined,
                    phone: newCustomer.phone || undefined,
                    address: newCustomer.address,
                    state: newCustomer.state,
                    hasPool: newCustomer.hasPool,
                    hasEV: newCustomer.hasEV,
                    notes: newCustomer.notes || undefined,
                  });
                }}
                disabled={createCustomer.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createCustomer.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                ) : 'Create Customer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${
        isCompleted ? 'bg-green-400/10 border-green-400 text-green-400' :
        isActive ? 'bg-primary/10 border-primary text-primary' :
        'bg-muted border-border text-muted-foreground'
      }`}>
        {isCompleted ? <CheckCircle className="h-5 w-5" /> : step}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}

function fileToBase64(file: globalThis.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
