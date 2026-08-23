import { t } from "@kapas/localization";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ActionDock } from "../src/components/action-dock";
import { PrimaryCta } from "../src/components/primary-cta";
import { ScreenShell } from "../src/components/screen-shell";
import { IconBadge } from "../src/components/ui-primitives";
import { WelcomeIllustration } from "../src/components/welcome-illustration";
import { useAutoScreenPrompt } from "../src/hooks/use-prompt-playback";
import { isRTL } from "../src/i18n/rtl";
import { useLocaleStore } from "../src/stores/localeStore";
import { fontFamily, mobileType, semanticColors } from "../src/theme/tokens";

export default function WelcomeScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const completeWelcome = useLocaleStore((s) => s.completeWelcome);
  useAutoScreenPrompt("M-003");
  const family = isRTL(locale) ? fontFamily.urduUi : fontFamily.ui;
  const headingFamily = isRTL(locale) ? fontFamily.urduHeading : fontFamily.uiBold;
  const align = isRTL(locale) ? "right" : "left";

  return (
    <ScreenShell
      scroll
      footer={
        <ActionDock>
          <PrimaryCta
            labelKey="common.continue"
            icon="arrow-forward-circle"
            onPress={() => {
              void completeWelcome().then(() => router.replace("/home"));
            }}
          />
        </ActionDock>
      }
    >
      <View accessibilityRole="image" accessibilityLabel={t(locale, "splash.accessibilityLabel")}>
        <WelcomeIllustration />
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
        {t(locale, "onboarding.welcomeTitle")}
      </Text>
      <Text
        style={{
          color: semanticColors.textPrimary,
          fontSize: mobileType.body.size,
          lineHeight: mobileType.body.line,
          fontFamily: family,
          textAlign: align,
        }}
      >
        {t(locale, "onboarding.welcomeBody")}
      </Text>
      <View style={{ gap: 12, paddingVertical: 4 }}>
        {([
          ["shield-checkmark", "onboarding.private"],
          ["list-circle", "onboarding.guided"],
        ] as const).map(([icon, key]) => (
          <View key={key} style={{ flexDirection: isRTL(locale) ? "row-reverse" : "row", alignItems: "center", gap: 12 }}>
            <IconBadge icon={icon} tone="teal" size={40} />
            <Text style={{ flex: 1, color: semanticColors.textPrimary, fontSize: mobileType.body.size, lineHeight: mobileType.body.line, fontFamily: family, textAlign: align }}>
              {t(locale, key)}
            </Text>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}
