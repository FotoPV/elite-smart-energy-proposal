import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  const result = await db.execute(sql`SELECT id, name, programName, isActive FROM vppProviders ORDER BY name`);
  console.table(result[0]);

  // The 14 real providers from Luke's screenshot:
  const realProviders = [
    'Amber for Batteries',
    'Tesla VPP',
    'Reposit',
    'AGL VPP',
    'Origin VPP',
    'Powershop',
    'Discover Energy',
    'Energy Australia',
    'Engie',
    'GloBird',
    'Nectr',
    'ShineHub',
    'Sonnen VPP',
    'Zero Hero (GloBird)',
  ];

  const dbNames = (result[0] as any[]).map((r: any) => r.name);
  
  console.log('\n=== MISSING FROM DATABASE ===');
  for (const p of realProviders) {
    const found = dbNames.some((n: string) => n.toLowerCase().includes(p.toLowerCase().split(' ')[0]) || p.toLowerCase().includes(n.toLowerCase().split(' ')[0]));
    if (!found) console.log(`  MISSING: ${p}`);
  }

  console.log('\n=== IN DB BUT NOT IN REAL LIST ===');
  for (const n of dbNames) {
    const found = realProviders.some(p => p.toLowerCase().includes(n.toLowerCase().split(' ')[0]) || n.toLowerCase().includes(p.toLowerCase().split(' ')[0]));
    if (!found) console.log(`  EXTRA: ${n}`);
  }

  await connection.end();
}

main().catch(console.error);
