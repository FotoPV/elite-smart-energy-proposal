import { eq, desc, and, like, sql } from "drizzle-orm";
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
