/**
 * Batch regenerate all proposals
 * Resets calculations and status so they regenerate with:
 * - 85% CO2 cap
 * - Switchboard AI analysis data
 * - Tightened narrative prompts (25-40 words)
 * - Premium design overhaul
 * - Electrical assessment slide
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function main() {
  const url = new URL(DATABASE_URL);
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true },
  });

  // Get all proposals that have been generated
  const [proposals] = await conn.execute(
    `SELECT id, status FROM proposals WHERE status IN ('generated', 'generating', 'draft')`
  );

  console.log(`Found ${proposals.length} proposals to reset`);

  let resetCount = 0;
  for (const p of proposals) {
    await conn.execute(
      `UPDATE proposals SET status = 'draft', calculations = NULL, slidesData = NULL, slideCount = 0 WHERE id = ?`,
      [p.id]
    );
    resetCount++;
    console.log(`[${resetCount}/${proposals.length}] Reset proposal ${p.id} (was: ${p.status})`);
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Reset: ${resetCount} proposals`);
  console.log(`All proposals will regenerate with updated calculations, narratives, and design when opened.`);

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
