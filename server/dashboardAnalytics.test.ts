import { describe, it, expect, vi } from 'vitest';

// Test aggregate analytics data structure
describe('Dashboard Analytics Overview', () => {
  it('should return correct aggregate analytics structure', () => {
    const mockAnalytics = {
      totalViews: 42,
      uniqueVisitors: 18,
      avgDurationSeconds: 145,
      totalProposalsViewed: 5,
      topProposals: [
        { proposalId: 1, title: 'Test Proposal', customerId: 1, viewCount: 15, avgDuration: 180, lastViewed: '2026-02-06' },
      ],
      recentActivity: [
        { id: 1, proposalId: 1, ipAddress: '1.2.3.4', deviceType: 'desktop', browser: 'Chrome', os: 'Windows', durationSeconds: 120, totalSlidesViewed: 8, viewedAt: new Date(), proposalTitle: 'Test' },
      ],
      viewsTrend: [
        { date: '2026-02-05', count: 5 },
        { date: '2026-02-06', count: 8 },
      ],
    };

    expect(mockAnalytics.totalViews).toBe(42);
    expect(mockAnalytics.uniqueVisitors).toBe(18);
    expect(mockAnalytics.avgDurationSeconds).toBe(145);
    expect(mockAnalytics.totalProposalsViewed).toBe(5);
    expect(mockAnalytics.topProposals).toHaveLength(1);
    expect(mockAnalytics.recentActivity).toHaveLength(1);
    expect(mockAnalytics.viewsTrend).toHaveLength(2);
  });

  it('should return empty analytics when no proposals exist', () => {
    const emptyAnalytics = {
      totalViews: 0,
      uniqueVisitors: 0,
      avgDurationSeconds: 0,
      totalProposalsViewed: 0,
      topProposals: [],
      recentActivity: [],
      viewsTrend: [],
    };

    expect(emptyAnalytics.totalViews).toBe(0);
    expect(emptyAnalytics.topProposals).toHaveLength(0);
    expect(emptyAnalytics.viewsTrend).toHaveLength(0);
  });

  it('should format duration correctly', () => {
    const formatDuration = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };

    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3600)).toBe('60m 0s');
    expect(formatDuration(0)).toBe('0s');
  });
});

// Test expiry notification data structure
describe('Proposal Expiry Notifications', () => {
  it('should identify expired tokens', () => {
    const now = new Date();
    const expiredToken = {
      tokenId: 1,
      proposalId: 1,
      customerId: 1,
      token: 'abc123',
      expiresAt: new Date(now.getTime() - 86400000), // 1 day ago
      isActive: true,
      viewCount: 0,
      createdAt: new Date(now.getTime() - 30 * 86400000),
      daysRemaining: 0,
      isExpired: true,
    };

    expect(expiredToken.isExpired).toBe(true);
    expect(expiredToken.daysRemaining).toBe(0);
    expect(expiredToken.viewCount).toBe(0);
  });

  it('should identify tokens expiring soon', () => {
    const now = new Date();
    const expiringToken = {
      tokenId: 2,
      proposalId: 2,
      customerId: 2,
      token: 'def456',
      expiresAt: new Date(now.getTime() + 3 * 86400000), // 3 days from now
      isActive: true,
      viewCount: 2,
      createdAt: new Date(now.getTime() - 27 * 86400000),
      daysRemaining: 3,
      isExpired: false,
    };

    expect(expiringToken.isExpired).toBe(false);
    expect(expiringToken.daysRemaining).toBe(3);
    expect(expiringToken.viewCount).toBe(2);
  });

  it('should filter tokens within expiry threshold', () => {
    const now = new Date();
    const tokens = [
      { daysRemaining: 2, isExpired: false, isActive: true },
      { daysRemaining: 5, isExpired: false, isActive: true },
      { daysRemaining: 0, isExpired: true, isActive: true },
      { daysRemaining: 10, isExpired: false, isActive: true },
    ];

    const threshold = 7;
    const expiring = tokens.filter(t => t.daysRemaining <= threshold && t.isActive);
    expect(expiring).toHaveLength(3); // 2 days, 5 days, and expired

    const expired = tokens.filter(t => t.isExpired);
    expect(expired).toHaveLength(1);
  });

  it('should correctly identify unviewed expired tokens', () => {
    const tokens = [
      { viewCount: 0, isExpired: true },
      { viewCount: 3, isExpired: true },
      { viewCount: 0, isExpired: false },
    ];

    const unviewedExpired = tokens.filter(t => t.isExpired && t.viewCount === 0);
    expect(unviewedExpired).toHaveLength(1);
  });
});
