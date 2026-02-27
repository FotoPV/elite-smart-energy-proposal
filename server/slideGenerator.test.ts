import { describe, expect, it } from "vitest";
import { generateSlides, generateSlideHTML, ProposalData } from "./slideGenerator";

// Sample proposal data for testing
const sampleProposalData: ProposalData = {
  customerName: "Paul Stokes",
  address: "123 Test Street, Adelaide SA 5000",
  state: "SA",
  retailer: "AGL",
  dailyUsageKwh: 18.5,
  annualUsageKwh: 6752,
  supplyChargeCentsPerDay: 95,
  usageRateCentsPerKwh: 32,
  feedInTariffCentsPerKwh: 5,
  annualCost: 2800,
  hasGas: true,
  gasAnnualMJ: 15000,
  gasAnnualCost: 1200,
  solarSizeKw: 10,
  panelCount: 20,
  panelWattage: 440,
  panelBrand: "Trina Solar Vertex S+",
  batterySizeKwh: 24,
  batteryBrand: "Sigenergy SigenStor",
  inverterSizeKw: 8,
  inverterBrand: "Sigenergy",
  systemCost: 25800,
  rebateAmount: 3600,
  netInvestment: 22200,
  annualSavings: 3710,
  paybackYears: 6.0,
  tenYearSavings: 37100,
  vppProvider: "AGL",
  vppProgram: "VPP Advantage",
  vppAnnualValue: 450,
  hasGasBundle: true,
  hasEV: true,
  evAnnualKm: 10000,
  evAnnualSavings: 2000,
  hasPoolPump: false,
  hasHeatPump: true,
  heatPumpSavings: 800,
  co2ReductionTonnes: 8.5,
};

describe("generateSlides", () => {
  it("generates 16 slides for the new structure (environmental_impact removed)", () => {
    const slides = generateSlides(sampleProposalData);
    expect(slides.length).toBe(16);
  });

  it("includes cover slide with customer name", () => {
    const slides = generateSlides(sampleProposalData);
    const coverSlide = slides.find(s => s.type === "cover");
    expect(coverSlide).toBeDefined();
    expect(coverSlide?.title).toBe("Paul Stokes");
  });

  it("includes executive summary slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "executive_summary");
    expect(slide).toBeDefined();
  });

  it("includes bill analysis slide", () => {
    const slides = generateSlides(sampleProposalData);
    const billSlide = slides.find(s => s.type === "bill_analysis");
    expect(billSlide).toBeDefined();
    expect(billSlide?.content.annualCost).toBe(2800);
  });

  it("includes bill breakdown slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "bill_breakdown");
    expect(slide).toBeDefined();
  });

  it("includes seasonal usage slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "seasonal_usage");
    expect(slide).toBeDefined();
  });

  it("includes annual consumption slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "annual_consumption");
    expect(slide).toBeDefined();
  });

  it("includes projected annual cost slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "projected_annual_cost");
    expect(slide).toBeDefined();
  });

  it("includes battery benefits slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "battery_benefits");
    expect(slide).toBeDefined();
  });

  it("includes battery considerations slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "battery_considerations");
    expect(slide).toBeDefined();
  });

  it("includes battery storage slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "battery_storage");
    expect(slide).toBeDefined();
  });

  it("includes solar PV slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "solar_pv");
    expect(slide).toBeDefined();
  });

  it("includes financial impact slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "financial_impact");
    expect(slide).toBeDefined();
  });

  it("does not include environmental impact slide (removed)", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "environmental_impact");
    expect(slide).toBeUndefined();
  });

  it("includes strategic pathway slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "strategic_pathway");
    expect(slide).toBeDefined();
  });

  it("includes contact slide", () => {
    const slides = generateSlides(sampleProposalData);
    const contactSlide = slides.find(s => s.type === "contact");
    expect(contactSlide).toBeDefined();
  });

  it("includes VPP recommendation slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "vpp_recommendation");
    expect(slide).toBeDefined();
  });

  it("includes financial impact analysis slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "financial_impact_analysis");
    expect(slide).toBeDefined();
    expect(slide?.content.netSystemCost).toBe(22200);
    expect(slide?.content.paybackYears).toBe(6.0);
  });
});

describe("generateSlideHTML", () => {
  it("generates valid HTML for cover slide", () => {
    const slides = generateSlides(sampleProposalData);
    const coverSlide = slides.find(s => s.type === "cover");
    expect(coverSlide).toBeDefined();
    
    const html = generateSlideHTML(coverSlide!);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Paul Stokes");
    expect(html).toContain("Elite Smart Energy");
  });

  it("generates valid HTML for financial impact analysis slide", () => {
    const slides = generateSlides(sampleProposalData);
    const slide = slides.find(s => s.type === "financial_impact_analysis");
    expect(slide).toBeDefined();
    
    const html = generateSlideHTML(slide!);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("$22,200");
  });

  it("includes brand colors in generated HTML", () => {
    const slides = generateSlides(sampleProposalData);
    const html = generateSlideHTML(slides[0]);
    
    // Check for brand colors
    expect(html).toContain("#46B446"); // Aqua
    expect(html).toContain("#1a1a1a"); // Dark charcoal background
  });

  it("includes copyright in generated HTML", () => {
    const slides = generateSlides(sampleProposalData);
    const html = generateSlideHTML(slides[0]);
    
    expect(html).toContain("Elite Smart Energy");
    expect(html).toContain("Elite Smart Energy");
  });
});

describe("slide data structure", () => {
  it("each slide has required properties", () => {
    const slides = generateSlides(sampleProposalData);
    
    slides.forEach(slide => {
      expect(slide).toHaveProperty("id");
      expect(slide).toHaveProperty("type");
      expect(slide).toHaveProperty("title");
      expect(slide).toHaveProperty("content");
      expect(typeof slide.id).toBe("number");
      expect(typeof slide.type).toBe("string");
      expect(typeof slide.title).toBe("string");
    });
  });

  it("slide IDs are sequential", () => {
    const slides = generateSlides(sampleProposalData);
    
    for (let i = 0; i < slides.length; i++) {
      expect(slides[i].id).toBe(i + 1);
    }
  });

  it("slides follow the correct order", () => {
    const slides = generateSlides(sampleProposalData);
    const types = slides.map(s => s.type);
    
    expect(types[0]).toBe("cover");
    expect(types[1]).toBe("executive_summary");
    expect(types[2]).toBe("bill_analysis");
    expect(types[3]).toBe("bill_breakdown");
    expect(types[4]).toBe("seasonal_usage");
    expect(types[5]).toBe("annual_consumption");
    expect(types[6]).toBe("projected_annual_cost");
    expect(types[7]).toBe("battery_benefits");
    expect(types[8]).toBe("battery_considerations");
    expect(types[9]).toBe("battery_storage");
    expect(types[10]).toBe("solar_pv");
    expect(types[11]).toBe("financial_impact");
    // environmental_impact removed — replaced by scope_of_works split
    expect(types[12]).toBe("strategic_pathway");
    expect(types[13]).toBe("contact");
    expect(types[14]).toBe("vpp_recommendation");
    expect(types[15]).toBe("financial_impact_analysis");
  });
});
