import { eq, desc, and, like, sql, gte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  customers, InsertCustomer, Customer,
  bills, InsertBill, Bill,
  proposals, InsertProposal, Proposal,
  vppProviders, InsertVppProvider, VppProvider,
  stateRebates, InsertStateRebate, StateRebate,
  customerDocuments, InsertCustomerDocument, CustomerDocument,
  proposalAccessTokens, InsertProposalAccessToken, ProposalAccessToken
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER QUERIES
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CUSTOMER QUERIES
// ============================================

export async function createCustomer(customer: InsertCustomer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customers).values(customer);
  return Number(result[0].insertId);
}

export async function getCustomerById(id: number): Promise<Customer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function getCustomersByUserId(userId: number): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
}

export async function searchCustomers(userId: number, searchTerm?: string): Promise<Customer[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (searchTerm) {
    return db.select().from(customers)
      .where(and(
        eq(customers.userId, userId),
        like(customers.fullName, `%${searchTerm}%`)
      ))
      .orderBy(desc(customers.createdAt));
  }
  
  return getCustomersByUserId(userId);
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customers).set(data).where(eq(customers.id, id));
}

export async function deleteCustomer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customers).where(eq(customers.id, id));
}

// ============================================
// BILL QUERIES
// ============================================

export async function createBill(bill: InsertBill): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bills).values(bill);
  return Number(result[0].insertId);
}

export async function getBillById(id: number): Promise<Bill | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
  return result[0];
}

export async function getBillsByCustomerId(customerId: number): Promise<Bill[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(bills).where(eq(bills.customerId, customerId)).orderBy(desc(bills.createdAt));
}

export async function updateBill(id: number, data: Partial<InsertBill>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bills).set(data).where(eq(bills.id, id));
}

export async function deleteBill(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(bills).where(eq(bills.id, id));
}

// ============================================
// PROPOSAL QUERIES
// ============================================

export async function createProposal(proposal: InsertProposal): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(proposals).values(proposal);
  return Number(result[0].insertId);
}

export async function getProposalById(id: number): Promise<Proposal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result[0];
}

export async function getProposalsByUserId(userId: number): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(proposals).where(eq(proposals.userId, userId)).orderBy(desc(proposals.createdAt));
}

export async function getProposalsByCustomerId(customerId: number): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(proposals).where(eq(proposals.customerId, customerId)).orderBy(desc(proposals.createdAt));
}

export async function searchProposals(
  userId: number, 
  filters?: { status?: string; searchTerm?: string }
): Promise<(Proposal & { customerName?: string })[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Join with customers to get customer name
  const conditions = [eq(proposals.userId, userId)];
  
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(proposals.status, filters.status as any));
  }
  
  const results = await db
    .select({
      proposal: proposals,
      customerName: customers.fullName,
    })
    .from(proposals)
    .leftJoin(customers, eq(proposals.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(proposals.createdAt));
  
  return results.map(r => ({
    ...r.proposal,
    customerName: r.customerName ?? undefined,
  }));
}

export async function updateProposal(id: number, data: Partial<InsertProposal>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function deleteProposal(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(proposals).where(eq(proposals.id, id));
}

// ============================================
// VPP PROVIDER QUERIES
// ============================================

export async function getAllVppProviders(): Promise<VppProvider[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(vppProviders).where(eq(vppProviders.isActive, true));
}

export async function getVppProvidersByState(state: string): Promise<VppProvider[]> {
  const db = await getDb();
  if (!db) return [];
  
  const allProviders = await getAllVppProviders();
  return allProviders.filter(p => {
    const states = p.availableStates as string[] | null;
    return states?.includes(state);
  });
}

export async function upsertVppProvider(provider: InsertVppProvider): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(vppProviders).values(provider).onDuplicateKeyUpdate({
    set: provider,
  });
}

// ============================================
// STATE REBATE QUERIES
// ============================================

export async function getRebatesByState(state: string): Promise<StateRebate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stateRebates)
    .where(and(
      eq(stateRebates.state, state),
      eq(stateRebates.isActive, true)
    ));
}

