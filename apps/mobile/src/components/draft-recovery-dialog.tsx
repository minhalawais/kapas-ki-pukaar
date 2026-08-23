import { Ionicons } from "@expo/vector-icons";
import { t } from "@kapas/localization";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { useReducedMotion } from "../hooks/use-reduced-motion";
import { isRTL } from "../i18n/rtl";
import { useLocaleStore } from "../stores/localeStore";
import { fontFamily, mobileType, radiusUsage, semanticColors } from "../theme/tokens";

import { PrimaryCta } from "./primary-cta";

interface Props {
  visible: boolean;
  onResume: () => void;
  onNotNow: () => void;
  onDiscard: () => Promise<void>;
  discarding?: boolean;
  discardError?: boolean;
}

export function DraftRecoveryDialog({
  visible,
  onResume,
  onNotNow,
  onDiscard,
  discarding,
  discardError,
}: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const [confirming, setConfirming] = useState(false);
  const reducedMotion = useReducedMotion();
  const family = isRTL(locale) ? fontFamily.urduUi : fontFamily.ui;
  const align = isRTL(locale) ? "right" : "left";

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      accessibilityViewIsModal
      onRequestClose={() => {
        if (confirming) setConfirming(false);
        else onNotNow();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(23, 35, 30, 0.55)",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          accessibilityRole="alert"
          style={{
            backgroundColor: semanticColors.surface,
            borderRadius: radiusUsage.mobileCard,
            borderWidth: 1,
            borderColor: semanticColors.borderEssential,
            padding: 20,
            gap: 16,
          }}
        >
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: confirming ? semanticColors.criticalSurface : semanticColors.progressSurface, alignItems: "center", justifyContent: "center", alignSelf: isRTL(locale) ? "flex-end" : "flex-start" }}>
            <Ionicons name={confirming ? "trash" : "document-text"} size={28} color={confirming ? semanticColors.critical : semanticColors.warningText} />
          </View>
          <Text
            style={{
              color: semanticColors.textPrimary,
              fontSize: mobileType.h1.size,
              lineHeight: mobileType.h1.line,
              fontWeight: "700",
              fontFamily: family,
              textAlign: align,
            }}
          >
            {t(locale, confirming ? "draft.discardConfirmTitle" : "draft.title")}
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
            {t(locale, confirming ? "draft.discardConfirmBody" : "draft.body")}
          </Text>
          {discardError ? (
            <Text
              style={{
                color: semanticColors.textPrimary,
                fontSize: mobileType.helper.size,
                lineHeight: mobileType.helper.line,
                fontFamily: family,
                textAlign: align,
              }}
            >
              {t(locale, "common.error")}
            </Text>
          ) : null}
          {confirming ? (
            <>
              <PrimaryCta
                labelKey="draft.keep"
                disabled={discarding}
                onPress={() => setConfirming(false)}
              />
              <PrimaryCta labelKey="draft.discard" tone="danger" icon="trash" disabled={discarding} loading={discarding} onPress={() => { void onDiscard().then(() => setConfirming(false)); }} />
            </>
          ) : (
            <>
              <PrimaryCta labelKey="draft.resume" icon="arrow-forward-circle" onPress={onResume} />
              <Pressable
                onPress={onNotNow}
                accessibilityRole="button"
                accessibilityLabel={t(locale, "draft.notNow")}
                style={({ pressed }) => ({
                  minHeight: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: semanticColors.textPrimary,
                    fontSize: mobileType.button.size,
                    lineHeight: mobileType.button.line,
                    fontFamily: family,
                  }}
                >
                  {t(locale, "draft.notNow")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setConfirming(true)}
                accessibilityRole="button"
                accessibilityLabel={t(locale, "draft.discard")}
                style={({ pressed }) => ({
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: semanticColors.textSecondary,
                    fontSize: mobileType.helper.size,
                    lineHeight: mobileType.helper.line,
                    fontFamily: family,
                    textDecorationLine: "underline",
                  }}
                >
                  {t(locale, "draft.discard")}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
