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
  panelWattage: 500,
  panelBrand: "AIKO Neostar",
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
  vppProvider: "ENGIE",
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
  it("generates the correct number of slides", () => {
    const slides = generateSlides(sampleProposalData);
    // Should have at least 14 slides (cover through conclusion)
    expect(slides.length).toBeGreaterThanOrEqual(14);
  });

  it("includes cover slide with customer name", () => {
    const slides = generateSlides(sampleProposalData);
    const coverSlide = slides.find(s => s.type === "cover");
    expect(coverSlide).toBeDefined();
    expect(coverSlide?.title).toBe("Paul Stokes");
  });

  it("includes annual expenditure slide", () => {
    const slides = generateSlides(sampleProposalData);
    const expenditureSlide = slides.find(s => s.type === "annual_expenditure");
    expect(expenditureSlide).toBeDefined();
    expect(expenditureSlide?.content.annualCost).toBe(2800);
  });

  it("includes EV analysis slide when hasEV is true", () => {
    const slides = generateSlides(sampleProposalData);
    const evSlide = slides.find(s => s.type === "ev_analysis");
    expect(evSlide).toBeDefined();
    expect(evSlide?.content.annualKm).toBe(10000);
  });

  it("excludes EV analysis slide when hasEV is false", () => {
    const dataWithoutEV = { ...sampleProposalData, hasEV: false, evAnnualKm: undefined };
    const slides = generateSlides(dataWithoutEV);
    const evSlide = slides.find(s => s.type === "ev_analysis");
    expect(evSlide).toBeUndefined();
  });

  it("includes VPP comparison slide", () => {
    const slides = generateSlides(sampleProposalData);
    const vppSlide = slides.find(s => s.type === "vpp_comparison");
    expect(vppSlide).toBeDefined();
  });

  it("includes financial summary slide with correct values", () => {
    const slides = generateSlides(sampleProposalData);
    const financialSlide = slides.find(s => s.type === "financial_summary");
    expect(financialSlide).toBeDefined();
    expect(financialSlide?.content.netInvestment).toBe(22200);
    expect(financialSlide?.content.paybackYears).toBe(6.0);
  });

  it("includes conclusion slide", () => {
    const slides = generateSlides(sampleProposalData);
    const conclusionSlide = slides.find(s => s.type === "conclusion");
    expect(conclusionSlide).toBeDefined();
  });

  it("includes contact slide", () => {
    const slides = generateSlides(sampleProposalData);
    const contactSlide = slides.find(s => s.type === "contact");
    expect(contactSlide).toBeDefined();
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
    expect(html).toContain("Lightning Energy");
  });

  it("generates valid HTML for financial summary slide", () => {
    const slides = generateSlides(sampleProposalData);
    const financialSlide = slides.find(s => s.type === "financial_summary");
    expect(financialSlide).toBeDefined();
    
    const html = generateSlideHTML(financialSlide!);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("$22,200");
    expect(html).toContain("6.0");
  });

  it("includes brand colors in generated HTML", () => {
    const slides = generateSlides(sampleProposalData);
    const html = generateSlideHTML(slides[0]);
    
    // Check for brand colors
    expect(html).toContain("#00EAD3"); // Aqua
    expect(html).toContain("#f36710"); // Orange
    expect(html).toContain("#000000"); // Black background
  });

  it("includes copyright in generated HTML", () => {
    const slides = generateSlides(sampleProposalData);
    const html = generateSlideHTML(slides[0]);
    
    expect(html).toContain("Lightning Energy");
    expect(html).toContain("George Fotopoulos");
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
});
