import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getDocumentsByCustomerId: vi.fn().mockResolvedValue([
    {
      id: 1,
      customerId: 1,
      userId: 1,
      documentType: "switchboard_photo",
      fileUrl: "https://example.com/photo.jpg",
      fileKey: "documents/1/abc123-photo.jpg",
      fileName: "switchboard.jpg",
      fileSize: 1024,
      mimeType: "image/jpeg",
      description: null,
      extractedData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getDocumentsByType: vi.fn().mockResolvedValue([
    {
      id: 1,
      customerId: 1,
      userId: 1,
      documentType: "switchboard_photo",
      fileUrl: "https://example.com/photo.jpg",
      fileKey: "documents/1/abc123-photo.jpg",
      fileName: "switchboard.jpg",
      fileSize: 1024,
      mimeType: "image/jpeg",
      description: null,
      extractedData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getDocumentById: vi.fn().mockResolvedValue({
    id: 1,
    customerId: 1,
    userId: 1,
    documentType: "switchboard_photo",
    fileUrl: "https://example.com/photo.jpg",
    fileKey: "documents/1/abc123-photo.jpg",
    fileName: "switchboard.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg",
    description: null,
    extractedData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createCustomerDocument: vi.fn().mockResolvedValue(1),
  updateCustomerDocument: vi.fn().mockResolvedValue(undefined),
  deleteCustomerDocument: vi.fn().mockResolvedValue(undefined),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://example.com/uploaded-photo.jpg",
    key: "documents/1/abc123-photo.jpg",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("documents router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("documents.list", () => {
    it("returns documents for a customer", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.list({ customerId: 1 });

      expect(result).toHaveLength(1);
      expect(result[0].documentType).toBe("switchboard_photo");
      expect(result[0].fileName).toBe("switchboard.jpg");
    });
  });

  describe("documents.listByType", () => {
    it("returns documents filtered by type", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.listByType({
        customerId: 1,
        documentType: "switchboard_photo",
      });

      expect(result).toHaveLength(1);
      expect(result[0].documentType).toBe("switchboard_photo");
    });
  });

  describe("documents.get", () => {
    it("returns a single document by id", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.get({ id: 1 });

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.documentType).toBe("switchboard_photo");
    });
  });

  describe("documents.upload", () => {
    it("uploads a document and returns success", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Base64 encoded small test image
      const testBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const result = await caller.documents.upload({
        customerId: 1,
        documentType: "switchboard_photo",
        fileData: testBase64,
        fileName: "test-switchboard.png",
        mimeType: "image/png",
        description: "Test switchboard photo",
      });

      expect(result.success).toBe(true);
      expect(result.documentId).toBe(1);
      expect(result.fileUrl).toBe("https://example.com/uploaded-photo.jpg");
    });

    it("accepts all valid document types", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const testBase64 = "dGVzdA=="; // "test" in base64

      const documentTypes = [
        "switchboard_photo",
        "meter_photo",
        "roof_photo",
        "property_photo",
        "solar_proposal_pdf",
        "other",
      ] as const;

      for (const docType of documentTypes) {
        const result = await caller.documents.upload({
          customerId: 1,
          documentType: docType,
          fileData: testBase64,
          fileName: `test.${docType === "solar_proposal_pdf" ? "pdf" : "jpg"}`,
          mimeType: docType === "solar_proposal_pdf" ? "application/pdf" : "image/jpeg",
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe("documents.update", () => {
    it("updates document description", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.update({
        id: 1,
        description: "Updated description",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("documents.delete", () => {
    it("deletes a document", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.documents.delete({ id: 1 });

      expect(result.success).toBe(true);
    });
  });
});
