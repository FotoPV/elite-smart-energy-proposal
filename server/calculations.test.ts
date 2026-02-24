import { describe, expect, it } from "vitest";
import {
  CONSTANTS,
  calculateUsageProjections,
  calculateGasAnalysis,
  calculateHotWaterSavings,
  calculateHeatingCoolingSavings,
  calculateCookingSavings,
  calculatePoolHeatPump,
  calculateVppIncome,
  calculateEvSavings,
  calculateBatterySize,
  calculateSolarSize,
  calculatePayback,
  calculateCo2Reduction,
} from "./calculations";
import { Bill, VppProvider } from "../drizzle/schema";

// Mock bill data
const mockElectricityBill: Bill = {
  id: 1,
  customerId: 1,
  billType: "electricity",
  fileName: "test-bill.pdf",
  fileUrl: "https://example.com/bill.pdf",
  retailer: "AGL",
  billingPeriodStart: "2024-01-01",
  billingPeriodEnd: "2024-03-31",
  billingDays: 90,
  totalAmount: "450.00",
  dailySupplyCharge: "1.20",
  totalUsageKwh: "1800",
  peakUsageKwh: "1200",
  offPeakUsageKwh: "600",
  shoulderUsageKwh: null,
  solarExportsKwh: null,
  peakRateCents: "32.5",
  offPeakRateCents: "18.0",
  shoulderRateCents: null,
  feedInTariffCents: "5.0",
  gasUsageMj: null,
  gasRateCentsMj: null,
  extractionConfidence: 85,
  rawData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGasBill: Bill = {
  id: 2,
  customerId: 1,
  billType: "gas",
  fileName: "test-gas-bill.pdf",
  fileUrl: "https://example.com/gas-bill.pdf",
  retailer: "AGL",
  billingPeriodStart: "2024-01-01",
  billingPeriodEnd: "2024-03-31",
  billingDays: 90,
  totalAmount: "180.00",
  dailySupplyCharge: "0.85",
  totalUsageKwh: null,
  peakUsageKwh: null,
  offPeakUsageKwh: null,
  shoulderUsageKwh: null,
  solarExportsKwh: null,
  peakRateCents: null,
  offPeakRateCents: null,
  shoulderRateCents: null,
  feedInTariffCents: null,
  gasUsageMj: "4500",
  gasRateCentsMj: "3.5",
  extractionConfidence: 80,
  rawData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVppProvider: VppProvider = {
  id: 1,
  name: "Amber for Batteries",
  slug: "amber",
  providerType: "wholesale",
  availableStates: ["NSW", "VIC", "QLD", "SA"],
  baseRateCents: "35.80",
  monthlyFee: "15.00",
  wholesaleMargin: "5.00",
  // Legacy fields (kept for schema compatibility)
  programName: null,
  hasGasBundle: false,
  dailyCredit: null,
  eventPayment: null,
  estimatedEventsPerYear: null,
  bundleDiscount: null,
  minBatterySize: "5.00",
  website: "https://www.amber.com.au",
  notes: "Dynamic pricing based on live AEMO wholesale rates",
  isActive: true,
  updatedAt: new Date(),
};

describe("Usage Projections", () => {
  it("calculates daily, monthly, and yearly usage correctly", () => {
    const result = calculateUsageProjections(mockElectricityBill);
    
    // 1800 kWh / 90 days = 20 kWh/day
    expect(result.dailyAverageKwh).toBe(20);
    
    // 20 kWh/day * 30 days = 600 kWh/month
    expect(result.monthlyUsageKwh).toBe(600);
    
    // 20 kWh/day * 365 days = 7300 kWh/year
    expect(result.yearlyUsageKwh).toBe(7300);
  });

  it("calculates projected annual cost correctly", () => {
    const result = calculateUsageProjections(mockElectricityBill);
    
    // $450 / 90 days = $5/day
    // $5/day * 365 days = $1825/year
    expect(result.projectedAnnualCost).toBe(1825);
    expect(result.dailyAverageCost).toBe(5);
  });
});

describe("Gas Analysis", () => {
  it("calculates annual gas cost correctly", () => {
    const result = calculateGasAnalysis(mockGasBill);
    
    // $180 / 90 days = $2/day
    // $2/day * 365 days = $730/year
    expect(result.annualGasCost).toBe(730);
  });

  it("converts gas MJ to kWh equivalent", () => {
    const result = calculateGasAnalysis(mockGasBill);
    
    // 4500 MJ * 0.2778 = 1250.1 kWh
    expect(result.gasKwhEquivalent).toBeCloseTo(1250.1, 0);
  });

  it("calculates CO2 emissions", () => {
    const result = calculateGasAnalysis(mockGasBill);
    
    // 4500 MJ * 0.0512 kg/MJ * (365/90) = 934.4 kg
    expect(result.co2EmissionsKg).toBeCloseTo(934.4, 0);
  });
});

describe("Hot Water Heat Pump Savings", () => {
  it("calculates savings from switching to heat pump hot water", () => {
    const result = calculateHotWaterSavings(mockGasBill);
    
    // Should have positive savings (heat pump is more efficient)
    expect(result.annualSavings).toBeGreaterThan(0);
    expect(result.currentGasHwsCost).toBeGreaterThan(result.heatPumpAnnualCost);
  });

  it("calculates daily supply charge savings", () => {
    const result = calculateHotWaterSavings(mockGasBill);
    
    // $0.85/day * 365 days = $310.25/year
    expect(result.dailySupplySaved).toBeCloseTo(310.25, 0);
  });
});

describe("Heating/Cooling Savings", () => {
  it("calculates savings from switching to reverse cycle AC", () => {
    const result = calculateHeatingCoolingSavings(mockGasBill);
    
    // Should have positive savings
    expect(result.annualSavings).toBeGreaterThan(0);
    expect(result.additionalCoolingBenefit).toBe(true);
  });
});

describe("Cooking Savings", () => {
  it("calculates cooking costs correctly", () => {
    const result = calculateCookingSavings(mockGasBill);
    
    // Should calculate both costs
    expect(result.currentGasCookingCost).toBeGreaterThan(0);
    expect(result.inductionAnnualCost).toBeGreaterThan(0);
    // Induction may be slightly more expensive for low usage due to electricity rates
    // but the difference should be minimal
    expect(Math.abs(result.annualSavings)).toBeLessThan(50);
  });
});

describe("Pool Heat Pump", () => {
  it("calculates recommended kW for pool heating", () => {
    // 50,000L pool
    const result = calculatePoolHeatPump(50000);
    
    // 50 * 0.6 (avg factor) = 30kW
    expect(result.recommendedKw).toBeCloseTo(30, 0);
  });

  it("calculates annual operating cost", () => {
    const result = calculatePoolHeatPump(50000);
    
    // Should have reasonable operating cost
    expect(result.annualOperatingCost).toBeGreaterThan(0);
    expect(result.estimatedSavingsVsGas).toBeGreaterThan(0);
  });
});

describe("VPP Income", () => {
  it("calculates total annual VPP value using baseRate model", () => {
    // Amber for Batteries: 35.80 c/kWh, $15/mo fee
    // Daily export: 8 kWh (typical for ~10kWh usable battery)
    const dailyExportKwh = 8;
    const result = calculateVppIncome(mockVppProvider, dailyExportKwh);
    
    // Revenue = 8 kWh × 35.80c/100 × 365 = 8 × 0.358 × 365 = $1,045.36
    // Fees = $15 × 12 = $180
    // Net = $1,045.36 - $180 = $865.36
    expect(result.dailyExportKwh).toBe(8);
    expect(result.baseRateCents).toBe(35.8);
    expect(result.monthlyFee).toBe(15);
    expect(result.providerType).toBe("wholesale");
    expect(result.totalAnnualValue).toBeCloseTo(865.36, 1);
  });

  it("floors annual value at $0 when fees exceed revenue", () => {
    const lowExportProvider: VppProvider = {
      ...mockVppProvider,
      baseRateCents: "2.00",
      monthlyFee: "50.00",
    };
    // Revenue = 1 kWh × 2c/100 × 365 = $7.30
    // Fees = $50 × 12 = $600
    // Net = $7.30 - $600 = -$592.70 → floored to $0
    const result = calculateVppIncome(lowExportProvider, 1);
    expect(result.totalAnnualValue).toBe(0);
  });

  it("handles fixed rate providers with no monthly fee", () => {
    const fixedProvider: VppProvider = {
      ...mockVppProvider,
      name: "Origin VPP",
      providerType: "fixed",
      baseRateCents: "10.00",
      monthlyFee: "0.00",
      wholesaleMargin: null,
    };
    const dailyExportKwh = 8;
    const result = calculateVppIncome(fixedProvider, dailyExportKwh);
    
    // Revenue = 8 × 10c/100 × 365 = 8 × 0.10 × 365 = $292.00
    // Fees = $0
    // Net = $292.00
    expect(result.providerType).toBe("fixed");
    expect(result.totalAnnualValue).toBeCloseTo(292.0, 1);
  });
});

describe("EV Savings", () => {
  it("calculates petrol vs EV charging costs", () => {
    const result = calculateEvSavings();
    
    // Petrol: 10000km / 100 * 8L * $1.80 = $1440
    expect(result.petrolAnnualCost).toBe(1440);
    
    // EV grid: 10000km / 100 * 15kWh * $0.30 = $450
    expect(result.evGridChargeCost).toBe(450);
    
    // Savings vs petrol: $1440 - $450 = $990
    expect(result.savingsVsPetrol).toBe(990);
    
    // Savings with solar: $1440 - $0 = $1440
    expect(result.savingsWithSolar).toBe(1440);
  });
});

describe("Battery Sizing", () => {
  it("recommends appropriate battery size based on usage", () => {
    // 20 kWh daily usage
    const result = calculateBatterySize(20, false, false);
    
    // 20 * 0.55 / (0.90 * 0.95) = 12.87 kWh, rounds to 15kWh standard size
    expect(result.recommendedKwh).toBe(15);
  });

  it("increases size for EV owners", () => {
    const withEv = calculateBatterySize(20, true, false);
    const withoutEv = calculateBatterySize(20, false, false);
    
    expect(withEv.recommendedKwh).toBeGreaterThanOrEqual(withoutEv.recommendedKwh);
  });

  it("ensures minimum size for VPP participation", () => {
    const result = calculateBatterySize(5, false, true);
    
    // Should be at least 10kWh for VPP
    expect(result.recommendedKwh).toBeGreaterThanOrEqual(10);
  });
});

describe("Solar Sizing", () => {
  it("recommends solar system size based on usage", () => {
    // 7300 kWh/year, 10kWh battery, no EV
    const result = calculateSolarSize(7300, 10, false);
    
    // Should recommend reasonable system size
    expect(result.recommendedKw).toBeGreaterThan(0);
    expect(result.panelCount).toBeGreaterThan(0);
    expect(result.annualGeneration).toBeGreaterThan(7300); // Should exceed usage
  });

  it("increases size for EV owners", () => {
    const withEv = calculateSolarSize(7300, 10, true);
    const withoutEv = calculateSolarSize(7300, 10, false);
    
    expect(withEv.recommendedKw).toBeGreaterThan(withoutEv.recommendedKw);
  });
});

describe("Payback Calculation", () => {
  it("calculates net investment after rebates", () => {
    const result = calculatePayback(
      { solar: 10000, battery: 9000 },
      { solar: 2000, battery: 1000 },
      { electricity: 2000, vpp: 500 }
    );
    
    // Total investment: $10000 + $9000 = $19000
    expect(result.totalInvestment).toBe(19000);
    
    // Total rebates: $2000 + $1000 = $3000
    expect(result.totalRebates).toBe(3000);
    
    // Net investment: $19000 - $3000 = $16000
    expect(result.netInvestment).toBe(16000);
  });

  it("calculates payback period correctly", () => {
    const result = calculatePayback(
      { solar: 10000, battery: 9000 },
      { solar: 2000, battery: 1000 },
      { electricity: 2000, vpp: 500 }
    );
    
    // Annual benefit: $2000 + $500 = $2500
    expect(result.totalAnnualBenefit).toBe(2500);
    
    // Payback: $16000 / $2500 = 6.4 years
    expect(result.paybackYears).toBe(6.4);
  });

  it("calculates long-term savings", () => {
    const result = calculatePayback(
      { solar: 10000, battery: 9000 },
      { solar: 2000, battery: 1000 },
      { electricity: 2000, vpp: 500 }
    );
    
    // 10-year savings: ($2500 * 10) - $16000 = $9000
    expect(result.tenYearSavings).toBe(9000);
    
    // 25-year savings: ($2500 * 25) - $16000 = $46500
    expect(result.twentyFiveYearSavings).toBe(46500);
  });
});

describe("CO2 Reduction", () => {
  it("calculates current emissions correctly", () => {
    const result = calculateCo2Reduction(7300, 18250, 0, false);
    
    // Electricity: 7300 * 0.79 / 1000 = 5.767 tonnes
    // Gas: 18250 * 0.0512 / 1000 = 0.934 tonnes
    expect(result.currentCo2Tonnes).toBeCloseTo(6.7, 0);
  });

  it("calculates reduction with solar", () => {
    const result = calculateCo2Reduction(7300, 18250, 10000, true);
    
    // Should show significant reduction
    expect(result.reductionTonnes).toBeGreaterThan(0);
    expect(result.reductionPercent).toBeGreaterThan(50);
  });

  it("caps reduction at 85% even when fully offset", () => {
    const result = calculateCo2Reduction(7300, 18250, 15000, true);
    
    // With more solar than usage and gas eliminated, still capped at 85%
    // to account for residual grid dependency (overnight loads, winter shortfalls)
    expect(result.reductionPercent).toBe(85);
    expect(result.projectedCo2Tonnes).toBeGreaterThan(0);
  });
});

describe("Constants", () => {
  it("has correct gas conversion factor", () => {
    // 1 MJ = 0.2778 kWh
    expect(CONSTANTS.GAS_MJ_TO_KWH).toBe(0.2778);
  });

  it("has reasonable heat pump COP values", () => {
    expect(CONSTANTS.HEAT_PUMP_COP_MIN).toBeGreaterThanOrEqual(3);
    expect(CONSTANTS.HEAT_PUMP_COP_MAX).toBeLessThanOrEqual(5);
  });

  it("has reasonable EV assumptions", () => {
    expect(CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM).toBeGreaterThan(10);
    expect(CONSTANTS.EV_CONSUMPTION_KWH_PER_100KM).toBeLessThan(25);
  });
});