export async function getRebatesByStateAndType(state: string, rebateType: string): Promise<StateRebate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(stateRebates)
    .where(and(
      eq(stateRebates.state, state),
      eq(stateRebates.rebateType, rebateType as any),
      eq(stateRebates.isActive, true)
    ));
}

export async function upsertStateRebate(rebate: InsertStateRebate): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(stateRebates).values(rebate).onDuplicateKeyUpdate({
    set: rebate,
  });
}

// ============================================
// CUSTOMER DOCUMENT QUERIES
// ============================================

export async function createCustomerDocument(doc: InsertCustomerDocument): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(customerDocuments).values(doc);
  return Number(result[0].insertId);
}

export async function getDocumentById(id: number): Promise<CustomerDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(customerDocuments).where(eq(customerDocuments.id, id)).limit(1);
  return result[0];
}

export async function getDocumentsByCustomerId(customerId: number): Promise<CustomerDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(customerDocuments)
    .where(eq(customerDocuments.customerId, customerId))
    .orderBy(desc(customerDocuments.createdAt));
}

export async function getDocumentsByType(
  customerId: number, 
  documentType: string
): Promise<CustomerDocument[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(customerDocuments)
    .where(and(
      eq(customerDocuments.customerId, customerId),
      eq(customerDocuments.documentType, documentType as any)
    ))
    .orderBy(desc(customerDocuments.createdAt));
}

export async function updateCustomerDocument(
  id: number, 
  data: Partial<InsertCustomerDocument>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(customerDocuments).set(data).where(eq(customerDocuments.id, id));
}

export async function deleteCustomerDocument(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(customerDocuments).where(eq(customerDocuments.id, id));
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalCustomers: 0, totalProposals: 0, draftProposals: 0, generatedProposals: 0 };
  
  const [customerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(customers)
    .where(eq(customers.userId, userId));
  
  const [proposalCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proposals)
    .where(eq(proposals.userId, userId));
  
  const [draftCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proposals)
    .where(and(eq(proposals.userId, userId), eq(proposals.status, 'draft')));
  
  const [generatedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proposals)
    .where(and(eq(proposals.userId, userId), eq(proposals.status, 'generated')));
  
  return {
    totalCustomers: Number(customerCount?.count ?? 0),
    totalProposals: Number(proposalCount?.count ?? 0),
    draftProposals: Number(draftCount?.count ?? 0),
    generatedProposals: Number(generatedCount?.count ?? 0),
  };
}

// ============================================
// PROPOSAL ACCESS TOKEN QUERIES (Customer Portal)
// ============================================

export async function createAccessToken(token: InsertProposalAccessToken): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(proposalAccessTokens).values(token);
  return Number(result[0].insertId);
}

// Alias for createAccessToken
export async function createProposalAccessToken(token: InsertProposalAccessToken): Promise<number> {
  return createAccessToken(token);
}

export async function getAccessTokenByToken(token: string): Promise<ProposalAccessToken | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(proposalAccessTokens)
    .where(eq(proposalAccessTokens.token, token))
    .limit(1);
  return result[0];
}

export async function getAccessTokensByProposalId(proposalId: number): Promise<ProposalAccessToken[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(proposalAccessTokens)
    .where(eq(proposalAccessTokens.proposalId, proposalId))
    .orderBy(desc(proposalAccessTokens.createdAt));
}

export async function incrementTokenViewCount(token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(proposalAccessTokens)
    .set({ 
      viewCount: sql`${proposalAccessTokens.viewCount} + 1`,
      lastViewedAt: new Date()
    })
    .where(eq(proposalAccessTokens.token, token));
}

export async function deactivateAccessToken(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(proposalAccessTokens)
    .set({ isActive: false })
    .where(eq(proposalAccessTokens.id, id));
}

