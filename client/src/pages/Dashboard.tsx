import DashboardLayout from "@/components/DashboardLayout";
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
        {/* Header - matching slide heading style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl uppercase tracking-tight text-white" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800 }}>
              Dashboard
            </h1>
            <p className="text-[#00EAD3] uppercase tracking-[0.2em] text-sm mt-1" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600 }}>
              Lightning Energy Proposal Generator
            </p>
          </div>
          <button 
            onClick={() => setLocation("/proposals/new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ 
              fontFamily: "'Urbanist', sans-serif",
              backgroundColor: '#00EAD3',
              color: '#000000'
            }}
          >
            <PlusCircle className="h-4 w-4" />
            NEW PROPOSAL
          </button>
        </div>

        {/* Expiry Notifications Banner */}
        {!expiringLoading && expiringTokens && expiringTokens.length > 0 && (
          <div className="rounded-xl p-4" style={{ border: '1px solid rgba(255, 107, 53, 0.4)', backgroundColor: 'rgba(255, 107, 53, 0.05)' }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#FF6B35' }} />
              <div className="flex-1">
                <h3 className="text-sm uppercase tracking-wider" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#FF6B35' }}>
                  Expiring Proposal Links
                </h3>
                <p className="text-xs mt-1" style={{ fontFamily: "'GeneralSans', sans-serif", color: '#808285' }}>
                  {expiringTokens.length} shared proposal link{expiringTokens.length > 1 ? 's' : ''} {expiringTokens.some(t => t.isExpired) ? 'have expired or are' : 'are'} expiring soon.
                </p>
                <div className="mt-3 space-y-2">
                  {expiringTokens.slice(0, 3).map((token) => (
                    <div 
                      key={token.tokenId} 
                      className="flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-colors"
                      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(128,130,133,0.2)' }}
                      onClick={() => setLocation(`/proposals/${token.proposalId}`)}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" style={{ color: '#808285' }} />
                        <span className="text-sm text-white" style={{ fontFamily: "'GeneralSans', sans-serif" }}>Proposal #{token.proposalId}</span>
                        {token.viewCount === 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,107,53,0.15)', color: '#FF6B35' }}>Never viewed</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {token.isExpired ? (
                          <span className="text-xs font-medium" style={{ color: '#FF6B35' }}>Expired</span>
                        ) : (
                          <span className="text-xs font-medium" style={{ color: '#FF6B35' }}>{token.daysRemaining} day{token.daysRemaining !== 1 ? 's' : ''} left</span>
                        )}
                        <button
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
                          style={{ fontFamily: "'Urbanist', sans-serif", color: '#808285' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/proposals/${token.proposalId}`);
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  ))}
                  {expiringTokens.length > 3 && (
                    <p className="text-xs text-center" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
                      +{expiringTokens.length - 3} more expiring links
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid - thin aqua borders, grey labels uppercase, aqua values */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="TOTAL CUSTOMERS" value={stats?.totalCustomers ?? 0} icon={Users} loading={statsLoading} />
          <StatCard title="TOTAL PROPOSALS" value={stats?.totalProposals ?? 0} icon={FileText} loading={statsLoading} />
          <StatCard title="DRAFT PROPOSALS" value={stats?.draftProposals ?? 0} icon={Clock} loading={statsLoading} variant="orange" />
          <StatCard title="GENERATED" value={stats?.generatedProposals ?? 0} icon={CheckCircle} loading={statsLoading} />
        </div>

        {/* Engagement Analytics - thin aqua border card, no solid fills */}
        <div className="rounded-xl p-6" style={{ border: '1px solid rgba(0,234,211,0.3)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5" style={{ color: '#00EAD3' }} />
            <h2 className="text-lg uppercase tracking-tight text-white" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800 }}>
              Engagement Analytics
            </h2>
          </div>
          
          {analyticsLoading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : analytics && analytics.totalViews > 0 ? (
            <div className="space-y-6">
              {/* Analytics Metrics - thin bordered cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <MetricCard label="TOTAL VIEWS" value={String(analytics.totalViews)} icon={Eye} />
                <MetricCard label="UNIQUE VISITORS" value={String(analytics.uniqueVisitors)} icon={Users} />
                <MetricCard label="AVG. DURATION" value={formatDuration(analytics.avgDurationSeconds)} icon={Timer} />
                <MetricCard label="PROPOSALS VIEWED" value={String(analytics.totalProposalsViewed)} icon={FileText} />
              </div>

              {/* Top Proposals & Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                {analytics.topProposals.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.15em] mb-3" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
                      Top Proposals by Views
                    </h4>
                    <div className="space-y-2">
                      {analytics.topProposals.map((proposal, index) => (
                        <div 
                          key={proposal.proposalId}
                          className="flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all"
                          style={{ border: '1px solid rgba(128,130,133,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                          onClick={() => setLocation(`/proposals/${proposal.proposalId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold w-5 text-center" style={{ color: '#00EAD3', fontFamily: "'GeneralSans', sans-serif" }}>#{index + 1}</span>
                            <div>
                              <p className="text-sm text-white truncate max-w-[200px]" style={{ fontFamily: "'GeneralSans', sans-serif" }}>{proposal.title}</p>
                              <p className="text-xs" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
                                Avg. {formatDuration(proposal.avgDuration)} per view
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5" style={{ color: '#808285' }} />
                            <span className="text-sm font-bold" style={{ color: '#00EAD3', fontFamily: "'GeneralSans', sans-serif" }}>{proposal.viewCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.recentActivity.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase tracking-[0.15em] mb-3" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
                      Recent Activity
                    </h4>
                    <div className="space-y-2">
                      {analytics.recentActivity.slice(0, 5).map((activity) => (
                        <div 
                          key={activity.id}
                          className="flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all"
                          style={{ border: '1px solid rgba(128,130,133,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                          onClick={() => setLocation(`/proposals/${activity.proposalId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span style={{ color: '#808285' }}>{getDeviceIcon(activity.deviceType || 'unknown')}</span>
                            <div>
                              <p className="text-sm text-white truncate max-w-[180px]" style={{ fontFamily: "'GeneralSans', sans-serif" }}>
                                {(activity as any).proposalTitle || `Proposal #${activity.proposalId}`}
                              </p>
                              <p className="text-xs" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
                                {activity.browser || 'Unknown'} on {activity.os || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm" style={{ color: '#00EAD3', fontFamily: "'GeneralSans', sans-serif" }}>{formatDuration(activity.durationSeconds || 0)}</p>
                            <p className="text-xs" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
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
                  <h4 className="text-xs uppercase tracking-[0.15em] mb-3" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
                    Views Last 7 Days
                  </h4>
                  <div className="flex items-end gap-1 h-24">
                    {analytics.viewsTrend.map((day) => {
                      const maxCount = Math.max(...analytics.viewsTrend.map(d => d.count), 1);
                      const height = Math.max((day.count / maxCount) * 100, 8);
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs" style={{ color: '#00EAD3', fontFamily: "'GeneralSans', sans-serif" }}>{day.count}</span>
                          <div 
                            className="w-full rounded-t-lg transition-all duration-500"
                            style={{ height: `${height}%`, backgroundColor: '#00EAD3', opacity: 0.7 }}
                          />
                          <span className="text-[10px]" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
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
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto mb-3" style={{ color: '#808285', opacity: 0.3 }} />
              <p style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>No engagement data yet</p>
              <p className="text-xs mt-1" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>Share proposals with customers to start tracking views</p>
            </div>
          )}
        </div>

        {/* Quick Actions - thin grey borders */}
        <div className="grid gap-4 md:grid-cols-3">
          <QuickActionCard
            title="CREATE PROPOSAL"
            description="Start a new electrification proposal for a customer"
            icon={Zap}
            onClick={() => setLocation("/proposals/new")}
          />
          <QuickActionCard
            title="ADD CUSTOMER"
            description="Add a new customer to the system"
            icon={Users}
            onClick={() => setLocation("/customers")}
          />
          <QuickActionCard
            title="VIEW ALL PROPOSALS"
            description="Browse and manage all your proposals"
            icon={TrendingUp}
            onClick={() => setLocation("/proposals")}
          />
        </div>

        {/* Recent Activity - two column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Proposals */}
          <div className="rounded-xl p-6" style={{ border: '1px solid rgba(128,130,133,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base uppercase tracking-tight text-white" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800 }}>
                Recent Proposals
              </h3>
              <button 
                onClick={() => setLocation("/proposals")}
                className="flex items-center gap-1 text-xs uppercase tracking-wider transition-colors"
                style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {proposalsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentProposals && recentProposals.length > 0 ? (
              <div className="space-y-2">
                {recentProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                    style={{ border: '1px solid rgba(128,130,133,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    onClick={() => setLocation(`/proposals/${proposal.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(0,234,211,0.3)' }}>
                        <FileText className="h-5 w-5" style={{ color: '#00EAD3' }} />
                      </div>
                      <div>
                        <p className="text-sm text-white" style={{ fontFamily: "'GeneralSans', sans-serif" }}>{proposal.title}</p>
                        <p className="text-xs" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
                          {new Date(proposal.createdAt).toLocaleDateString('en-AU')}
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
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: '#808285', opacity: 0.3 }} />
                <p style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>No proposals yet</p>
                <button 
                  className="text-xs mt-2 underline"
                  style={{ color: '#00EAD3', fontFamily: "'Urbanist', sans-serif" }}
                  onClick={() => setLocation("/proposals/new")}
                >
                  Create your first proposal
                </button>
              </div>
            )}
          </div>

          {/* Recent Customers */}
          <div className="rounded-xl p-6" style={{ border: '1px solid rgba(128,130,133,0.2)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base uppercase tracking-tight text-white" style={{ fontFamily: "'NextSphere', sans-serif", fontWeight: 800 }}>
                Recent Customers
              </h3>
              <button 
                onClick={() => setLocation("/customers")}
                className="flex items-center gap-1 text-xs uppercase tracking-wider transition-colors"
                style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#00EAD3' }}
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            {customersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentCustomers && recentCustomers.length > 0 ? (
              <div className="space-y-2">
                {recentCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                    style={{ border: '1px solid rgba(128,130,133,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                    onClick={() => setLocation(`/customers/${customer.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(128,130,133,0.3)' }}>
                        <Users className="h-5 w-5" style={{ color: '#808285' }} />
                      </div>
                      <div>
                        <p className="text-sm text-white" style={{ fontFamily: "'GeneralSans', sans-serif" }}>{customer.fullName}</p>
                        <p className="text-xs" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
                          {customer.state} • {customer.address.substring(0, 30)}...
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4" style={{ color: '#808285' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-3" style={{ color: '#808285', opacity: 0.3 }} />
                <p style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>No customers yet</p>
                <button 
                  className="text-xs mt-2 underline"
                  style={{ color: '#00EAD3', fontFamily: "'Urbanist', sans-serif" }}
                  onClick={() => setLocation("/customers")}
                >
                  Add your first customer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs pt-4" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif", borderTop: '1px solid rgba(128,130,133,0.2)' }}>
          COPYRIGHT Lightning Energy — Architect George Fotopoulos
        </div>
      </div>
    </DashboardLayout>
  );
}

/* Stat Card - thin aqua border, grey uppercase label, aqua value */
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  loading,
  variant = 'aqua'
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  loading: boolean;
  variant?: 'aqua' | 'orange';
}) {
  const borderColor = variant === 'orange' ? 'rgba(255,107,53,0.4)' : 'rgba(0,234,211,0.3)';
  const valueColor = variant === 'orange' ? '#FF6B35' : '#00EAD3';
  const iconColor = variant === 'orange' ? '#FF6B35' : '#00EAD3';
  
  return (
    <div 
      className="rounded-xl p-5 relative overflow-hidden transition-all"
      style={{ 
        border: `1px solid ${borderColor}`,
        backgroundColor: 'rgba(255,255,255,0.02)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.1em]" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-16 mt-2" />
          ) : (
            <p className="text-3xl mt-2" style={{ fontFamily: "'GeneralSans', sans-serif", fontWeight: 700, color: valueColor }}>
              {value}
            </p>
          )}
        </div>
        <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ border: `1px solid ${borderColor}` }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

/* Metric Card - for analytics section */
function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div 
      className="rounded-xl p-4 transition-all"
      style={{ 
        border: '1px solid rgba(128,130,133,0.2)',
        backgroundColor: 'rgba(255,255,255,0.02)'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ border: '1px solid rgba(0,234,211,0.2)' }}>
          <Icon className="h-5 w-5" style={{ color: '#00EAD3' }} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em]" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600, color: '#808285' }}>
            {label}
          </p>
          <p className="text-xl mt-0.5" style={{ fontFamily: "'GeneralSans', sans-serif", fontWeight: 700, color: '#00EAD3' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Quick Action Card - thin grey border, clean minimal */
function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <div 
      className="rounded-xl p-5 cursor-pointer transition-all"
      style={{ 
        border: '1px solid rgba(128,130,133,0.2)',
        backgroundColor: 'rgba(255,255,255,0.02)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,234,211,0.4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(128,130,133,0.2)';
      }}
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0" style={{ border: '1px solid rgba(0,234,211,0.3)' }}>
          <Icon className="h-5 w-5" style={{ color: '#00EAD3' }} />
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-wider text-white" style={{ fontFamily: "'Urbanist', sans-serif", fontWeight: 600 }}>
            {title}
          </h3>
          <p className="text-xs mt-1" style={{ color: '#808285', fontFamily: "'GeneralSans', sans-serif" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
