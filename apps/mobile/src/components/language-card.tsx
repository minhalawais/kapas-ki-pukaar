import { t } from "@kapas/localization";
import { Pressable, Text } from "react-native";

import { isRTL } from "../i18n/rtl";
import { useLocaleStore } from "../stores/localeStore";
import { controlSize, fontFamily, mobileType, radiusUsage, semanticColors } from "../theme/tokens";

interface Props {
  localeValue: "ur" | "en";
  selected: boolean;
  onPress: () => void;
}

export function LanguageCard({ localeValue, selected, onPress }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const labelKey = localeValue === "ur" ? "locale.urdu" : "locale.english";
  const a11yKey = localeValue === "ur" ? "a11y.languageUrdu" : "a11y.languageEnglish";
  const label = t(locale, labelKey);
  const family = localeValue === "ur" ? fontFamily.urduUi : fontFamily.ui;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(locale, a11yKey)}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: controlSize.answerCardMinHeight,
        borderRadius: radiusUsage.mobileAnswerCard,
        backgroundColor: semanticColors.surface,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? semanticColors.actionPrimary : semanticColors.border,
        padding: 16,
        justifyContent: "center",
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: semanticColors.textPrimary,
          fontSize: mobileType.answer.size,
          lineHeight: mobileType.answer.line,
          fontWeight: "600",
          fontFamily: family,
          textAlign: isRTL(locale) ? "right" : "left",
        }}
      >
        {label}
      </Text>
      {selected ? (
        <Text
          style={{
            marginTop: 8,
            color: semanticColors.actionPrimary,
            fontSize: mobileType.caption.size,
            lineHeight: mobileType.caption.line,
            fontFamily: isRTL(locale) ? fontFamily.urduUi : fontFamily.ui,
          }}
        >
          {t(locale, "a11y.selected")}
        </Text>
      ) : null}
    </Pressable>
  );
}
