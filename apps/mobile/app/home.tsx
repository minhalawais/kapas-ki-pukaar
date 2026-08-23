import { Ionicons } from "@expo/vector-icons";
import { t } from "@kapas/localization";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import { type ComponentProps } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";

import HOME_WORKER from "../assets/field-guide/home-worker-voice.png";
import { DraftRecoveryDialog } from "../src/components/draft-recovery-dialog";
import { IloEndorsement } from "../src/components/ilo-endorsement";
import { KapasMark } from "../src/components/kapas-mark";
import { ScreenNotice } from "../src/components/screen-notice";
import { ScreenShell } from "../src/components/screen-shell";
import { useDraftRecovery } from "../src/hooks/use-draft-recovery";
import { useAutoScreenPrompt } from "../src/hooks/use-prompt-playback";
import { isRTL } from "../src/i18n/rtl";
import { useConnectivityStore } from "../src/stores/connectivityStore";
import { useLocaleStore } from "../src/stores/localeStore";
import { fontFamily, mobileType, semanticColors } from "../src/theme/tokens";
import { urduSafeText } from "../src/theme/urdu-text";

type IconName = ComponentProps<typeof Ionicons>["name"];

function SupportingAction({ title, hint, icon, tone, onPress }: { title: string; hint: string; icon: IconName; tone: "teal" | "gold"; onPress: () => void }) {
  const locale = useLocaleStore((state) => state.locale);
  const rtl = isRTL(locale);
  const accent = tone === "gold" ? "#B47A05" : semanticColors.voiceActiveStrong;
  const wash = tone === "gold" ? "#FBF2D9" : semanticColors.aiSurface;

  return (
    <Pressable
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${hint}`}
      style={({ pressed }) => ({
        minHeight: 86,
        flexDirection: rtl ? "row-reverse" : "row",
        alignItems: "center",
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: semanticColors.surface,
        borderWidth: 1,
        borderColor: semanticColors.borderEssential,
        borderRadius: 8,
        opacity: pressed ? 0.82 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: wash, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={25} color={accent} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: semanticColors.textPrimary,
            fontFamily: rtl ? fontFamily.urduBold : fontFamily.uiBold,
            textAlign: rtl ? "right" : "left",
            ...(rtl ? urduSafeText(mobileType.answer.size, "heading") : { fontSize: mobileType.answer.size, lineHeight: mobileType.answer.line }),
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: semanticColors.textSecondary,
            fontFamily: rtl ? fontFamily.urduUi : fontFamily.ui,
            textAlign: rtl ? "right" : "left",
            ...(rtl ? urduSafeText(mobileType.caption.size, "ui") : { fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line }),
          }}
        >
          {hint}
        </Text>
      </View>
      <Ionicons name={rtl ? "chevron-back" : "chevron-forward"} size={22} color={accent} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  useAutoScreenPrompt("M-004");
  const draft = useDraftRecovery();
  const persistenceNotice = useConnectivityStore((state) => state.persistenceNotice);
  const rtl = isRTL(locale);
  const family = rtl ? fontFamily.urduUi : fontFamily.ui;
  const headingFamily = rtl ? fontFamily.urduHeading : fontFamily.uiBold;
  const align = rtl ? "right" : "left";

  const showDraftPrompt = pathname === "/home" && draft.shouldPrompt;

  return (
    <ScreenShell scroll contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 12, gap: 0 }}>
      <Pressable
        delayLongPress={800}
        onLongPress={() => router.push("/demo")}
        accessibilityRole="button"
        accessibilityLabel={t(locale, "demo.mobile.openHint")}
        style={({ pressed }) => ({
          minHeight: 60,
          paddingHorizontal: 20,
          paddingVertical: 8,
          flexDirection: rtl ? "row-reverse" : "row",
          alignItems: "center",
          gap: 10,
          opacity: pressed ? 0.78 : 1,
          overflow: "visible",
        })}
      >
        <KapasMark size={40} style={{ marginBottom: 2 }} />
        <Text
          style={{
            flex: 1,
            color: semanticColors.actionPrimary,
            fontFamily: headingFamily,
            textAlign: align,
            ...(rtl ? urduSafeText(20, "heading") : { fontSize: 20, lineHeight: 28 }),
          }}
        >
          {t(locale, "app.name")}
        </Text>
      </Pressable>

      <ImageBackground
        source={HOME_WORKER}
        resizeMode="cover"
        accessible={false}
        style={{ width: "100%", aspectRatio: 4 / 3, position: "relative", overflow: "hidden" }}
        imageStyle={{ backgroundColor: semanticColors.pageWorker }}
      >
        <View style={{ position: "absolute", top: 14, end: 18, width: "50%", gap: 4, paddingBottom: 12 }}>
          <Text
            style={{
              color: semanticColors.textPrimary,
              fontFamily: headingFamily,
              textAlign: align,
              ...(rtl ? urduSafeText(30, "heading") : { fontSize: 31, lineHeight: 40 }),
            }}
          >
            {t(locale, "home.greeting")}
          </Text>
          <Text
            style={{
              color: semanticColors.textSecondary,
              fontFamily: family,
              textAlign: align,
              ...(rtl ? urduSafeText(15, "ui") : { fontSize: 16, lineHeight: 24 }),
            }}
          >
            {t(locale, "home.trustLine")}
          </Text>
        </View>
      </ImageBackground>

      <View style={{ marginTop: -18, paddingHorizontal: 20, gap: 12 }}>
        <Pressable
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/grievance"); }}
          accessibilityRole="button"
          accessibilityLabel={`${t(locale, "home.reportProblem")}. ${t(locale, "home.reportHint")}`}
          style={({ pressed }) => ({
            minHeight: 116,
            flexDirection: rtl ? "row-reverse" : "row",
            alignItems: "center",
            gap: 16,
            paddingHorizontal: 20,
            paddingVertical: 18,
            borderRadius: 8,
            backgroundColor: semanticColors.actionPrimary,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            shadowColor: "#052C1C",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 14,
            elevation: 5,
          })}
        >
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="mic" size={32} color={semanticColors.onPrimary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={{
                color: semanticColors.onPrimary,
                fontFamily: rtl ? fontFamily.urduBold : fontFamily.uiBold,
                textAlign: align,
                ...(rtl ? urduSafeText(24, "heading") : { fontSize: 26, lineHeight: 34 }),
              }}
            >
              {t(locale, "home.reportProblem")}
            </Text>
            <Text
              style={{
                color: "#D9EEE4",
                fontFamily: family,
                textAlign: align,
                ...(rtl ? urduSafeText(14, "ui") : { fontSize: 15, lineHeight: 22 }),
              }}
            >
              {t(locale, "home.reportHint")}
            </Text>
          </View>
        </Pressable>

        <SupportingAction title={t(locale, "home.trackComplaint")} hint={t(locale, "home.trackHint")} icon="time" tone="teal" onPress={() => router.push("/complaints")} />
        <SupportingAction title={t(locale, "home.knowYourRights")} hint={t(locale, "home.rightsHint")} icon="shield-checkmark" tone="gold" onPress={() => router.push("/rights")} />

        {draft.isError ? <ScreenNotice messageKey="common.error" tone="error" /> : null}
        {persistenceNotice === "schema-reset" ? <ScreenNotice messageKey="persistence.schemaReset" tone="warning" /> : null}
        {persistenceNotice === "corrupt-draft" ? <ScreenNotice messageKey="persistence.corruptDraft" tone="warning" /> : null}
      </View>

      <View
        style={{
          marginTop: 28,
          marginHorizontal: 20,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: semanticColors.border,
        }}
      >
        <IloEndorsement compact />
      </View>

      <DraftRecoveryDialog
        visible={showDraftPrompt}
        discarding={draft.isDiscarding}
        discardError={draft.discardError}
        onResume={() => {
          void draft.acknowledgePrompt();
          router.push("/grievance");
        }}
        onNotNow={() => { void draft.acknowledgePrompt(); }}
        onDiscard={() => draft.discardDraft()}
      />
    </ScreenShell>
  );
}
