import { Ionicons } from "@expo/vector-icons";
import { t } from "@kapas/localization";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { PrimaryCta } from "../../../components/primary-cta";
import { formatCnic, isValidCnic, normalizeCnic } from "../../../services/expoIdentityService";
import { useLocaleStore } from "../../../stores/localeStore";
import { fontFamily, mobileType, radiusUsage, semanticColors } from "../../../theme/tokens";

interface Props {
  busy?: boolean;
  error?: boolean;
  onUseCnic: (cnic: string) => void;
  onUseAnonymous: () => void;
}

export function IdentityGate({ busy, error, onUseCnic, onUseAnonymous }: Props) {
  const locale = useLocaleStore((state) => state.locale);
  const [cnic, setCnic] = useState("");
  const valid = isValidCnic(cnic);

  return (
    <View style={{ gap: 14 }}>
      <View style={{ alignItems: "center", gap: 10, paddingVertical: 4 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: semanticColors.aiSurface, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="shield-checkmark" size={35} color={semanticColors.actionPrimary} />
        </View>
        <Text style={{ color: semanticColors.textSecondary, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui, textAlign: "center" }}>
          {t(locale, "grievance.identity.secureNote")}
        </Text>
      </View>
      <TextInput
        value={formatCnic(cnic)}
        onChangeText={(value) => setCnic(normalizeCnic(value))}
        keyboardType="number-pad"
        maxLength={15}
        placeholder="35202-1234567-1"
        placeholderTextColor={semanticColors.textSecondary}
        accessibilityLabel={t(locale, "grievance.identity.inputLabel")}
        style={{
          minHeight: 62,
          borderWidth: 1.5,
          borderColor: cnic.length > 0 && !valid ? semanticColors.critical : semanticColors.borderEssential,
          borderRadius: radiusUsage.mobileCard,
          backgroundColor: semanticColors.surface,
          color: semanticColors.textPrimary,
          fontFamily: fontFamily.mono,
          fontSize: 20,
          textAlign: "center",
          letterSpacing: 0,
          paddingHorizontal: 16,
        }}
      />
      {cnic.length > 0 && !valid ? (
        <Text style={{ color: semanticColors.critical, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui, textAlign: locale === "ur" ? "right" : "left" }}>
          {t(locale, "grievance.identity.invalid")}
        </Text>
      ) : null}
      {error ? (
        <Text style={{ color: semanticColors.critical, fontSize: mobileType.caption.size, lineHeight: mobileType.caption.line, fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui, textAlign: locale === "ur" ? "right" : "left" }}>
          {t(locale, "grievance.identity.saveError")}
        </Text>
      ) : null}
      <PrimaryCta labelKey="grievance.identity.continueCnic" icon="card-outline" disabled={!valid} loading={busy} onPress={() => onUseCnic(cnic)} />
      <PrimaryCta labelKey="grievance.identity.continueAnonymous" icon="eye-off-outline" tone="secondary" disabled={busy} onPress={onUseAnonymous} />
    </View>
  );
}
