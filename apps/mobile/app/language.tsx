import { t } from "@kapas/localization";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ActionDock } from "../src/components/action-dock";
import { KapasMark } from "../src/components/kapas-mark";
import { LanguageCard } from "../src/components/language-card";
import { PrimaryCta } from "../src/components/primary-cta";
import { ScreenShell } from "../src/components/screen-shell";
import { useAutoPromptId } from "../src/hooks/use-prompt-playback";
import { isRTL } from "../src/i18n/rtl";
import { useLocaleStore } from "../src/stores/localeStore";
import { fontFamily, mobileType, semanticColors } from "../src/theme/tokens";
import { localizedTextMetrics, urduBrandText } from "../src/theme/urdu-text";

export default function LanguageScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const hasChosenLanguage = useLocaleStore((s) => s.hasChosenLanguage);
  const rtl = isRTL(locale);
  const headingFamily = rtl ? fontFamily.urduHeading : fontFamily.uiBold;
  const bodyFamily = rtl ? fontFamily.urduUi : fontFamily.ui;
  const align = rtl ? "right" : "left";
  const logoMetrics = locale === "ur" ? urduBrandText(mobileType.answer.size) : localizedTextMetrics(locale, mobileType.answer.size, mobileType.answer.line, "heading");
  const headingMetrics = localizedTextMetrics(locale, mobileType.question.size, mobileType.question.line, "heading");
  const bodyMetrics = localizedTextMetrics(locale, mobileType.body.size, mobileType.body.line);
  useAutoPromptId("SC-welcome");

  return (
    <ScreenShell
      footer={
        <ActionDock>
          <PrimaryCta
            labelKey="common.continue"
            icon="arrow-forward-circle"
            disabled={!hasChosenLanguage}
            onPress={() => router.replace("/home")}
          />
        </ActionDock>
      }
    >
      <View style={{ flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
        <KapasMark size={48} />
        <Text style={{ flex: 1, color: semanticColors.actionPrimary, fontFamily: headingFamily, textAlign: align, ...logoMetrics }}>
          {t(locale, "app.name")}
        </Text>
      </View>
      <Text
        style={{
          color: semanticColors.textPrimary,
          fontFamily: headingFamily,
          textAlign: align,
          ...headingMetrics,
        }}
      >
        {t(locale, "onboarding.chooseLanguage")}
      </Text>
      <Text style={{ color: semanticColors.textSecondary, fontFamily: bodyFamily, textAlign: align, ...bodyMetrics }}>
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
