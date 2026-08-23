import * as SecureStore from "expo-secure-store";

const keyFor = (draftId: string) => `kapas-cnic-${draftId.replace(/[^A-Za-z0-9._-]/g, "-")}`;

export function normalizeCnic(value: string): string {
  return value.replace(/\D/g, "").slice(0, 13);
}

export function isValidCnic(value: string): boolean {
  return /^\d{13}$/.test(normalizeCnic(value));
}

export function formatCnic(value: string): string {
  const digits = normalizeCnic(value);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export const expoIdentityService = {
  async saveCnic(draftId: string, value: string): Promise<string> {
    const normalized = normalizeCnic(value);
    if (!isValidCnic(normalized)) {
      throw new Error("invalid-cnic");
    }
    await SecureStore.setItemAsync(keyFor(draftId), normalized, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return normalized.slice(-4);
  },
  async removeCnic(draftId: string): Promise<void> {
    await SecureStore.deleteItemAsync(keyFor(draftId));
  },
};