export async function getProposalWithCustomerByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Get the access token
  const accessToken = await getAccessTokenByToken(token);
  if (!accessToken || !accessToken.isActive) return null;
  
  // Check expiry
  if (accessToken.expiresAt && new Date(accessToken.expiresAt) < new Date()) {
    return null;
  }
  
  // Get proposal and customer
  const proposal = await getProposalById(accessToken.proposalId);
  if (!proposal) return null;
  
  const customer = await getCustomerById(proposal.customerId);
  if (!customer) return null;
  
  // Increment view count
  await incrementTokenViewCount(token);
  
  return { proposal, customer, accessToken };
}


// ============================================
// PROPOSAL ANALYTICS QUERIES
// ============================================

import { proposalViews, InsertProposalView, ProposalView, slideEngagement, InsertSlideEngagement, SlideEngagement } from "../drizzle/schema";

export async function recordProposalView(view: InsertProposalView): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(proposalViews).values(view);
  return Number(result[0].insertId);
}

export async function updateProposalView(id: number, data: Partial<InsertProposalView>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(proposalViews).set(data).where(eq(proposalViews.id, id));
}

export async function getProposalViewById(id: number): Promise<ProposalView | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(proposalViews).where(eq(proposalViews.id, id)).limit(1);
  return result[0];
}

export async function getViewsByProposalId(proposalId: number): Promise<ProposalView[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId))
    .orderBy(desc(proposalViews.viewedAt));
}

export async function getViewsBySessionId(sessionId: string): Promise<ProposalView | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(proposalViews)
    .where(eq(proposalViews.sessionId, sessionId))
    .limit(1);
  return result[0];
}

export async function recordSlideEngagement(engagement: InsertSlideEngagement): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(slideEngagement).values(engagement);
  return Number(result[0].insertId);
}

export async function updateSlideEngagement(id: number, data: Partial<InsertSlideEngagement>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(slideEngagement).set(data).where(eq(slideEngagement.id, id));
}

export async function getSlideEngagementByView(viewId: number): Promise<SlideEngagement[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(slideEngagement)
    .where(eq(slideEngagement.viewId, viewId))
    .orderBy(slideEngagement.slideIndex);
}

export async function getSlideEngagementByProposal(proposalId: number): Promise<SlideEngagement[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(slideEngagement)
    .where(eq(slideEngagement.proposalId, proposalId))
    .orderBy(slideEngagement.slideIndex);
}

export async function getExistingSlideEngagement(
  viewId: number, 
  slideIndex: number
): Promise<SlideEngagement | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(slideEngagement)
    .where(and(
      eq(slideEngagement.viewId, viewId),
      eq(slideEngagement.slideIndex, slideIndex)
    ))
    .limit(1);
  return result[0];
}

export async function getProposalAnalyticsSummary(proposalId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Total views
  const [viewCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId));
  
  // Unique visitors (by IP)
  const [uniqueVisitors] = await db
    .select({ count: sql<number>`count(DISTINCT ${proposalViews.ipAddress})` })
    .from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId));
  
  // Average duration
  const [avgDuration] = await db
    .select({ avg: sql<number>`COALESCE(AVG(${proposalViews.durationSeconds}), 0)` })
    .from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId));
  
  // Device breakdown
  const deviceBreakdown = await db
    .select({ 
      deviceType: proposalViews.deviceType,
      count: sql<number>`count(*)` 
    })
    .from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId))
    .groupBy(proposalViews.deviceType);
  
  // Slide engagement aggregated
  const slideStats = await db
    .select({
      slideIndex: slideEngagement.slideIndex,
      slideType: slideEngagement.slideType,
      slideTitle: slideEngagement.slideTitle,
      totalTimeSpent: sql<number>`SUM(${slideEngagement.timeSpentSeconds})`,
      totalViews: sql<number>`SUM(${slideEngagement.viewCount})`,
      avgTimeSpent: sql<number>`AVG(${slideEngagement.timeSpentSeconds})`,
    })
    .from(slideEngagement)
    .where(eq(slideEngagement.proposalId, proposalId))
    .groupBy(slideEngagement.slideIndex, slideEngagement.slideType, slideEngagement.slideTitle)
    .orderBy(slideEngagement.slideIndex);
  
  // Recent views (last 10)
  const recentViews = await db.select().from(proposalViews)
    .where(eq(proposalViews.proposalId, proposalId))
    .orderBy(desc(proposalViews.viewedAt))
    .limit(10);
  
  return {
    totalViews: Number(viewCount?.count ?? 0),
    uniqueVisitors: Number(uniqueVisitors?.count ?? 0),
    avgDurationSeconds: Math.round(Number(avgDuration?.avg ?? 0)),
    deviceBreakdown: deviceBreakdown.map(d => ({
      deviceType: d.deviceType || 'unknown',
      count: Number(d.count),
    })),
    slideEngagement: slideStats.map(s => ({
      slideIndex: s.slideIndex,
      slideType: s.slideType,
      slideTitle: s.slideTitle,
      totalTimeSpent: Number(s.totalTimeSpent ?? 0),
      totalViews: Number(s.totalViews ?? 0),
      avgTimeSpent: Math.round(Number(s.avgTimeSpent ?? 0)),
    })),
    recentViews: recentViews.map(v => ({
      id: v.id,
      sessionId: v.sessionId,
      ipAddress: v.ipAddress,
      deviceType: v.deviceType,
      browser: v.browser,
      os: v.os,
      durationSeconds: v.durationSeconds,
      totalSlidesViewed: v.totalSlidesViewed,
      viewedAt: v.viewedAt,
    })),
  };
}


