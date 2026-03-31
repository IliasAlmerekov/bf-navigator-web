import {
  ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferenceId,
} from '../constants/accessibilityPreferences';

export const HAS_COMPLETED_ONBOARDING_STORAGE_KEY = 'bf-navigator-completed-onboarding';
export const ACCESSIBILITY_PREFERENCE_STORAGE_KEY = 'bf-navigator-accessibility-preference';

const accessibilityPreferenceIds = new Set<string>(
  ACCESSIBILITY_PREFERENCES.map((preference) => preference.id)
);

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function hasCompletedOnboarding() {
  const storage = getStorage();

  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function storeCompletedOnboarding() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(HAS_COMPLETED_ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage access issues and keep the onboarding flow usable.
  }
}

export function getStoredAccessibilityPreference() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    const storedPreferenceId = storage.getItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY);

    if (!storedPreferenceId || !accessibilityPreferenceIds.has(storedPreferenceId)) {
      return null;
    }

    return storedPreferenceId as AccessibilityPreferenceId;
  } catch {
    return null;
  }
}

export function storeAccessibilityPreference(preferenceId: AccessibilityPreferenceId) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY, preferenceId);
  } catch {
    // Ignore storage access issues and keep the onboarding flow usable.
  }
}

export function clearStoredAccessibilityPreference() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(ACCESSIBILITY_PREFERENCE_STORAGE_KEY);
  } catch {
    // Ignore storage access issues and keep the onboarding flow usable.
  }
}
