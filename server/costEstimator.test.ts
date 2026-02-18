import { describe, it, expect } from 'vitest';
import { applyFallbackCostEstimates, calculateTotalCostRange, calculateCableRunCostItem } from './switchboardAnalysis';

describe('Cost Estimator', () => {
  describe('applyFallbackCostEstimates', () => {
    it('preserves existing cost estimates from LLM', () => {
      const items = [
        { item: 'Main switch upgrade', detail: 'Upgrade from 63A to 80A', priority: 'required' as const, estimatedCost: '$300-$500' },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$300-$500');
    });

    it('fills in missing cost for main switch upgrade', () => {
      const items = [
        { item: 'Main switch upgrade', detail: 'Upgrade from 63A to 80A MCB', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$250-$450');
    });

    it('fills in missing cost for RCD installation', () => {
      const items = [
        { item: 'Install RCD', detail: 'Add RCD safety switch for solar circuits', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$150-$300');
    });

    it('fills in missing cost for dedicated MCB', () => {
      const items = [
        { item: 'Add dedicated MCB for solar', detail: 'Install 32A MCB in position 11', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$80-$150');
    });

    it('fills in missing cost for meter swap', () => {
      const items = [
        { item: 'Meter upgrade', detail: 'DNSP application for bi-directional meter', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$0 (DNSP)');
    });

    it('fills in missing cost for switchboard replacement', () => {
      const items = [
        { item: 'Replace board', detail: 'Full switchboard replacement — insufficient space', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$1,500-$3,500');
    });

    it('uses $TBC for unrecognised scope items', () => {
      const items = [
        { item: 'Custom work', detail: 'Something unusual', priority: 'optional' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$TBC');
    });

    it('handles multiple items with mixed costs', () => {
      const items = [
        { item: 'Main switch upgrade', detail: 'Upgrade to 80A', priority: 'required' as const, estimatedCost: '$400' },
        { item: 'Add dedicated MCB', detail: 'Solar breaker', priority: 'required' as const, estimatedCost: null },
        { item: 'Meter swap', detail: 'Bi-directional meter', priority: 'recommended' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      expect(result[0].estimatedCost).toBe('$400'); // preserved
      expect(result[1].estimatedCost).toBe('$80-$150'); // filled
      expect(result[2].estimatedCost).toBe('$0 (DNSP)'); // filled
    });

    it('matches longest keyword for specificity', () => {
      const items = [
        { item: 'Full RCD compliance upgrade', detail: 'All circuits need RCD protection', priority: 'required' as const, estimatedCost: null },
      ];
      const result = applyFallbackCostEstimates(items);
      // Should match 'rcd compliance' ($400-$800) not just 'rcd' ($150-$300)
      expect(result[0].estimatedCost).toBe('$400-$800');
    });
  });

  describe('calculateTotalCostRange', () => {
    it('calculates total from range costs', () => {
      const items = [
        { item: 'Main switch', detail: '', priority: 'required' as const, estimatedCost: '$250-$450' },
        { item: 'MCB', detail: '', priority: 'required' as const, estimatedCost: '$80-$150' },
      ];
      const result = calculateTotalCostRange(items);
      expect(result).not.toBeNull();
      expect(result!.min).toBe(330);
      expect(result!.max).toBe(600);
      expect(result!.formatted).toBe('$330-$600');
    });

    it('handles single-value costs', () => {
      const items = [
        { item: 'Meter', detail: '', priority: 'required' as const, estimatedCost: '$0 (DNSP)' },
        { item: 'MCB', detail: '', priority: 'required' as const, estimatedCost: '$100' },
      ];
      const result = calculateTotalCostRange(items);
      expect(result).not.toBeNull();
      expect(result!.min).toBe(100);
      expect(result!.max).toBe(100);
      expect(result!.formatted).toBe('$100');
    });

    it('skips $TBC items', () => {
      const items = [
        { item: 'Main switch', detail: '', priority: 'required' as const, estimatedCost: '$250-$450' },
        { item: 'Custom', detail: '', priority: 'optional' as const, estimatedCost: '$TBC' },
      ];
      const result = calculateTotalCostRange(items);
      expect(result).not.toBeNull();
      expect(result!.min).toBe(250);
      expect(result!.max).toBe(450);
    });

    it('returns null when no costs available', () => {
      const items = [
        { item: 'Custom', detail: '', priority: 'optional' as const, estimatedCost: '$TBC' },
        { item: 'Other', detail: '', priority: 'optional' as const, estimatedCost: null },
      ];
      const result = calculateTotalCostRange(items);
      expect(result).toBeNull();
    });

    it('handles empty array', () => {
      const result = calculateTotalCostRange([]);
      expect(result).toBeNull();
    });

    it('handles comma-formatted costs', () => {
      const items = [
        { item: 'Board', detail: '', priority: 'required' as const, estimatedCost: '$1,500-$3,500' },
      ];
      const result = calculateTotalCostRange(items);
      expect(result).not.toBeNull();
      expect(result!.min).toBe(1500);
      expect(result!.max).toBe(3500);
      expect(result!.formatted).toBe('$1,500-$3,500');
    });
  });

  describe('calculateCableRunCostItem', () => {
    it('calculates single-phase cable run cost for 21.3m (Fayyaz Khan)', () => {
      const result = calculateCableRunCostItem(21.3, 'single');
      expect(result).not.toBeNull();
      expect(result!.item).toContain('16mm single phase');
      // 21.3m - 10m free = 11.3m chargeable at $33/m = $373
      expect(result!.estimatedCost).toBe('$373');
      expect(result!.detail).toContain('21.3m measured');
      expect(result!.detail).toContain('10m included');
      expect(result!.detail).toContain('11.3m chargeable');
      expect(result!.detail).toContain('$33/m');
      expect(result!.priority).toBe('required');
    });

    it('calculates three-phase cable run cost for 21.3m', () => {
      const result = calculateCableRunCostItem(21.3, 'three');
      expect(result).not.toBeNull();
      expect(result!.item).toContain('16mm 3 phase');
      // 21.3m - 5m free = 16.3m chargeable at $55/m = $897
      expect(result!.estimatedCost).toBe('$897');
      expect(result!.detail).toContain('5m included');
      expect(result!.detail).toContain('$55/m');
    });

    it('returns $0 when distance is within free allowance (single phase)', () => {
      const result = calculateCableRunCostItem(8.0, 'single');
      expect(result).not.toBeNull();
      expect(result!.estimatedCost).toBe('$0');
      expect(result!.detail).toContain('within 10m included allowance');
    });

    it('returns $0 when distance is within free allowance (three phase)', () => {
      const result = calculateCableRunCostItem(4.5, 'three');
      expect(result).not.toBeNull();
      expect(result!.estimatedCost).toBe('$0');
      expect(result!.detail).toContain('within 5m included allowance');
    });

    it('returns null for zero distance', () => {
      const result = calculateCableRunCostItem(0, 'single');
      expect(result).toBeNull();
    });

    it('returns null for negative distance', () => {
      const result = calculateCableRunCostItem(-5, 'single');
      expect(result).toBeNull();
    });

    it('handles exactly 10m single-phase (boundary)', () => {
      const result = calculateCableRunCostItem(10.0, 'single');
      expect(result).not.toBeNull();
      expect(result!.estimatedCost).toBe('$0');
    });

    it('handles 3-phase string variants', () => {
      const r1 = calculateCableRunCostItem(15, '3-phase');
      const r2 = calculateCableRunCostItem(15, 'three-phase');
      expect(r1).not.toBeNull();
      expect(r2).not.toBeNull();
      expect(r1!.item).toContain('3 phase');
      expect(r2!.item).toContain('3 phase');
      // 15m - 5m = 10m at $55/m = $550
      expect(r1!.estimatedCost).toBe('$550');
      expect(r2!.estimatedCost).toBe('$550');
    });

    it('integrates with calculateTotalCostRange', () => {
      const cableItem = calculateCableRunCostItem(21.3, 'single')!;
      const items = [
        { item: 'Main switch', detail: '', priority: 'required' as const, estimatedCost: '$250-$450' },
        cableItem,
      ];
      const total = calculateTotalCostRange(items);
      expect(total).not.toBeNull();
      // $250 + $373 = $623 min, $450 + $373 = $823 max
      expect(total!.min).toBe(623);
      expect(total!.max).toBe(823);
    });
  });
});
