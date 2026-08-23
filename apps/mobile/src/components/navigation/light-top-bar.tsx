import { Ionicons } from "@expo/vector-icons";
import { t, type MessageKey } from "@kapas/localization";
import { useRouter } from "expo-router";
import { type ComponentProps, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { isRTL } from "../../i18n/rtl";
import { useLocaleStore } from "../../stores/localeStore";
import { controlSize, fontFamily, mobileType, semanticColors } from "../../theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface Props {
  titleKey: MessageKey;
  subtitleKey?: MessageKey;
  subtitle?: string;
  icon?: IconName;
  trailing?: ReactNode;
  progress?: number;
  showBack?: boolean;
  onBack?: () => void;
}

export function LightTopBar({ titleKey, subtitleKey, subtitle, icon, trailing, progress, showBack = true, onBack }: Props) {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const rtl = isRTL(locale);
  const family = rtl ? fontFamily.urduBold : fontFamily.uiBold;
  const subtitleFamily = rtl ? fontFamily.urduUi : fontFamily.ui;
  const subtitleText = subtitle ?? (subtitleKey ? t(locale, subtitleKey) : undefined);
  const progressPercent = typeof progress === "number" ? Math.max(0, Math.min(100, progress * 100)) : undefined;

  return (
    <View
      style={{
        minHeight: subtitleText ? 84 : 64,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: semanticColors.borderEssential,
        backgroundColor: semanticColors.surface,
        shadowColor: "#2E3A34",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
    >
      <View
        style={{
          minHeight: 62,
          flexDirection: rtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 8,
          paddingTop: subtitleText ? 7 : 0,
        }}
      >
        {showBack ? (
          <Pressable
            onPress={() => {
              if (onBack) {
                onBack();
                return;
              }
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "common.back")}
            style={({ pressed }) => ({
              width: controlSize.mobileTouchMin,
              height: controlSize.mobileTouchMin,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: semanticColors.surfaceMuted,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Ionicons name={rtl ? "chevron-forward" : "chevron-back"} size={24} color={semanticColors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: controlSize.mobileTouchMin, height: controlSize.mobileTouchMin }} />
        )}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: subtitleText ? 2 : 0 }}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            style={{
              width: "100%",
              color: semanticColors.textPrimary,
              fontSize: mobileType.h1.size,
              lineHeight: rtl ? 42 : mobileType.h1.line,
              paddingBottom: rtl ? 3 : 0,
              fontFamily: family,
              textAlign: "center",
            }}
          >
            {t(locale, titleKey)}
          </Text>
          {subtitleText ? (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={{
                width: "100%",
                color: semanticColors.textSecondary,
                fontSize: mobileType.caption.size,
                lineHeight: rtl ? 23 : mobileType.caption.line,
                fontFamily: subtitleFamily,
                textAlign: "center",
              }}
            >
              {subtitleText}
            </Text>
          ) : null}
        </View>
        {trailing ?? (
          icon ? (
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                width: controlSize.mobileTouchMin,
                height: controlSize.mobileTouchMin,
                borderRadius: 8,
                backgroundColor: semanticColors.aiSurface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={icon} size={23} color={semanticColors.voiceActiveStrong} />
            </View>
          ) : (
            <View style={{ width: controlSize.mobileTouchMin, height: controlSize.mobileTouchMin }} />
          )
        )}
      </View>
      {typeof progressPercent === "number" ? (
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(progressPercent) }}
          style={{ height: 5, backgroundColor: semanticColors.border }}
        >
          <View style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: semanticColors.progressAccent }} />
        </View>
      ) : (
        <View style={{ height: 2, backgroundColor: semanticColors.aiSurface }}>
          <View style={{ width: "34%", height: "100%", backgroundColor: semanticColors.progressAccent }} />
        </View>
      )}
    </View>
  );
}
