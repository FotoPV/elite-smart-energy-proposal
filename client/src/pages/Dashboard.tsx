import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  PlusCircle,
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentProposals, isLoading: proposalsLoading } = trpc.dashboard.recentProposals.useQuery();
  const { data: recentCustomers, isLoading: customersLoading } = trpc.dashboard.recentCustomers.useQuery();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="lightning-text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to the Lightning Energy Proposal Generator
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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers ?? 0}
            icon={Users}
            loading={statsLoading}
          />
          <StatCard
            title="Total Proposals"
            value={stats?.totalProposals ?? 0}
            icon={FileText}
            loading={statsLoading}
          />
          <StatCard
            title="Draft Proposals"
            value={stats?.draftProposals ?? 0}
            icon={Clock}
            loading={statsLoading}
            accent
          />
          <StatCard
            title="Generated"
            value={stats?.generatedProposals ?? 0}
            icon={CheckCircle}
            loading={statsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <QuickActionCard
            title="Create Proposal"
            description="Start a new electrification proposal for a customer"
            icon={Zap}
            onClick={() => setLocation("/proposals/new")}
          />
          <QuickActionCard
            title="Add Customer"
            description="Add a new customer to the system"
            icon={Users}
            onClick={() => setLocation("/customers")}
          />
          <QuickActionCard
            title="View Analytics"
            description="See proposal performance and trends"
            icon={TrendingUp}
            onClick={() => setLocation("/settings")}
            disabled
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Proposals */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Proposals</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/proposals")}
                className="text-primary hover:text-primary/80"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {proposalsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentProposals && recentProposals.length > 0 ? (
                <div className="space-y-3">
                  {recentProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => setLocation(`/proposals/${proposal.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{proposal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`status-badge ${proposal.status}`}>
                        {proposal.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No proposals yet</p>
                  <Button 
                    variant="link" 
                    className="text-primary mt-2"
                    onClick={() => setLocation("/proposals/new")}
                  >
                    Create your first proposal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Customers */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Customers</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/customers")}
                className="text-primary hover:text-primary/80"
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentCustomers && recentCustomers.length > 0 ? (
                <div className="space-y-3">
                  {recentCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => setLocation(`/customers/${customer.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{customer.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.state} • {customer.address.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No customers yet</p>
                  <Button 
                    variant="link" 
                    className="text-primary mt-2"
                    onClick={() => setLocation("/customers")}
                  >
                    Add your first customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          COPYRIGHT Lightning Energy - Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading,
  accent = false
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  loading?: boolean;
  accent?: boolean;
}) {
  return (
    <Card className={`bg-card border-border relative overflow-hidden ${accent ? 'border-l-2 border-l-accent' : 'border-l-2 border-l-primary'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1">{value}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent ? 'bg-accent/10' : 'bg-primary/10'}`}>
            <Icon className={`h-6 w-6 ${accent ? 'text-accent' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Card Component
function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Card 
      className={`bg-card border-border cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            {disabled && (
              <span className="text-xs text-accent mt-2 inline-block">Coming soon</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
