/** Session flag for the temporary demo access gate (replaced by real auth later). */
import { STORAGE_KEYS } from '../constants/storage-keys';

/** Placeholder access code until backend auth exists. */
const DEMO_ACCESS_CODE = 'nextgencm26!';

export function isDemoAccessGranted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.demoAccessGranted) === '1';
  } catch {
    return false;
  }
}

export function grantDemoAccess(): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.demoAccessGranted, '1');
  } catch {
    // ignore quota / private mode
  }
}

export function revokeDemoAccess(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.demoAccessGranted);
  } catch {
    // ignore
  }
}

export function verifyDemoAccessCode(input: string): boolean {
  return input.trim() === DEMO_ACCESS_CODE;
}
