import { Ionicons } from "@expo/vector-icons";
import type { RightsTopic } from "@kapas/domain";
import { t, type MessageKey } from "@kapas/localization";
import { SCREEN_PROMPT_IDS } from "@kapas/speech";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, Text, View } from "react-native";

import HEADER_IMAGE from "../../../assets/rights/rights-explorer-header.png";
import { isRTL } from "../../i18n/rtl";
import { promptAudioService } from "../../services/promptAudioService";
import { useLocaleStore } from "../../stores/localeStore";
import { fontFamily, semanticColors } from "../../theme/tokens";

import { rightsIcon, rightsPalette } from "./rightsVisuals";

const hotspotPositions = [
  { top: 82, left: "34%" },
  { top: 112, left: "52%" },
  { top: 78, right: 16 },
  { bottom: 14, left: "37%" },
  { bottom: 14, right: 80 },
  { bottom: 14, right: 16 },
] as const;

export function RightsExplorerHeader({ topics, loading, onBack, onOpen }: { topics: RightsTopic[]; loading: boolean; onBack: () => void; onOpen: (topic: RightsTopic) => void }) {
  const locale = useLocaleStore((state) => state.locale);
  const rtl = isRTL(locale);
  const [speaking, setSpeaking] = useState(false);
  const visibleTopics = topics.slice(0, hotspotPositions.length);

  useEffect(() => () => { void promptAudioService.stop(); }, []);

  const toggleSpeech = () => {
    if (speaking) {
      void promptAudioService.stop().finally(() => setSpeaking(false));
      return;
    }
    if (locale !== "ur") return;
    setSpeaking(true);
    void promptAudioService.playPrompt(SCREEN_PROMPT_IDS.rights).finally(() => setSpeaking(false));
  };

  return (
    <View style={{ height: 236, marginHorizontal: 12, overflow: "hidden", borderRadius: 8, backgroundColor: semanticColors.surfaceMuted }}>
      <ImageBackground source={HEADER_IMAGE} resizeMode="cover" accessible={false} style={{ flex: 1, position: "relative" }}>
        <View style={{ height: 64, flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", paddingHorizontal: 10 }}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "common.back")}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.88)", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1 })}
          >
            <Ionicons name={rtl ? "arrow-forward" : "arrow-back"} size={25} color={semanticColors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={{ flex: 1, color: semanticColors.textPrimary, fontSize: 25, lineHeight: rtl ? 54 : 31, paddingBottom: rtl ? 4 : 0, fontFamily: rtl ? fontFamily.urduHeading : fontFamily.uiBold, textAlign: "center", textShadowColor: "rgba(255,255,255,0.95)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
            {t(locale, "rights.title")}
          </Text>
          <Pressable
            onPress={toggleSpeech}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "a11y.listen")}
            accessibilityState={{ busy: loading, selected: speaking }}
            style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 8, backgroundColor: semanticColors.actionPrimary, alignItems: "center", justifyContent: "center", opacity: pressed || loading ? 0.72 : 1 })}
          >
            {loading ? <ActivityIndicator size="small" color={semanticColors.onPrimary} /> : <Ionicons name={speaking ? "stop" : "volume-high"} size={23} color={semanticColors.onPrimary} />}
          </Pressable>
        </View>

        {visibleTopics.map((topic, index) => {
          const palette = rightsPalette(topic.tone);
          return (
            <Pressable
              key={topic.id}
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpen(topic);
              }}
              accessibilityRole="button"
              accessibilityLabel={t(locale, topic.titleKey as MessageKey)}
              style={({ pressed }) => ({
                position: "absolute",
                ...hotspotPositions[index],
                width: 42,
                height: 42,
                borderRadius: 21,
                borderWidth: 3,
                borderColor: semanticColors.surface,
                backgroundColor: palette.foreground,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.78 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
                elevation: 3,
              })}
            >
              <Ionicons name={rightsIcon[topic.visual]} size={21} color={semanticColors.onPrimary} />
            </Pressable>
          );
        })}
      </ImageBackground>
    </View>
  );
}
