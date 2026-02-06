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
  Loader2
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
  
  const { data: customers } = trpc.customers.list.useQuery({});
  const { data: selectedCustomer } = trpc.customers.get.useQuery(
    { id: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );
  const { data: existingBills, refetch: refetchBills } = trpc.bills.listByCustomer.useQuery(
    { customerId: selectedCustomerId || 0 },
    { enabled: !!selectedCustomerId }
  );
  
  const uploadBill = trpc.bills.upload.useMutation();
  const extractBill = trpc.bills.extract.useMutation();
  const createProposal = trpc.proposals.create.useMutation({
    onSuccess: (data) => {
      toast.success("Proposal created");
      setLocation(`/proposals/${data.id}`);
    },
    onError: (error) => toast.error(error.message)
  });

  // Auto-select existing bills
  useEffect(() => {
    if (existingBills) {
      const elecBill = existingBills.find(b => b.billType === 'electricity');
      const gasBill = existingBills.find(b => b.billType === 'gas');
      if (elecBill) setElectricityBillId(elecBill.id);
      if (gasBill) setGasBillId(gasBill.id);
    }
  }, [existingBills]);

  // Auto-set proposal title
  useEffect(() => {
    if (selectedCustomer && !proposalTitle) {
      setProposalTitle(`Electrification Proposal for ${selectedCustomer.fullName}`);
    }
  }, [selectedCustomer, proposalTitle]);

  const handleFileUpload = async (billType: 'electricity' | 'gas', file: File) => {
    if (!selectedCustomerId) return;
    
    setIsUploading(true);
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
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload bill");
      setIsUploading(false);
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
                  className="lightning-button-primary"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload Bills */}
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
                      {isUploading ? (
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
                      {isUploading ? (
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
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!electricityBillId}
                  className="lightning-button-primary"
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
                  className="lightning-button-primary"
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
