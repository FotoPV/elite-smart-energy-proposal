import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getAccessTokenByToken: vi.fn(),
  getViewsBySessionId: vi.fn(),
  recordProposalView: vi.fn(),
  updateProposalView: vi.fn(),
  getProposalViewById: vi.fn(),
  getViewsByProposalId: vi.fn(),
  recordSlideEngagement: vi.fn(),
  updateSlideEngagement: vi.fn(),
  getExistingSlideEngagement: vi.fn(),
  getSlideEngagementByView: vi.fn(),
  getSlideEngagementByProposal: vi.fn(),
  getProposalAnalyticsSummary: vi.fn(),
}));

import * as db from './db';

const mockedDb = vi.mocked(db);

describe('Analytics Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordProposalView', () => {
    it('should record a new view with correct data', async () => {
      mockedDb.recordProposalView.mockResolvedValue(1);
      
      const viewData = {
        proposalId: 1,
        accessTokenId: 5,
        sessionId: 'test-session-123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        referrer: 'https://email.com',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        durationSeconds: 0,
        totalSlidesViewed: 0,
      };
      
      const viewId = await db.recordProposalView(viewData);
      
      expect(viewId).toBe(1);
      expect(mockedDb.recordProposalView).toHaveBeenCalledWith(viewData);
    });
  });

  describe('updateProposalView', () => {
    it('should update view duration and slides viewed', async () => {
      mockedDb.updateProposalView.mockResolvedValue(undefined);
      
      await db.updateProposalView(1, {
        durationSeconds: 120,
        totalSlidesViewed: 8,
        lastActivityAt: new Date(),
      });
      
      expect(mockedDb.updateProposalView).toHaveBeenCalledWith(1, expect.objectContaining({
        durationSeconds: 120,
        totalSlidesViewed: 8,
      }));
    });
  });

  describe('recordSlideEngagement', () => {
    it('should record slide engagement for a new slide view', async () => {
      mockedDb.recordSlideEngagement.mockResolvedValue(1);
      
      const engagement = {
        proposalId: 1,
        viewId: 1,
        sessionId: 'test-session-123',
        slideIndex: 3,
        slideType: 'bill_analysis',
        slideTitle: 'Current Bill Analysis',
        timeSpentSeconds: 15,
        viewCount: 1,
      };
      
      const engagementId = await db.recordSlideEngagement(engagement);
      
      expect(engagementId).toBe(1);
      expect(mockedDb.recordSlideEngagement).toHaveBeenCalledWith(engagement);
    });
  });

  describe('getExistingSlideEngagement', () => {
    it('should return existing engagement for a slide', async () => {
      const mockEngagement = {
        id: 1,
        proposalId: 1,
        viewId: 1,
        sessionId: 'test-session-123',
        slideIndex: 3,
        slideType: 'bill_analysis',
        slideTitle: 'Current Bill Analysis',
        timeSpentSeconds: 15,
        viewCount: 2,
        firstViewedAt: new Date(),
        lastViewedAt: new Date(),
      };
      
      mockedDb.getExistingSlideEngagement.mockResolvedValue(mockEngagement);
      
      const result = await db.getExistingSlideEngagement(1, 3);
      
      expect(result).toEqual(mockEngagement);
      expect(mockedDb.getExistingSlideEngagement).toHaveBeenCalledWith(1, 3);
    });

    it('should return undefined when no engagement exists', async () => {
      mockedDb.getExistingSlideEngagement.mockResolvedValue(undefined);
      
      const result = await db.getExistingSlideEngagement(1, 99);
      
      expect(result).toBeUndefined();
    });
  });

  describe('getProposalAnalyticsSummary', () => {
    it('should return complete analytics summary', async () => {
      const mockSummary = {
        totalViews: 5,
        uniqueVisitors: 3,
        avgDurationSeconds: 180,
        deviceBreakdown: [
          { deviceType: 'desktop', count: 3 },
          { deviceType: 'mobile', count: 2 },
        ],
        slideEngagement: [
          {
            slideIndex: 0,
            slideType: 'cover',
            slideTitle: 'Cover Page',
            totalTimeSpent: 30,
            totalViews: 5,
            avgTimeSpent: 6,
          },
          {
            slideIndex: 1,
            slideType: 'executive_summary',
            slideTitle: 'Executive Summary',
            totalTimeSpent: 90,
            totalViews: 5,
            avgTimeSpent: 18,
          },
        ],
        recentViews: [
          {
            id: 5,
            sessionId: 'session-5',
            ipAddress: '192.168.1.5',
            deviceType: 'desktop',
            browser: 'Chrome',
            os: 'macOS',
            durationSeconds: 240,
            totalSlidesViewed: 12,
            viewedAt: new Date(),
          },
        ],
      };
      
      mockedDb.getProposalAnalyticsSummary.mockResolvedValue(mockSummary);
      
      const result = await db.getProposalAnalyticsSummary(1);
      
      expect(result).toEqual(mockSummary);
      expect(result?.totalViews).toBe(5);
      expect(result?.uniqueVisitors).toBe(3);
      expect(result?.avgDurationSeconds).toBe(180);
      expect(result?.deviceBreakdown).toHaveLength(2);
      expect(result?.slideEngagement).toHaveLength(2);
      expect(result?.recentViews).toHaveLength(1);
    });

    it('should return null when no data exists', async () => {
      mockedDb.getProposalAnalyticsSummary.mockResolvedValue(null);
      
      const result = await db.getProposalAnalyticsSummary(999);
      
      expect(result).toBeNull();
    });
  });

  describe('getViewsBySessionId', () => {
    it('should return existing view for a session', async () => {
      const mockView = {
        id: 1,
        proposalId: 1,
        accessTokenId: 5,
        sessionId: 'existing-session',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        referrer: null,
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'macOS',
        durationSeconds: 60,
        totalSlidesViewed: 5,
        viewedAt: new Date(),
        lastActivityAt: new Date(),
      };
      
      mockedDb.getViewsBySessionId.mockResolvedValue(mockView);
      
      const result = await db.getViewsBySessionId('existing-session');
      
      expect(result).toEqual(mockView);
      expect(result?.id).toBe(1);
    });

    it('should return undefined for new session', async () => {
      mockedDb.getViewsBySessionId.mockResolvedValue(undefined);
      
      const result = await db.getViewsBySessionId('new-session');
      
      expect(result).toBeUndefined();
    });
  });

  describe('getViewsByProposalId', () => {
    it('should return all views for a proposal', async () => {
      const mockViews = [
        {
          id: 1,
          proposalId: 1,
          accessTokenId: 5,
          sessionId: 'session-1',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          referrer: null,
          deviceType: 'desktop',
          browser: 'Chrome',
          os: 'macOS',
          durationSeconds: 120,
          totalSlidesViewed: 10,
          viewedAt: new Date(),
          lastActivityAt: new Date(),
        },
        {
          id: 2,
          proposalId: 1,
          accessTokenId: 5,
          sessionId: 'session-2',
          ipAddress: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          referrer: 'https://google.com',
          deviceType: 'mobile',
          browser: 'Safari',
          os: 'iOS',
          durationSeconds: 60,
          totalSlidesViewed: 5,
          viewedAt: new Date(),
          lastActivityAt: new Date(),
        },
      ];
      
      mockedDb.getViewsByProposalId.mockResolvedValue(mockViews);
      
      const result = await db.getViewsByProposalId(1);
      
      expect(result).toHaveLength(2);
      expect(result[0].deviceType).toBe('desktop');
      expect(result[1].deviceType).toBe('mobile');
    });
  });

  describe('updateSlideEngagement', () => {
    it('should update time spent and view count for existing engagement', async () => {
      mockedDb.updateSlideEngagement.mockResolvedValue(undefined);
      
      await db.updateSlideEngagement(1, {
        timeSpentSeconds: 30,
        viewCount: 3,
        lastViewedAt: new Date(),
      });
      
      expect(mockedDb.updateSlideEngagement).toHaveBeenCalledWith(1, expect.objectContaining({
        timeSpentSeconds: 30,
        viewCount: 3,
      }));
    });
  });
});
