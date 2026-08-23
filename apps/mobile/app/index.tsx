import { t } from "@kapas/localization";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IloEndorsement } from "../src/components/ilo-endorsement";
import { KapasMark } from "../src/components/kapas-mark";
import { useReducedMotion } from "../src/hooks/use-reduced-motion";
import { isRTL } from "../src/i18n/rtl";
import { useLocaleStore } from "../src/stores/localeStore";
import { fontFamily, motion, semanticColors } from "../src/theme/tokens";
import { urduSafeText } from "../src/theme/urdu-text";

function nextRoute(hasChosenLanguage: boolean, welcomeCompleted: boolean): "/language" | "/welcome" | "/home" {
  if (!hasChosenLanguage) {
    return "/language";
  }
  if (!welcomeCompleted) {
    return "/welcome";
  }
  return "/home";
}

export default function SplashScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const hasChosenLanguage = useLocaleStore((s) => s.hasChosenLanguage);
  const welcomeCompleted = useLocaleStore((s) => s.welcomeCompleted);
  const reducedMotion = useReducedMotion();
  const rtl = isRTL(locale);
  const family = rtl ? fontFamily.urduHeading : fontFamily.uiBold;
  const bodyFamily = rtl ? fontFamily.urduUi : fontFamily.ui;
  const routed = useRef(false);

  useEffect(() => {
    const delay = reducedMotion ? 0 : motion.data + motion.panel + motion.route;
    const timer = setTimeout(() => {
      if (routed.current) {
        return;
      }
      routed.current = true;
      router.replace(nextRoute(hasChosenLanguage, welcomeCompleted));
    }, delay);
    return () => clearTimeout(timer);
  }, [hasChosenLanguage, reducedMotion, router, welcomeCompleted]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: semanticColors.pageWorker }}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t(locale, "splash.accessibilityLabel")}
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 }}
      >
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
          <KapasMark size={108} />
          <Text
            style={{
              color: semanticColors.textPrimary,
              fontFamily: family,
              textAlign: "center",
              ...(rtl ? urduSafeText(28, "heading") : { fontSize: 28, lineHeight: 36, fontWeight: "700" }),
            }}
          >
            {t(locale, "app.name")}
          </Text>
          <Text
            style={{
              color: semanticColors.textSecondary,
              fontFamily: bodyFamily,
              textAlign: "center",
              ...(rtl ? urduSafeText(15, "ui") : { fontSize: 15, lineHeight: 22 }),
            }}
          >
            {t(locale, "splash.initiative")}
          </Text>
          <Text
            style={{
              color: semanticColors.textSecondary,
              fontFamily: bodyFamily,
              textAlign: "center",
              ...(rtl ? urduSafeText(14, "ui") : { fontSize: 14, lineHeight: 20 }),
            }}
          >
            {t(locale, "splash.techPartner")}
          </Text>
        </View>

        <View
          style={{
            alignItems: "center",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: semanticColors.border,
          }}
        >
          <IloEndorsement />
        </View>
      </View>
    </SafeAreaView>
  );
}
