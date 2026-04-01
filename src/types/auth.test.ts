import { describe, expect, it } from 'vitest';
import { AccessibilityType, toBackendAccessibilityType } from './auth';

describe('toBackendAccessibilityType', () => {
  it.each([
    ['wheelchair', AccessibilityType.WHEELCHAIR],
    ['vision', AccessibilityType.VISUAL_IMPAIRMENT],
    ['hearing', AccessibilityType.HEARING_IMPAIRMENT],
    ['mobility', AccessibilityType.MOBILITY_IMPAIRMENT],
  ])('maps %s to the matching backend accessibility type', (input, expected) => {
    expect(toBackendAccessibilityType(input)).toBe(expected);
  });

  it('returns null for stroller until the backend supports it', () => {
    expect(toBackendAccessibilityType('stroller')).toBeNull();
  });
});
