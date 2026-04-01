export const AUTH_TOKEN_STORAGE_KEY = 'bf-navigator-auth-token';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getToken() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage access issues and keep the auth flow usable.
  }
}

export function clearToken() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage access issues and keep the auth flow usable.
  }
}
