import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation, useSearch } from "wouter";
import { useState, useCallback, useEffect } from "react";
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
  Eye
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
} from "@/components/ui/dialog";

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
  
  // Document upload states
  const [switchboardPhotoUrl, setSwitchboardPhotoUrl] = useState<string | null>(null);
  const [solarProposalPdfUrl, setSolarProposalPdfUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { data: customers } = trpc.customers.list.useQuery({});
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
    if (existingDocuments) {
      const switchboard = existingDocuments.find(d => d.documentType === 'switchboard_photo');
      const solarPdf = existingDocuments.find(d => d.documentType === 'solar_proposal_pdf');
      if (switchboard) setSwitchboardPhotoUrl(switchboard.fileUrl);
      if (solarPdf) setSolarProposalPdfUrl(solarPdf.fileUrl);
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
        
        toast.success("Bill uploaded, extracting data...");
        
        try {
          await extractBill.mutateAsync({ billId: result.id });
          toast.success("Bill data extracted successfully");
        } catch (err) {
          toast.error("Extraction failed, you can manually enter data later");
        }
        
        if (billType === 'electricity') {
          setElectricityBillId(result.id);
        } else {
          setGasBillId(result.id);
        }
        
        refetchBills();
        setIsUploading(false);
        setUploadingType(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload bill");
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  const handleDocumentUpload = async (docType: 'switchboard_photo' | 'solar_proposal_pdf', file: File) => {
    if (!selectedCustomerId) return;
    
    setIsUploading(true);
    setUploadingType(docType);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await uploadDocument.mutateAsync({
          customerId: selectedCustomerId,
          documentType: docType,
          fileData: base64,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
        });
        
        toast.success(`${docType === 'switchboard_photo' ? 'Switchboard photo' : 'Solar proposal PDF'} uploaded`);
        
        if (docType === 'switchboard_photo') {
          setSwitchboardPhotoUrl(result.fileUrl);
        } else {
          setSolarProposalPdfUrl(result.fileUrl);
        }
        
        refetchDocuments();
        setIsUploading(false);
        setUploadingType(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload document");
      setIsUploading(false);
      setUploadingType(null);
    }
  };

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
              
              {selectedCustomer && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="font-medium">{selectedCustomer.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.address}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedCustomer.hasGas && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">Gas</span>
                    )}
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
                <Button variant="outline" onClick={() => setLocation("/customers")}>
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
                        if (file) handleFileUpload('electricity', file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('electricity-upload')?.click()}
                      disabled={isUploading}
                    >
                      {uploadingType === 'electricity' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Select File"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Gas Bill */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-accent" />
                  Gas Bill (Optional)
                </Label>
                {gasBillId ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">Gas bill uploaded</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Upload gas bill for electrification analysis</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="gas-upload"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('gas', file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('gas-upload')?.click()}
                      disabled={isUploading}
                    >
                      {uploadingType === 'gas' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Select File"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">ADDITIONAL DOCUMENTS (Optional)</h3>
              </div>

              {/* Switchboard Photo */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  Switchboard Photo (Optional)
                </Label>
                {switchboardPhotoUrl ? (
                  <div className="relative">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <img 
                        src={switchboardPhotoUrl} 
                        alt="Switchboard" 
                        className="h-20 w-20 object-cover rounded-lg cursor-pointer"
                        onClick={() => setPreviewUrl(switchboardPhotoUrl)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <span className="text-green-400 font-medium">Switchboard photo uploaded</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-muted-foreground"
                          onClick={() => setPreviewUrl(switchboardPhotoUrl)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Upload switchboard photo for assessment</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="switchboard-upload"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('switchboard_photo', file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('switchboard-upload')?.click()}
                      disabled={isUploading}
                    >
                      {uploadingType === 'switchboard_photo' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Select Photo"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Solar Proposal PDF */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <File className="h-4 w-4 text-accent" />
                  Solar Proposal PDF (Optional)
                </Label>
                {solarProposalPdfUrl ? (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <FileText className="h-10 w-10 text-accent" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-medium">Solar proposal PDF uploaded</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-muted-foreground"
                        onClick={() => window.open(solarProposalPdfUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">Upload existing solar proposal for reference</p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="solar-proposal-upload"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDocumentUpload('solar_proposal_pdf', file);
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('solar-proposal-upload')?.click()}
                      disabled={isUploading}
                    >
                      {uploadingType === 'solar_proposal_pdf' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Select PDF"
                      )}
                    </Button>
                  </div>
                )}
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
                    <span className="text-muted-foreground">Gas Bill:</span>
                    <span className={gasBillId ? "text-green-400" : "text-muted-foreground"}>
                      {gasBillId ? "Uploaded" : "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Switchboard Photo:</span>
                    <span className={switchboardPhotoUrl ? "text-green-400" : "text-muted-foreground"}>
                      {switchboardPhotoUrl ? "Uploaded" : "Not provided"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solar Proposal PDF:</span>
                    <span className={solarProposalPdfUrl ? "text-green-400" : "text-muted-foreground"}>
                      {solarProposalPdfUrl ? "Uploaded" : "Not provided"}
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
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Switchboard Photo</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img src={previewUrl} alt="Switchboard Preview" className="w-full h-auto rounded-lg" />
          )}
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
