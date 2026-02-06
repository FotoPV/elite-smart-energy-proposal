import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { 
  Users, 
  Search, 
  PlusCircle,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  Trash2,
  Edit,
  FileText
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const AUSTRALIAN_STATES = ["VIC", "NSW", "QLD", "SA", "WA", "TAS", "NT", "ACT"];

export default function Customers() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: customers, isLoading, refetch } = trpc.customers.list.useQuery({ search: searchTerm });
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      toast.success("Customer created successfully");
      setIsAddDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    }
  });
  const deleteCustomer = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success("Customer deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    }
  });

  const handleCreateCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createCustomer.mutate({
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      address: formData.get("address") as string,
      state: formData.get("state") as string,
      hasGas: formData.get("hasGas") === "on",
      hasPool: formData.get("hasPool") === "on",
      hasEV: formData.get("hasEV") === "on",
      hasExistingSolar: formData.get("hasExistingSolar") === "on",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="lightning-text-gradient">Customers</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer database
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="lightning-button-primary">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" name="fullName" required placeholder="John Smith" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="0400 000 000" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input id="address" name="address" required placeholder="123 Main St, Melbourne" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select name="state" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUSTRALIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <Label>Optional Information</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasGas" name="hasGas" />
                        <Label htmlFor="hasGas" className="text-sm font-normal">Has Gas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasPool" name="hasPool" />
                        <Label htmlFor="hasPool" className="text-sm font-normal">Has Pool</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasEV" name="hasEV" />
                        <Label htmlFor="hasEV" className="text-sm font-normal">Has EV</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="hasExistingSolar" name="hasExistingSolar" />
                        <Label htmlFor="hasExistingSolar" className="text-sm font-normal">Has Solar</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="lightning-button-primary" disabled={createCustomer.isPending}>
                    {createCustomer.isPending ? "Creating..." : "Create Customer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Customer List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card 
                key={customer.id} 
                className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setLocation(`/customers/${customer.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{customer.fullName}</CardTitle>
                        <span className="text-xs text-muted-foreground">{customer.state}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/customers/${customer.id}`);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/proposals/new?customerId=${customer.id}`);
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          Create Proposal
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Are you sure you want to delete this customer?")) {
                              deleteCustomer.mutate({ id: customer.id });
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{customer.address}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {customer.hasGas && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">Gas</span>
                    )}
                    {customer.hasPool && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Pool</span>
                    )}
                    {customer.hasEV && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400">EV</span>
                    )}
                    {customer.hasExistingSolar && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400">Solar</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm ? "Try a different search term" : "Add your first customer to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)} className="lightning-button-primary">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              )}
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
