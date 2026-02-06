import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { 
  ArrowLeft,
  Save,
  FileText,
  Upload,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Zap,
  Flame
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AUSTRALIAN_STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export default function CustomerDetail() {
  const params = useParams<{ id: string }>();
  const customerId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: customer, isLoading, refetch } = trpc.customers.get.useQuery(
    { id: customerId },
    { enabled: customerId > 0 }
  );
  const { data: bills, refetch: refetchBills } = trpc.bills.listByCustomer.useQuery(
    { customerId },
    { enabled: customerId > 0 }
  );
  const { data: proposals } = trpc.proposals.getByCustomer.useQuery(
    { customerId },
    { enabled: customerId > 0 }
  );
  
  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: () => {
      toast.success("Customer updated");
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  const uploadBill = trpc.bills.upload.useMutation({
    onSuccess: async (data) => {
      toast.success("Bill uploaded, extracting data...");
      await extractBill.mutateAsync({ billId: data.id });
      refetchBills();
    },
    onError: (error) => toast.error(error.message)
  });

  const extractBill = trpc.bills.extract.useMutation({
    onSuccess: () => {
      toast.success("Bill data extracted successfully");
      refetchBills();
    },
    onError: (error) => toast.error(`Extraction failed: ${error.message}`)
  });

  const deleteBill = trpc.bills.delete.useMutation({
    onSuccess: () => {
      toast.success("Bill deleted");
      refetchBills();
    }
  });

  const handleFileUpload = async (billType: 'electricity' | 'gas', file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      await uploadBill.mutateAsync({
        customerId,
        billType,
        fileData: base64,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateCustomer.mutate({
      id: customerId,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string,
      state: formData.get("state") as string,
      hasGas: formData.get("hasGas") === "on",
      hasPool: formData.get("hasPool") === "on",
      poolVolume: formData.get("poolVolume") ? parseInt(formData.get("poolVolume") as string) : undefined,
      hasEV: formData.get("hasEV") === "on",
      evInterest: formData.get("evInterest") as 'none' | 'interested' | 'owns' || undefined,
      hasExistingSolar: formData.get("hasExistingSolar") === "on",
      existingSolarSize: formData.get("existingSolarSize") ? parseFloat(formData.get("existingSolarSize") as string) : undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

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

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">Customer not found</h2>
          <Button onClick={() => setLocation("/customers")} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {customer.fullName}
            </h1>
            <p className="text-muted-foreground">{customer.state} • {customer.address}</p>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="bills">Bills ({bills?.length || 0})</TabsTrigger>
            <TabsTrigger value="proposals">Proposals ({proposals?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <form onSubmit={handleSave}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" name="fullName" defaultValue={customer.fullName} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select name="state" defaultValue={customer.state}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUSTRALIAN_STATES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" defaultValue={customer.email || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={customer.phone || ""} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" defaultValue={customer.address} required />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Property Details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasGas" name="hasGas" defaultChecked={customer.hasGas || false} />
                        <Label htmlFor="hasGas">Has Gas Connection</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasPool" name="hasPool" defaultChecked={customer.hasPool || false} />
                        <Label htmlFor="hasPool">Has Pool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasEV" name="hasEV" defaultChecked={customer.hasEV || false} />
                        <Label htmlFor="hasEV">Has Electric Vehicle</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasExistingSolar" name="hasExistingSolar" defaultChecked={customer.hasExistingSolar || false} />
                        <Label htmlFor="hasExistingSolar">Has Existing Solar</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" name="notes" defaultValue={customer.notes || ""} rows={4} />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="submit" className="lightning-button-primary" disabled={updateCustomer.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      {updateCustomer.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Electricity Bill */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Electricity Bill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bills?.find(b => b.billType === 'electricity') ? (
                    <div className="space-y-4">
                      {bills.filter(b => b.billType === 'electricity').map(bill => (
                        <div key={bill.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{bill.fileName}</p>
                              <p className="text-sm text-muted-foreground">{bill.retailer || "Processing..."}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteBill.mutate({ id: bill.id })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          {bill.totalUsageKwh && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Usage:</span>
                                <span className="ml-2">{bill.totalUsageKwh} kWh</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="ml-2">${bill.totalAmount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('electricity', file);
                        }}
                      />
                      <Button variant="outline" onClick={() => document.getElementById('electricity-upload')?.click()}>
                        Select File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gas Bill */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-accent" />
                    Gas Bill
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bills?.find(b => b.billType === 'gas') ? (
                    <div className="space-y-4">
                      {bills.filter(b => b.billType === 'gas').map(bill => (
                        <div key={bill.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{bill.fileName}</p>
                              <p className="text-sm text-muted-foreground">{bill.retailer || "Processing..."}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteBill.mutate({ id: bill.id })}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          {bill.gasUsageMj && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Usage:</span>
                                <span className="ml-2">{bill.gasUsageMj} MJ</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="ml-2">${bill.totalAmount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">Upload gas bill (PDF)</p>
                      <Input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        id="gas-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('gas', file);
                        }}
                      />
                      <Button variant="outline" onClick={() => document.getElementById('gas-upload')?.click()}>
                        Select File
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Proposals</CardTitle>
                <Button 
                  onClick={() => setLocation(`/proposals/new?customerId=${customerId}`)}
                  className="lightning-button-primary"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New Proposal
                </Button>
              </CardHeader>
              <CardContent>
                {proposals && proposals.length > 0 ? (
                  <div className="space-y-3">
                    {proposals.map(proposal => (
                      <div
                        key={proposal.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => setLocation(`/proposals/${proposal.id}`)}
                      >
                        <div>
                          <p className="font-medium">{proposal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`status-badge ${proposal.status}`}>{proposal.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No proposals yet for this customer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
