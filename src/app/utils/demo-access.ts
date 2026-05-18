/** Session flag for the temporary demo access gate (replaced by real auth later). */
const DEMO_ACCESS_STORAGE_KEY = 'amplify-demo-access-granted';

/** Placeholder access code until backend auth exists. */
const DEMO_ACCESS_CODE = 'nextgencm26!';

export function isDemoAccessGranted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DEMO_ACCESS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function grantDemoAccess(): void {
  try {
    sessionStorage.setItem(DEMO_ACCESS_STORAGE_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

export function revokeDemoAccess(): void {
  try {
    sessionStorage.removeItem(DEMO_ACCESS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function verifyDemoAccessCode(input: string): boolean {
  return input.trim() === DEMO_ACCESS_CODE;
}
