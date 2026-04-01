import type { AccessibilityPreferenceId } from '../constants/accessibilityPreferences';

export enum AccessibilityType {
  WHEELCHAIR = 'WHEELCHAIR',
  VISUAL_IMPAIRMENT = 'VISUAL_IMPAIRMENT',
  HEARING_IMPAIRMENT = 'HEARING_IMPAIRMENT',
  MOBILITY_IMPAIRMENT = 'MOBILITY_IMPAIRMENT',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accessibilityTypes: AccessibilityType[];
}

export interface AuthResponse {
  token: string;
}

export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  accessibilityTypes: AccessibilityType[];
}

const backendAccessibilityTypeByPreferenceId: Record<
  Exclude<AccessibilityPreferenceId, 'stroller'>,
  AccessibilityType
> = {
  wheelchair: AccessibilityType.WHEELCHAIR,
  vision: AccessibilityType.VISUAL_IMPAIRMENT,
  hearing: AccessibilityType.HEARING_IMPAIRMENT,
  mobility: AccessibilityType.MOBILITY_IMPAIRMENT,
};

export function toBackendAccessibilityType(
  id: AccessibilityPreferenceId
): AccessibilityType | null {
  if (id === 'stroller') {
    return null;
  }

  return backendAccessibilityTypeByPreferenceId[id];
}