// ============================================
// AGGREGATE ANALYTICS (Dashboard Overview)
// ============================================

export async function getAggregateAnalytics(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get all proposal IDs for this user
  const userProposals = await db
    .select({ id: proposals.id, title: proposals.title, customerId: proposals.customerId })
    .from(proposals)
    .where(eq(proposals.userId, userId));
  
  if (userProposals.length === 0) {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      avgDurationSeconds: 0,
      totalProposalsViewed: 0,
      topProposals: [],
      recentActivity: [],
      viewsTrend: [],
    };
  }
  
  const proposalIds = userProposals.map(p => p.id);
  
  // Total views across all proposals
  const [totalViewsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds));
  
  // Unique visitors across all proposals
  const [uniqueVisitorsResult] = await db
    .select({ count: sql<number>`count(DISTINCT ${proposalViews.ipAddress})` })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds));
  
  // Average duration across all proposals
  const [avgDurationResult] = await db
    .select({ avg: sql<number>`COALESCE(AVG(${proposalViews.durationSeconds}), 0)` })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds));
  
  // Proposals that have been viewed
  const [proposalsViewedResult] = await db
    .select({ count: sql<number>`count(DISTINCT ${proposalViews.proposalId})` })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds));
  
  // Top proposals by views
  const topProposalsRaw = await db
    .select({
      proposalId: proposalViews.proposalId,
      viewCount: sql<number>`count(*)`,
      avgDuration: sql<number>`COALESCE(AVG(${proposalViews.durationSeconds}), 0)`,
      lastViewed: sql<string>`MAX(${proposalViews.viewedAt})`,
    })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds))
    .groupBy(proposalViews.proposalId)
    .orderBy(sql`count(*) DESC`)
    .limit(5);
  
  // Map proposal titles to top proposals
  const proposalMap = new Map(userProposals.map(p => [p.id, p]));
  const topProposals = topProposalsRaw.map(tp => ({
    proposalId: tp.proposalId,
    title: proposalMap.get(tp.proposalId)?.title || 'Unknown',
    customerId: proposalMap.get(tp.proposalId)?.customerId || 0,
    viewCount: Number(tp.viewCount),
    avgDuration: Math.round(Number(tp.avgDuration)),
    lastViewed: tp.lastViewed,
  }));
  
  // Recent activity (last 10 views across all proposals)
  const recentActivity = await db
    .select({
      id: proposalViews.id,
      proposalId: proposalViews.proposalId,
      ipAddress: proposalViews.ipAddress,
      deviceType: proposalViews.deviceType,
      browser: proposalViews.browser,
      os: proposalViews.os,
      durationSeconds: proposalViews.durationSeconds,
      totalSlidesViewed: proposalViews.totalSlidesViewed,
      viewedAt: proposalViews.viewedAt,
    })
    .from(proposalViews)
    .where(inArray(proposalViews.proposalId, proposalIds))
    .orderBy(desc(proposalViews.viewedAt))
    .limit(10);
  
  // Views trend (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const viewsTrend = await db
    .select({
      date: sql<string>`DATE_FORMAT(${proposalViews.viewedAt}, '%Y-%m-%d')`,
      count: sql<number>`count(*)`,
    })
    .from(proposalViews)
    .where(and(
      inArray(proposalViews.proposalId, proposalIds),
      gte(proposalViews.viewedAt, sevenDaysAgo)
    ))
    .groupBy(sql`DATE_FORMAT(${proposalViews.viewedAt}, '%Y-%m-%d')`)
    .orderBy(sql`DATE_FORMAT(${proposalViews.viewedAt}, '%Y-%m-%d')`);
  
  return {
    totalViews: Number(totalViewsResult?.count ?? 0),
    uniqueVisitors: Number(uniqueVisitorsResult?.count ?? 0),
    avgDurationSeconds: Math.round(Number(avgDurationResult?.avg ?? 0)),
    totalProposalsViewed: Number(proposalsViewedResult?.count ?? 0),
    topProposals,
    recentActivity: recentActivity.map(v => ({
      ...v,
      proposalTitle: proposalMap.get(v.proposalId)?.title || 'Unknown',
    })),
    viewsTrend: viewsTrend.map(v => ({
      date: v.date,
      count: Number(v.count),
    })),
  };
}

