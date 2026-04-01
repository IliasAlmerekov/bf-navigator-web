import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_TOKEN_STORAGE_KEY, clearToken, getToken, storeToken } from './tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('stores and returns the auth token', () => {
    storeToken('jwt-token');

    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('jwt-token');
    expect(getToken()).toBe('jwt-token');
  });

  it('clears the auth token', () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'jwt-token');

    clearToken();

    expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('returns null when window is unavailable', () => {
    vi.stubGlobal('window', undefined);

    expect(getToken()).toBeNull();
  });

  it('returns null when reading localStorage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(getToken()).toBeNull();
  });

  it('does not throw when writing or clearing localStorage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => storeToken('jwt-token')).not.toThrow();
    expect(() => clearToken()).not.toThrow();
  });
});
