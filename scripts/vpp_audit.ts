import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  // 1. Check VPP providers
  console.log('\n=== VPP PROVIDERS ===');
  const providers = await db.execute(sql`
    SELECT name, programName, dailyCredit, eventPayment, estimatedEventsPerYear, bundleDiscount,
           ROUND(dailyCredit * 365 + eventPayment * estimatedEventsPerYear + bundleDiscount, 2) as calculatedAnnualValue,
           availableStates, hasGasBundle
    FROM vppProviders WHERE isActive = 1 ORDER BY calculatedAnnualValue DESC
  `);
  console.table(providers[0]);

  // 2. Check VPP values across all proposals
  console.log('\n=== VPP VALUES IN PROPOSALS ===');
  const proposals = await db.execute(sql`
    SELECT p.id, c.fullName as customerName, c.state,
           JSON_EXTRACT(p.calculations, '$.selectedVppProvider') as vppProvider,
           JSON_EXTRACT(p.calculations, '$.vppAnnualValue') as vppAnnualValue,
           JSON_EXTRACT(p.calculations, '$.vppDailyCreditAnnual') as vppDailyCreditAnnual,
           JSON_EXTRACT(p.calculations, '$.vppEventPaymentsAnnual') as vppEventPaymentsAnnual,
           JSON_EXTRACT(p.calculations, '$.vppBundleDiscount') as vppBundleDiscount,
           JSON_EXTRACT(p.calculations, '$.totalAnnualSavings') as totalAnnualSavings,
           JSON_EXTRACT(p.calculations, '$.paybackYears') as paybackYears
    FROM proposals p
    JOIN customers c ON p.customerId = c.id
    WHERE p.status != 'binned'
    ORDER BY c.fullName
  `);
  console.table(proposals[0]);

  // 3. Check VPP comparison arrays
  console.log('\n=== VPP COMPARISON (first proposal) ===');
  const firstProposal = await db.execute(sql`
    SELECT p.id, c.name,
           JSON_EXTRACT(p.calculations, '$.vppProviderComparison') as vppComparison
    FROM proposals p
    JOIN customers c ON p.customerId = c.id
    WHERE p.status != 'binned'
    LIMIT 1
  `);
  const row = (firstProposal[0] as any[])[0];
  if (row?.vppComparison) {
    const comparison = typeof row.vppComparison === 'string' ? JSON.parse(row.vppComparison) : row.vppComparison;
    console.log(`Customer: ${row.fullName}`);
    console.table(comparison);
  }

  await connection.end();
}

main().catch(console.error);
