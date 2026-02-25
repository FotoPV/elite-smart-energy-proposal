import DashboardLayout from "@/components/DashboardLayout";
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
      toast.success("Proposal moved to bin");
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
            <h1 className="text-3xl uppercase tracking-tight text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
              Proposals
            </h1>
            <p className="text-xs uppercase tracking-[0.15em] mt-1" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, color: '#808285' }}>
              All processed customer proposals
            </p>
          </div>
          <button 
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all"
            style={{ 
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              backgroundColor: '#00EAD3',
              color: '#000000'
            }}
          >
            <PlusCircle className="h-4 w-4" />
            NEW PROPOSAL
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#808285' }} />
            <Input
              placeholder="Search proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              style={{ fontFamily: "'Open Sans', sans-serif" }}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="calculating">Calculating</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
              <SelectItem value="exported">Exported</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : proposals && proposals.length > 0 ? (
          <div className="space-y-2">
            {proposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all group"
                style={{ 
                  border: '1px solid rgba(128,130,133,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.02)'
                }}
                onClick={() => setLocation(`/proposals/${proposal.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,234,211,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(128,130,133,0.2)';
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(0,234,211,0.3)' }}>
                    <FileText className="h-5 w-5" style={{ color: '#00EAD3' }} />
                  </div>
                  <div>
                    <p className="text-sm text-white" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                      {proposal.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                        <Calendar className="h-3 w-3" />
                        {new Date(proposal.createdAt).toLocaleDateString('en-AU')}
                      </span>
                      {proposal.slideCount && (
                        <span className="text-xs" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
                          {proposal.slideCount} slides
                        </span>
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
                      }} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Move this proposal to the bin?")) {
                            deleteProposal.mutate({ id: proposal.id });
                          }
                        }}
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Move to Bin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ border: '1px solid rgba(128,130,133,0.15)' }}>
            <FileText className="h-16 w-16 mb-4" style={{ color: '#808285', opacity: 0.3 }} />
            <h3 className="text-base text-white mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800 }}>
              {searchTerm || statusFilter !== "all" ? "No matching proposals" : "No proposals yet"}
            </h3>
            <p className="text-sm text-center mb-6" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285' }}>
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Create your first proposal to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <button 
                onClick={() => setLocation("/proposals/new")} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, backgroundColor: '#00EAD3', color: '#000000' }}
              >
                <PlusCircle className="mr-1 h-4 w-4" />
                NEW PROPOSAL
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] pt-4" style={{ fontFamily: "'Open Sans', sans-serif", color: '#808285', borderTop: '1px solid rgba(128,130,133,0.2)' }}>
          © Elite Smart Energy Solutions — Architect [Consultant Name]
        </div>
      </div>
    </DashboardLayout>
  );
}
