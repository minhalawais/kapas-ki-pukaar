import { Ionicons } from "@expo/vector-icons";
import type { Complaint } from "@kapas/domain";
import { t, type MessageKey } from "@kapas/localization";
import { Pressable, Text, View } from "react-native";

import { StatusPill } from "../../components/ui-primitives";
import { isolateComplaintId, isRTL } from "../../i18n/rtl";
import { useLocaleStore } from "../../stores/localeStore";
import { fontFamily, mobileType, radiusUsage, semanticColors } from "../../theme/tokens";

import { CaseProgressStrip } from "./CaseProgressStrip";
import {
  complaintLocation,
  complaintProgress,
  complaintStatusTone,
  complaintWorkerStatusKey,
  formatComplaintDate,
  latestComplaintDate,
} from "./complaintPresentation";

interface Props {
  complaint: Complaint;
  onPress: () => void;
}

export function ComplaintStatusCard({ complaint, onPress }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const family = isRTL(locale) ? fontFamily.urduUi : fontFamily.ui;
  const strongFamily = isRTL(locale) ? fontFamily.urduSemibold : fontFamily.uiSemibold;
  const align = isRTL(locale) ? "right" : "left";
  const location = complaintLocation(complaint);
  const locationIsLtr = /[A-Za-z]/.test(location);
  const updatedLabel = `${t(locale, "complaints.updated")} · ${formatComplaintDate(latestComplaintDate(complaint), locale)}`;
  const tone = complaintStatusTone(complaint);
  const accentColor = tone === "critical"
    ? semanticColors.critical
    : tone === "success"
      ? semanticColors.success
      : tone === "offline"
        ? semanticColors.textSecondary
        : semanticColors.actionPrimary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t(locale, `category.${complaint.categoryCode}` as MessageKey)}, ${t(locale, complaintWorkerStatusKey(complaint) as MessageKey)}, ${complaint.trackingId}`}
      style={({ pressed }) => ({
        backgroundColor: "#FFFEFA",
        borderWidth: 1,
        borderColor: tone === "critical" ? "#F0C9C9" : semanticColors.borderEssential,
        borderRadius: radiusUsage.mobileCard,
        padding: 12,
        gap: 10,
        shadowColor: "#0A2F1E",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 2,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: isRTL(locale) ? "row-reverse" : "row", alignItems: "flex-start", gap: 10 }}>
        <View style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: tone === "critical" ? semanticColors.criticalSurface : semanticColors.progressSurface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="document-text-outline" size={22} color={tone === "critical" ? semanticColors.critical : semanticColors.warningText} />
        </View>
        <View style={{ flex: 1, gap: 2, alignItems: isRTL(locale) ? "flex-end" : "flex-start" }}>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.88} style={{ color: semanticColors.textPrimary, fontSize: mobileType.body.size, lineHeight: isRTL(locale) ? 29 : mobileType.body.line, fontFamily: strongFamily, textAlign: align, writingDirection: isRTL(locale) ? "rtl" : "ltr" }}>{t(locale, `category.${complaint.categoryCode}` as MessageKey)}</Text>
          <Text style={{ color: semanticColors.textSecondary, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: fontFamily.uiMedium, textAlign: align, writingDirection: "ltr" }}>{isolateComplaintId(complaint.trackingId)}</Text>
          <View style={{ marginTop: 5 }}>
            <StatusPill label={complaint.overdue ? t(locale, "complaints.overdue") : t(locale, complaintWorkerStatusKey(complaint) as MessageKey)} tone={tone} />
          </View>
        </View>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: semanticColors.surfaceMuted, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name={isRTL(locale) ? "chevron-back" : "chevron-forward"} size={18} color={semanticColors.textSecondary} />
        </View>
      </View>

      <View style={{ backgroundColor: "#F7FAF6", borderRadius: 8, borderWidth: 1, borderColor: semanticColors.border, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 2 }}>
        <CaseProgressStrip current={complaintProgress(complaint.status)} />
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: semanticColors.border, paddingTop: 10, gap: 7 }}>
        {location ? (
          <View style={{ flexDirection: isRTL(locale) ? "row-reverse" : "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="location-outline" size={17} color={accentColor} />
            <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, color: semanticColors.textPrimary, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: locationIsLtr ? fontFamily.ui : family, textAlign: locationIsLtr ? "left" : align, writingDirection: locationIsLtr ? "ltr" : isRTL(locale) ? "rtl" : "ltr" }}>{location}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: isRTL(locale) ? "row-reverse" : "row", alignItems: "center", gap: 7 }}>
          <Ionicons name="time-outline" size={17} color={semanticColors.textSecondary} />
          <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, color: semanticColors.textSecondary, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: family, textAlign: align, writingDirection: isRTL(locale) ? "rtl" : "ltr" }}>{updatedLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}
