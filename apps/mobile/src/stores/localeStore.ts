import type { Locale } from "@kapas/domain";
import { persistenceKeys } from "@kapas/domain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18nManager } from "react-native";
import { create } from "zustand";

import { isRTL } from "../i18n/rtl";

interface OnboardingState {
  welcomeCompleted: boolean;
}

interface LocaleState {
  locale: Locale;
  hydrated: boolean;
  hasChosenLanguage: boolean;
  welcomeCompleted: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  completeWelcome: () => Promise<void>;
  hydrate: () => Promise<void>;
}

async function applyDirection(locale: Locale): Promise<void> {
  const rtl = isRTL(locale);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

async function readOnboarding(): Promise<OnboardingState> {
  const raw = await AsyncStorage.getItem(persistenceKeys.onboarding);
  if (!raw) {
    return { welcomeCompleted: false };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return { welcomeCompleted: Boolean(parsed.welcomeCompleted) };
  } catch {
    return { welcomeCompleted: false };
  }
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: "ur",
  hydrated: false,
  hasChosenLanguage: false,
  welcomeCompleted: false,
  setLocale: async (locale) => {
    await AsyncStorage.setItem(persistenceKeys.locale, locale);
    await applyDirection(locale);
    set({ locale, hasChosenLanguage: true });
  },
  completeWelcome: async () => {
    await AsyncStorage.setItem(
      persistenceKeys.onboarding,
      JSON.stringify({ welcomeCompleted: true } satisfies OnboardingState),
    );
    set({ welcomeCompleted: true });
  },
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }
    const [stored, onboarding] = await Promise.all([
      AsyncStorage.getItem(persistenceKeys.locale),
      readOnboarding(),
    ]);
    if (stored === "ur" || stored === "en") {
      await applyDirection(stored);
      set({
        locale: stored,
        hydrated: true,
        hasChosenLanguage: true,
        welcomeCompleted: onboarding.welcomeCompleted,
      });
      return;
    }
    set({ hydrated: true, welcomeCompleted: onboarding.welcomeCompleted });
  },
}));
