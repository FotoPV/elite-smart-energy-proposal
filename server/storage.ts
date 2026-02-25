/**
 * Local disk storage for Railway deployment.
 * Files are saved to /app/uploads (or ./uploads in dev) and served as static assets.
 * This replaces the Manus storage proxy which requires BUILT_IN_FORGE_API_URL/KEY.
 */

import fs from "fs";
import path from "path";

// Resolve upload directory — Railway workdir is /app, so this resolves to /app/uploads in prod
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

// Base URL for serving files — Railway serves the app at its public domain
function getBaseUrl(): string {
  // RAILWAY_PUBLIC_DOMAIN is set automatically by Railway
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain) {
    return `https://${railwayDomain}`;
  }
  // Fallback for local dev
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(UPLOAD_DIR, key);

  // Ensure parent directory exists
  ensureDir(path.dirname(filePath));

  // Write file to disk
  const buffer =
    typeof data === "string"
      ? Buffer.from(data, "utf-8")
      : Buffer.from(data as Uint8Array);

  fs.writeFileSync(filePath, buffer);

  const url = `${getBaseUrl()}/uploads/${key}`;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = relKey.replace(/^\/+/, "");
  const url = `${getBaseUrl()}/uploads/${key}`;
  return { key, url };
}
