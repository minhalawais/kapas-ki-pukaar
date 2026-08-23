import { t } from "@kapas/localization";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ActionDock } from "../src/components/action-dock";
import { KapasMark } from "../src/components/kapas-mark";
import { LanguageCard } from "../src/components/language-card";
import { PrimaryCta } from "../src/components/primary-cta";
import { ScreenShell } from "../src/components/screen-shell";
import { isRTL } from "../src/i18n/rtl";
import { useLocaleStore } from "../src/stores/localeStore";
import { fontFamily, mobileType, semanticColors } from "../src/theme/tokens";

export default function LanguageScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const hasChosenLanguage = useLocaleStore((s) => s.hasChosenLanguage);
  const welcomeCompleted = useLocaleStore((s) => s.welcomeCompleted);
  const headingFamily = isRTL(locale) ? fontFamily.urduHeading : fontFamily.uiBold;
  const bodyFamily = isRTL(locale) ? fontFamily.urduUi : fontFamily.ui;
  const align = isRTL(locale) ? "right" : "left";

  return (
    <ScreenShell
      footer={
        <ActionDock>
          <PrimaryCta
            labelKey="common.continue"
            icon="arrow-forward-circle"
            disabled={!hasChosenLanguage}
            onPress={() => router.replace(welcomeCompleted ? "/home" : "/welcome")}
          />
        </ActionDock>
      }
    >
      <View style={{ flexDirection: isRTL(locale) ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
        <KapasMark size={48} />
        <Text style={{ flex: 1, color: semanticColors.actionPrimary, fontSize: mobileType.answer.size, lineHeight: mobileType.answer.line, fontFamily: headingFamily, textAlign: align }}>
          {t(locale, "app.name")}
        </Text>
      </View>
      <Text
        style={{
          color: semanticColors.textPrimary,
          fontSize: mobileType.question.size,
          lineHeight: mobileType.question.line,
          fontFamily: headingFamily,
          textAlign: align,
        }}
      >
        {t(locale, "onboarding.chooseLanguage")}
      </Text>
      <Text style={{ color: semanticColors.textSecondary, fontSize: mobileType.body.size, lineHeight: mobileType.body.line, fontFamily: bodyFamily, textAlign: align }}>
        {t(locale, "onboarding.chooseLanguageHelp")}
      </Text>
      <LanguageCard
        localeValue="ur"
        selected={hasChosenLanguage && locale === "ur"}
        onPress={() => void setLocale("ur")}
      />
      <LanguageCard
        localeValue="en"
        selected={hasChosenLanguage && locale === "en"}
        onPress={() => void setLocale("en")}
      />
      <View style={{ flex: 1 }} />
    </ScreenShell>
  );
}
