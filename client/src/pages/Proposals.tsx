import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { 
  FileText, 
  Search, 
  PlusCircle,
  Calendar,
  MoreVertical,
  Trash2,
  Eye,
  Download,
  Filter
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
import { toast } from "sonner";

export default function Proposals() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: proposals, isLoading, refetch } = trpc.proposals.list.useQuery({
    search: searchTerm,
    status: statusFilter === "all" ? undefined : statusFilter
  });
  
  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposal deleted");
      refetch();
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="lightning-text-gradient">Proposals</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage electrification proposals
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/proposals/new")}
            className="lightning-button-primary"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Proposal
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="calculating">Calculating</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <Card 
                key={proposal.id} 
                className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setLocation(`/proposals/${proposal.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{proposal.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </span>
                          {proposal.slideCount && (
                            <span>{proposal.slideCount} slides</span>
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
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {proposal.status === 'generated' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toast.info("Export feature coming soon");
                            }}>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this proposal?")) {
                                deleteProposal.mutate({ id: proposal.id });
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first proposal to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setLocation("/proposals/new")} className="lightning-button-primary">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Proposal
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
