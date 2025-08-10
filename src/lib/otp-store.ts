export type OTPEntry = { code: string; expiresAt: number };

const otpStore = new Map<string, OTPEntry>();

export function setOtp(email: string, code: string, ttlMs = 5 * 60 * 1000) {
  otpStore.set(email, { code, expiresAt: Date.now() + ttlMs });
}

export function verifyOtp(email: string, code: string) {
  const entry = otpStore.get(email);
  if (!entry) return false;
  const isValid = entry.code === code && entry.expiresAt > Date.now();
  if (isValid) {
    otpStore.delete(email);
  }
  return isValid;
}