// ============================================
// EXPIRY NOTIFICATIONS
// ============================================

export async function getExpiringAccessTokens(userId: number, daysUntilExpiry: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() + daysUntilExpiry);
  
  // Get all active tokens for user's proposals that expire within threshold
  const userProposals = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(eq(proposals.userId, userId));
  
  if (userProposals.length === 0) return [];
  
  const proposalIds = userProposals.map(p => p.id);
  
  const expiringTokens = await db
    .select({
      tokenId: proposalAccessTokens.id,
      proposalId: proposalAccessTokens.proposalId,
      customerId: proposalAccessTokens.customerId,
      token: proposalAccessTokens.token,
      expiresAt: proposalAccessTokens.expiresAt,
      isActive: proposalAccessTokens.isActive,
      viewCount: proposalAccessTokens.viewCount,
      createdAt: proposalAccessTokens.createdAt,
    })
    .from(proposalAccessTokens)
    .where(and(
      inArray(proposalAccessTokens.proposalId, proposalIds),
      eq(proposalAccessTokens.isActive, true),
    ));
  
  // Filter for tokens expiring within threshold or already expired
  return expiringTokens
    .filter(t => {
      if (!t.expiresAt) return false;
      const expiresAt = new Date(t.expiresAt);
      return expiresAt <= expiryThreshold;
    })
    .map(t => ({
      ...t,
      daysRemaining: t.expiresAt ? Math.max(0, Math.ceil((new Date(t.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
      isExpired: t.expiresAt ? new Date(t.expiresAt) <= now : false,
    }));
}

export async function getExpiredUnviewedTokens(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  
  const userProposals = await db
    .select({ id: proposals.id })
    .from(proposals)
    .where(eq(proposals.userId, userId));
  
  if (userProposals.length === 0) return [];
  
  const proposalIds = userProposals.map(p => p.id);
  
  const expiredTokens = await db
    .select()
    .from(proposalAccessTokens)
    .where(and(
      inArray(proposalAccessTokens.proposalId, proposalIds),
      eq(proposalAccessTokens.isActive, true),
    ));
  
  // Filter for expired tokens with 0 views
  return expiredTokens.filter(t => {
    if (!t.expiresAt) return false;
    return new Date(t.expiresAt) <= now && (t.viewCount === 0 || t.viewCount === null);
  });
}
