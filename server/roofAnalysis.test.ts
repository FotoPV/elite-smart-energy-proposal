import { describe, it, expect } from 'vitest';
import { generateRoofReport, type RoofAnalysis } from './roofAnalysis';

describe('roofAnalysis', () => {
  const sampleAnalysis: RoofAnalysis = {
    primaryOrientation: 'north',
    orientationConfidence: 'high',
    orientationEvidence: 'Shadow angle and satellite dish position indicate north-facing',
    tiltAngleDegrees: 22,
    tiltCategory: 'standard',
    tiltEvidence: 'Standard pitch residential roof, estimated 20-25 degrees',
    shadingLevel: 'minimal',
    shadingSources: ['Small tree to the west, below roofline'],
    shadingImpactPercent: 3,
    morningShading: false,
    afternoonShading: true,
    roofMaterial: 'colorbond',
    roofCondition: 'good',
    roofColor: 'Dark grey',
    usableAreaEstimateSqm: 45,
    panelCapacityEstimate: 24,
    obstructions: ['Vent pipe near ridge'],
    mountingType: 'flush',
    mountingNotes: 'Standard flush mount on Colorbond, no tilt frames needed',
    solarEfficiencyMultiplier: 0.95,
    annualProductionAdjustment: 'North-facing with minimal shading provides near-optimal generation',
    notes: ['Good candidate for solar installation'],
    warnings: [],
    confidence: 82,
  };

  describe('generateRoofReport', () => {
    it('should generate a formatted report from roof analysis', () => {
      const report = generateRoofReport(sampleAnalysis);
      expect(report).toContain('Roof Analysis Report');
      expect(report).toContain('North');
      expect(report).toContain('high confidence');
      expect(report).toContain('22°');
      expect(report).toContain('Minimal');
      expect(report).toContain('3%');
      expect(report).toContain('Colorbond');
      expect(report).toContain('Good');
      expect(report).toContain('~45m²');
      expect(report).toContain('24 panels');
      expect(report).toContain('95%');
      expect(report).toContain('82%');
    });

    it('should handle unknown/null values gracefully', () => {
      const unknownAnalysis: RoofAnalysis = {
        primaryOrientation: 'unknown',
        orientationConfidence: 'low',
        orientationEvidence: null,
        tiltAngleDegrees: null,
        tiltCategory: 'unknown',
        tiltEvidence: null,
        shadingLevel: 'unknown',
        shadingSources: [],
        shadingImpactPercent: null,
        morningShading: null,
        afternoonShading: null,
        roofMaterial: 'unknown',
        roofCondition: 'unknown',
        roofColor: null,
        usableAreaEstimateSqm: null,
        panelCapacityEstimate: null,
        obstructions: [],
        mountingType: 'unknown',
        mountingNotes: null,
        solarEfficiencyMultiplier: 0.85,
        annualProductionAdjustment: null,
        notes: [],
        warnings: ['Roof analysis failed — manual site inspection required'],
        confidence: 0,
      };

      const report = generateRoofReport(unknownAnalysis);
      expect(report).toContain('Roof Analysis Report');
      expect(report).toContain('Unknown');
      expect(report).toContain('85%');
      expect(report).toContain('0%');
    });

    it('should include shading sources when present', () => {
      const report = generateRoofReport(sampleAnalysis);
      expect(report).toContain('Small tree to the west');
    });

    it('should format different roof materials correctly', () => {
      const tileAnalysis = { ...sampleAnalysis, roofMaterial: 'tile_concrete' as const };
      const report = generateRoofReport(tileAnalysis);
      expect(report).toContain('Tile concrete');
    });

    it('should include efficiency multiplier as percentage', () => {
      const report = generateRoofReport(sampleAnalysis);
      expect(report).toContain('95%');
    });
  });

  describe('RoofAnalysis interface', () => {
    it('should have all required fields', () => {
      expect(sampleAnalysis.primaryOrientation).toBe('north');
      expect(sampleAnalysis.orientationConfidence).toBe('high');
      expect(sampleAnalysis.tiltAngleDegrees).toBe(22);
      expect(sampleAnalysis.shadingLevel).toBe('minimal');
      expect(sampleAnalysis.roofMaterial).toBe('colorbond');
      expect(sampleAnalysis.solarEfficiencyMultiplier).toBe(0.95);
      expect(sampleAnalysis.confidence).toBe(82);
    });

    it('should support all orientation values', () => {
      const orientations = ['north', 'north-east', 'north-west', 'east', 'west', 'south', 'south-east', 'south-west', 'flat', 'unknown'] as const;
      orientations.forEach(o => {
        const a = { ...sampleAnalysis, primaryOrientation: o };
        expect(a.primaryOrientation).toBe(o);
      });
    });

    it('should support all roof material values', () => {
      const materials = ['colorbond', 'tile_concrete', 'tile_terracotta', 'slate', 'flat_membrane', 'polycarbonate', 'unknown'] as const;
      materials.forEach(m => {
        const a = { ...sampleAnalysis, roofMaterial: m };
        expect(a.roofMaterial).toBe(m);
      });
    });
  });
});
