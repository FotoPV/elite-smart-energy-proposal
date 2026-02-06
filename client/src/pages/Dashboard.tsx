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
  TrendingUp,
  Eye,
  Timer,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Globe
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentProposals, isLoading: proposalsLoading } = trpc.dashboard.recentProposals.useQuery();
  const { data: recentCustomers, isLoading: customersLoading } = trpc.dashboard.recentCustomers.useQuery();
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.getAggregateAnalytics.useQuery();
  const { data: expiringTokens, isLoading: expiringLoading } = trpc.analytics.getExpiringTokens.useQuery({ daysUntilExpiry: 7 });

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="h-3.5 w-3.5" />;
      case 'tablet': return <Tablet className="h-3.5 w-3.5" />;
      case 'desktop': return <Monitor className="h-3.5 w-3.5" />;
      default: return <Globe className="h-3.5 w-3.5" />;
    }
  };

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

        {/* Expiry Notifications Banner */}
        {!expiringLoading && expiringTokens && expiringTokens.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-400 text-sm">Expiring Proposal Links</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {expiringTokens.length} shared proposal link{expiringTokens.length > 1 ? 's' : ''} {expiringTokens.some(t => t.isExpired) ? 'have expired or are' : 'are'} expiring soon.
                  Customers who haven't viewed their proposals may lose access.
                </p>
                <div className="mt-3 space-y-2">
                  {expiringTokens.slice(0, 3).map((token) => (
                    <div 
                      key={token.tokenId} 
                      className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2 cursor-pointer hover:bg-background/80 transition-colors"
                      onClick={() => setLocation(`/proposals/${token.proposalId}`)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Proposal #{token.proposalId}</span>
                        {token.viewCount === 0 && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Never viewed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {token.isExpired ? (
                          <span className="text-xs text-red-400 font-medium">Expired</span>
                        ) : (
                          <span className="text-xs text-amber-400 font-medium">{token.daysRemaining} day{token.daysRemaining !== 1 ? 's' : ''} left</span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/proposals/${token.proposalId}`);
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ))}
                  {expiringTokens.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{expiringTokens.length - 3} more expiring links
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Analytics Overview */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" />
              Engagement Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : analytics && analytics.totalViews > 0 ? (
              <div className="space-y-6">
                {/* Analytics Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold font-mono">{analytics.totalViews}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unique Visitors</p>
                        <p className="text-2xl font-bold font-mono">{analytics.uniqueVisitors}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Timer className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg. Duration</p>
                        <p className="text-2xl font-bold font-mono">{formatDuration(analytics.avgDurationSeconds)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Proposals Viewed</p>
                        <p className="text-2xl font-bold font-mono">{analytics.totalProposalsViewed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Proposals & Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Top Proposals by Engagement */}
                  {analytics.topProposals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Top Proposals by Views</h4>
                      <div className="space-y-2">
                        {analytics.topProposals.map((proposal, index) => (
                          <div 
                            key={proposal.proposalId}
                            className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/30 transition-colors"
                            onClick={() => setLocation(`/proposals/${proposal.proposalId}`)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-primary w-5 text-center">#{index + 1}</span>
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">{proposal.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Avg. {formatDuration(proposal.avgDuration)} per view
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-bold font-mono">{proposal.viewCount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity Feed */}
                  {analytics.recentActivity.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Recent Activity</h4>
                      <div className="space-y-2">
                        {analytics.recentActivity.slice(0, 5).map((activity) => (
                          <div 
                            key={activity.id}
                            className="flex items-center justify-between bg-background rounded-lg px-4 py-3 border border-border cursor-pointer hover:border-primary/30 transition-colors"
                            onClick={() => setLocation(`/proposals/${activity.proposalId}`)}
                          >
                            <div className="flex items-center gap-3">
                              {getDeviceIcon(activity.deviceType || 'unknown')}
                              <div>
                                <p className="text-sm font-medium truncate max-w-[180px]">
                                  {(activity as any).proposalTitle || `Proposal #${activity.proposalId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {activity.browser || 'Unknown'} on {activity.os || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-mono">{formatDuration(activity.durationSeconds || 0)}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.viewedAt ? new Date(activity.viewedAt).toLocaleDateString('en-AU', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                }) : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Views Trend (Last 7 Days) */}
                {analytics.viewsTrend.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Views Last 7 Days</h4>
                    <div className="flex items-end gap-1 h-24">
                      {analytics.viewsTrend.map((day) => {
                        const maxCount = Math.max(...analytics.viewsTrend.map(d => d.count), 1);
                        const height = Math.max((day.count / maxCount) * 100, 8);
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-mono text-primary">{day.count}</span>
                            <div 
                              className="w-full rounded-t-lg bg-gradient-to-t from-primary/60 to-primary transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(day.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No engagement data yet</p>
                <p className="text-xs mt-1">Share proposals with customers to start tracking views and engagement</p>
              </div>
            )}
          </CardContent>
        </Card>

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
            title="View All Proposals"
            description="Browse and manage all your proposals"
            icon={TrendingUp}
            onClick={() => setLocation("/proposals")}
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
