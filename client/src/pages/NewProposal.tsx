import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch } from "wouter";
import { useState, useCallback, useEffect, useRef } from "react";
import { 
  ArrowLeft,
  ArrowRight,
  Users,
  Upload,
  Zap,
  Flame,
  CheckCircle,
  FileText,
  Loader2,
  Camera,
  File,
  X,
  Eye,
  Plus,
  Ruler
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface UploadedDoc {
  id: string;
  file?: File;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  documentId?: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  previewUrl?: string;
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
  const [gasBillId, setGasBillId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<'uploading' | 'extracting' | null>(null);
  
  // Multi-document upload state
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cableRunDistance, setCableRunDistance] = useState("");
  const [phaseType, setPhaseType] = useState("Single Phase");
  const [proposalNotes, setProposalNotes] = useState("");
  const docsInputRef = useRef<HTMLInputElement>(null);

  // Legacy single-doc state (for backward compat with summary step)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { data: customers, refetch: refetchCustomers } = trpc.customers.list.useQuery({});
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    state: 'VIC',
    hasSolarNew: false,
    hasSolarOld: false,
    hasPool: false,
    hasEV: false,
    notes: '',
  });
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: (data) => {
      toast.success('Customer created successfully');
      refetchCustomers();
      setSelectedCustomerId(data.id);
      setShowNewCustomerDialog(false);
      setNewCustomer({ fullName: '', email: '', phone: '', address: '', state: 'VIC', hasSolarNew: false,
    hasSolarOld: false, hasPool: false, hasEV: false, notes: '' });
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
  const deleteDocument = trpc.documents.delete.useMutation();
  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: (data) => {
      toast.success("Proposal created");
      setLocation(`/proposals/${data.id}`);
    },
    onError: (error) => toast.error(error.message)
  });

  // Auto-select existing bills and documents
  useEffect(() => {
    if (existingBills) {
      const elecBill = existingBills.find(b => b.billType === 'electricity');
      const gasBill = existingBills.find(b => b.billType === 'gas');
      if (elecBill) setElectricityBillId(elecBill.id);
      if (gasBill) setGasBillId(gasBill.id);
    }
  }, [existingBills]);

  useEffect(() => {
    if (existingDocuments && existingDocuments.length > 0) {
      const docs: UploadedDoc[] = existingDocuments.map(d => ({
        id: `existing-${d.id}`,
        fileName: d.fileName || 'document',
        fileUrl: d.fileUrl,
        mimeType: d.mimeType || 'application/octet-stream',
        documentId: d.id,
        status: 'done' as const,
        previewUrl: d.mimeType?.startsWith('image/') ? d.fileUrl : undefined,
      }));
      setUploadedDocs(docs);
    }
  }, [existingDocuments]);

  // Auto-set proposal title
  useEffect(() => {
    if (selectedCustomer && !proposalTitle) {
      setProposalTitle(`Electrification Proposal for ${selectedCustomer.fullName}`);
    }
  }, [selectedCustomer, proposalTitle]);

  const handleFileUpload = async (billType: 'electricity' | 'gas', file: File) => {
    if (!selectedCustomerId) return;
    
    setIsUploading(true);
    setUploadingType(billType);
    setUploadStage('uploading');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await uploadBill.mutateAsync({
          customerId: selectedCustomerId,
          billType,
          fileData: base64,
          fileName: file.name
        });
        
        setUploadStage('extracting');
        toast.success("Bill uploaded — AI extracting data...");
        
        try {
          await extractBill.mutateAsync({ billId: result.id });
          toast.success("✅ Bill data extracted successfully");
        } catch (err) {
          toast.error("Extraction failed — you can manually enter data later");
        }
        
        if (billType === 'electricity') {
          setElectricityBillId(result.id);
        } else {
          setGasBillId(result.id);
        }
        
        refetchBills();
        setIsUploading(false);
        setUploadingType(null);
        setUploadStage(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload bill");
      setIsUploading(false);
      setUploadingType(null);
      setUploadStage(null);
    }
  };

  const getDocumentType = (file: File): 'switchboard_photo' | 'meter_photo' | 'roof_photo' | 'property_photo' | 'solar_proposal_pdf' | 'other' => {
    if (file.type === 'application/pdf') return 'solar_proposal_pdf';
    if (file.type.startsWith('image/')) return 'switchboard_photo';
    return 'other';
  };

  const handleMultiDocUpload = async (files: File[]) => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer first");
      return;
    }

    for (const file of files) {
      const docId = `${Date.now()}-${Math.random()}`;
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      
      // Add to list as pending
      const newDoc: UploadedDoc = {
        id: docId,
        file,
        fileName: file.name,
        fileUrl: '',
        mimeType: file.type || 'application/octet-stream',
        status: 'uploading',
        previewUrl,
      };
      setUploadedDocs(prev => [...prev, newDoc]);

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await uploadDocument.mutateAsync({
          customerId: selectedCustomerId,
          documentType: getDocumentType(file),
          fileData: base64,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        });

        setUploadedDocs(prev => prev.map(d => d.id === docId ? {
          ...d,
          status: 'done' as const,
          fileUrl: result.fileUrl,
          documentId: result.documentId,
        } : d));

        refetchDocuments();
      } catch (error) {
        setUploadedDocs(prev => prev.map(d => d.id === docId ? { ...d, status: 'error' as const } : d));
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleRemoveDoc = async (doc: UploadedDoc) => {
    if (doc.documentId) {
      try {
        await deleteDocument.mutateAsync({ id: doc.documentId });
        refetchDocuments();
      } catch (e) {
        // ignore
      }
    }
    setUploadedDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    if (files.length) handleMultiDocUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleCreateProposal = () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!electricityBillId) {
      toast.error("Please upload an electricity bill");
      return;
    }
    
    createProposal.mutate({
      customerId: selectedCustomerId,
      title: proposalTitle,
      electricityBillId,
      gasBillId: gasBillId || undefined,
    });
  };

  const switchboardUploaded = uploadedDocs.some(d => d.status === 'done' && (d.mimeType?.startsWith('image/') || d.previewUrl));
  const solarPdfUploaded = uploadedDocs.some(d => d.status === 'done' && d.mimeType === 'application/pdf');

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
          <StepIndicator step={2} currentStep={step} label="Bills" />
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
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowNewCustomerDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Add New Customer
              </Button>

              {selectedCustomer && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Selected: {selectedCustomer.fullName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.address} — {selectedCustomer.state}</p>
                </div>
              )}
              
              <div className="flex justify-end pt-4">
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

        {/* Step 2: Upload Bills + Additional Documents */}
        {step === 2 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Bills
              </CardTitle>
              <CardDescription>Upload customer energy bills for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Electricity Bill */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Electricity Bill (Required)
                </Label>
                {electricityBillId ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Electricity bill uploaded</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-muted-foreground text-xs"
                      onClick={() => {
                        setElectricityBillId(null);
                        document.getElementById('electricity-upload')?.click();
                      }}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Upload electricity bill PDF for AI analysis</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="electricity-upload"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('electricity', file);
                      }}
                    />
                    <button
                      onClick={() => document.getElementById('electricity-upload')?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-md font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                      style={{ border: '2px solid #46B446', color: '#46B446', background: 'transparent', fontFamily: "'Montserrat', sans-serif", letterSpacing: '0.03em' }}
                    >
                      {uploadingType === 'electricity' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {uploadStage === 'extracting' ? 'AI Extracting...' : 'Uploading...'}
                        </>
                      ) : (
                        <><Upload className="h-4 w-4" /> Upload Electricity Bill</>
                      )}
                    </button>
                  </div>
                )}
              </div>


              {/* ─── CABLE RUN DISTANCE ─────────────────────────────── */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary tracking-wide uppercase">Cable Run Distance</span>
                  <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Enter the measured cable run distance from the site design. First 10m free (single phase) or 5m free (3-phase) per ESES T&amp;Cs.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Distance (metres)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 21.3"
                      value={cableRunDistance}
                      onChange={(e) => setCableRunDistance(e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Phase Type</Label>
                    <Select value={phaseType} onValueChange={setPhaseType}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single Phase">Single Phase</SelectItem>
                        <SelectItem value="Three Phase">Three Phase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ─── ADDITIONAL DOCUMENTS ───────────────────────────── */}
              <div className="border-t border-border pt-6">
                <div className="mb-1">
                  <h3 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Additional Documents (Optional)</h3>
                  <p className="text-xs text-muted-foreground mt-1">Upload multiple photos (switchboard, roof, meter) and PDFs (quotes, other documents)</p>
                </div>

                {/* Drag-drop zone */}
                <div
                  className={`mt-4 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => docsInputRef.current?.click()}
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports multiple photos (JPG, PNG) and PDFs</p>
                  <input
                    ref={docsInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length) handleMultiDocUpload(files);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Uploaded files list */}
                {uploadedDocs.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold">Uploaded Files ({uploadedDocs.length})</span>
                      <span className="text-xs text-muted-foreground">
                        {uploadedDocs.filter(d => d.mimeType?.startsWith('image/')).length} photos
                      </span>
                    </div>
                    <div className="space-y-2">
                      {uploadedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                        >
                          {/* Thumbnail */}
                          {doc.previewUrl ? (
                            <img
                              src={doc.previewUrl}
                              alt={doc.fileName}
                              className="h-12 w-12 object-cover rounded-md flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          {/* Filename */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.mimeType?.startsWith('image/') ? 'Photo' : 'PDF'}
                            </p>
                          </div>

                          {/* Status + actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {doc.status === 'uploading' && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                            {doc.status === 'done' && (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            )}
                            {doc.status === 'error' && (
                              <X className="h-5 w-5 text-red-400" />
                            )}
                            
                            {/* Preview */}
                            {doc.status === 'done' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); window.open(doc.fileUrl || doc.previewUrl, '_blank'); }}
                                className="p-1.5 rounded hover:bg-muted transition-colors"
                                title="Preview"
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                            
                            {/* Remove */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveDoc(doc); }}
                              className="p-1.5 rounded hover:bg-red-500/10 transition-colors"
                              title="Remove"
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── PROPOSAL NOTES ─────────────────────────────────── */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-primary tracking-wide uppercase">Proposal Notes</span>
                  <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add observations about the install — switchboard condition, existing system details, special requirements. These notes will be included in the AI-generated narrative.
                </p>
                <Textarea
                  placeholder="e.g. Switchboard needs upgrade — old style with ceramic fuses. 3-phase supply confirmed. Customer wants battery backup for essential circuits..."
                  value={proposalNotes}
                  onChange={(e) => setProposalNotes(e.target.value)}
                  className="min-h-[120px] bg-card border-border resize-none"
                />
              </div>
              
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
                    <span className="text-muted-foreground">Additional Documents:</span>
                    <span className={uploadedDocs.filter(d => d.status === 'done').length > 0 ? "text-green-400" : "text-muted-foreground"}>
                      {uploadedDocs.filter(d => d.status === 'done').length > 0 
                        ? `${uploadedDocs.filter(d => d.status === 'done').length} file(s) uploaded` 
                        : "Not provided"}
                    </span>
                  </div>
                  {cableRunDistance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cable Run:</span>
                      <span>{cableRunDistance}m — {phaseType}</span>
                    </div>
                  )}
                  {proposalNotes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notes:</span>
                      <span className="text-green-400">Added</span>
                    </div>
                  )}
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
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Create Proposal
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Elite Smart Energy Solutions - Architect George Fotopoulos
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
                  id="hasSolarNew"
                  checked={newCustomer.hasSolarNew}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasSolarNew: !!c }))}
                />
                <label htmlFor="hasSolarNew" className="text-sm flex items-center gap-1.5 cursor-pointer">
                  <span style={{color: '#46B446'}}>&#9728;</span> Has Solar PV &lt;5yrs
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasSolarOld"
                  checked={newCustomer.hasSolarOld}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasSolarOld: !!c }))}
                />
                <label htmlFor="hasSolarOld" className="text-sm flex items-center gap-1.5 cursor-pointer">
                  <span style={{color: '#F59E0B'}}>&#9728;</span> Has Solar PV &gt;5yrs
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasPool"
                  checked={newCustomer.hasPool}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasPool: !!c }))}
                />
                <label htmlFor="hasPool" className="text-sm cursor-pointer">Has Pool</label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="hasEV"
                  checked={newCustomer.hasEV}
                  onCheckedChange={(c) => setNewCustomer(p => ({ ...p, hasEV: !!c }))}
                />
                <label htmlFor="hasEV" className="text-sm cursor-pointer">Has EV / EV Charger</label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newCustomer.notes}
                onChange={(e) => setNewCustomer(p => ({ ...p, notes: e.target.value }))}
                placeholder="Any additional notes about the customer..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowNewCustomerDialog(false)}>Cancel</Button>
              <Button
                onClick={() => createCustomer.mutate(newCustomer)}
                disabled={!newCustomer.fullName || !newCustomer.address || createCustomer.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {createCustomer.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StepIndicator({ step, currentStep, label }: { step: number; currentStep: number; label: string }) {
  const isCompleted = currentStep > step;
  const isActive = currentStep === step;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        isCompleted 
          ? 'bg-primary text-primary-foreground' 
          : isActive 
            ? 'border-2 border-primary text-primary' 
            : 'border-2 border-border text-muted-foreground'
      }`}>
        {isCompleted ? <CheckCircle className="h-5 w-5" /> : step}
      </div>
      <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}
