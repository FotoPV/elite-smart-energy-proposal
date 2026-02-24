import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { vppProviders } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function seedVppProviders() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  // Clear existing providers
  await db.delete(vppProviders);
  console.log('Cleared existing VPP providers');

  // Insert the correct 14 providers matching VPP Calculator source of truth
  const providers = [
    // Wholesale/Dynamic Pricing Providers
    { name: 'Amber for Batteries', slug: 'amber', providerType: 'wholesale', baseRateCents: '35.80', monthlyFee: '15.00', wholesaleMargin: '5.00', availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.amber.com.au', notes: 'Dynamic pricing based on live AEMO wholesale rates plus margin', isActive: true },
    { name: 'Tesla VPP', slug: 'tesla', providerType: 'wholesale', baseRateCents: '32.00', monthlyFee: '0.00', wholesaleMargin: '3.00', availableStates: ['NSW', 'VIC', 'SA'], minBatterySize: '5.00', website: 'https://www.tesla.com/en_au/support/energy/powerwall/own/virtual-power-plant', notes: 'Tesla Powerwall required. No monthly fee.', isActive: true },
    { name: 'Reposit', slug: 'reposit', providerType: 'wholesale', baseRateCents: '30.00', monthlyFee: '12.00', wholesaleMargin: '8.00', availableStates: ['NSW', 'VIC', 'QLD', 'SA', 'TAS'], minBatterySize: '5.00', website: 'https://www.repositpower.com', notes: 'GridCredits system. Available in all mainland states plus TAS.', isActive: true },
    { name: 'ShineHub', slug: 'shinehub', providerType: 'wholesale', baseRateCents: '28.00', monthlyFee: '10.00', wholesaleMargin: '10.00', availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.shinehub.com.au', notes: 'Wholesale pricing with higher margin. Community solar focus.', isActive: true },
    { name: 'sonnen VPP', slug: 'sonnen', providerType: 'wholesale', baseRateCents: '29.00', monthlyFee: '8.00', wholesaleMargin: '9.00', availableStates: ['NSW', 'VIC', 'QLD', 'SA', 'TAS'], minBatterySize: '5.00', website: 'https://sonnen.com.au', notes: 'sonnen battery preferred. Available in all mainland states plus TAS.', isActive: true },
    { name: 'Zero Hero (GloBird)', slug: 'zerohero', providerType: 'wholesale', baseRateCents: '15.00', monthlyFee: '0.00', wholesaleMargin: '7.00', availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.globirdenergy.com.au', notes: 'GloBird wholesale VPP program. No monthly fee.', isActive: true },

    // Fixed Rate Providers
    { name: 'AGL VPP', slug: 'agl', providerType: 'fixed', baseRateCents: '12.00', monthlyFee: '5.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.agl.com.au/solar-renewables/virtual-power-plant', notes: 'Fixed rate VPP program.', isActive: true },
    { name: 'Origin VPP', slug: 'origin', providerType: 'fixed', baseRateCents: '10.00', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.originenergy.com.au', notes: 'Fixed rate. No monthly fee.', isActive: true },
    { name: 'Powershop', slug: 'powershop', providerType: 'fixed', baseRateCents: '11.50', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA', 'TAS'], minBatterySize: '5.00', website: 'https://www.powershop.com.au', notes: 'Fixed rate. Available in all mainland states plus TAS.', isActive: true },
    { name: 'Discover Energy', slug: 'discover', providerType: 'fixed', baseRateCents: '10.50', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.discoverenergy.com.au', notes: 'Fixed rate VPP.', isActive: true },
    { name: 'Energy Australia', slug: 'energyaustralia', providerType: 'fixed', baseRateCents: '9.50', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.energyaustralia.com.au', notes: 'Fixed rate VPP.', isActive: true },
    { name: 'ENGIE', slug: 'engie', providerType: 'fixed', baseRateCents: '11.00', monthlyFee: '3.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.engie.com.au', notes: 'Fixed rate with small monthly fee.', isActive: true },
    { name: 'Globird', slug: 'globird', providerType: 'fixed', baseRateCents: '10.20', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.globirdenergy.com.au', notes: 'Fixed rate VPP.', isActive: true },
    { name: 'Nectr', slug: 'nectr', providerType: 'fixed', baseRateCents: '12.50', monthlyFee: '0.00', wholesaleMargin: null, availableStates: ['NSW', 'VIC', 'QLD', 'SA'], minBatterySize: '5.00', website: 'https://www.nectrenergy.com.au', notes: 'Fixed rate. Highest fixed rate available.', isActive: true },
  ];

  for (const p of providers) {
    await db.insert(vppProviders).values(p as any);
    console.log(`  ✓ ${p.name} (${p.providerType}) — ${p.baseRateCents}c/kWh`);
  }

  console.log(`\nSeeded ${providers.length} VPP providers successfully.`);
  await connection.end();
}

seedVppProviders().catch(console.error);
