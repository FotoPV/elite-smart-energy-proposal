/**
 * Batch regeneration script
 * Resets all generated proposals to draft status with cleared calculations
 * so the next time they're opened, they'll regenerate with the latest code.
 * 
 * This approach avoids calling the LLM for all 27 proposals at once,
 * which would be slow and expensive. Instead, proposals regenerate on-demand
 * when viewed.
 */

import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Get all generated proposals
  const [proposals] = await conn.execute(
    "SELECT id, status FROM proposals WHERE status = 'generated' ORDER BY id"
  );
  
  console.log(`Found ${proposals.length} generated proposals to reset for regeneration.`);
  
  // Reset each proposal: clear calculations, slides, and set to draft
  let count = 0;
  for (const p of proposals) {
    await conn.execute(
      "UPDATE proposals SET status = 'draft', slidesData = NULL, slideCount = 0, calculations = NULL WHERE id = ?",
      [p.id]
    );
    count++;
    console.log(`  Reset proposal ${p.id} → draft (${count}/${proposals.length})`);
  }
  
  console.log(`\nDone. ${count} proposals reset to draft.`);
  console.log('They will regenerate automatically when next opened in the UI.');
  
  await conn.end();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
