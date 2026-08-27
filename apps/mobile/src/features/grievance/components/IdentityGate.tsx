import { t } from "@kapas/localization";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { PrimaryCta } from "../../../components/primary-cta";
import {
  formatCnic,
  formatPhone,
  isValidCnic,
  isValidPhone,
  normalizeCnic,
  normalizePhone,
} from "../../../services/expoIdentityService";
import { promptAudioService } from "../../../services/promptAudioService";
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
  const [mode, setMode] = useState<"choice" | "cnic" | "phone">("choice");
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");

  const validCnic = isValidCnic(cnic);
  const validPhone = isValidPhone(phone);

  const handleSelectMode = (newMode: "cnic" | "phone") => {
    setMode(newMode);
    if (locale === "ur") {
      void promptAudioService.playPrompt(newMode === "cnic" ? "WF-identity-cnic" : "WF-identity-phone");
    }
  };

  if (mode === "choice") {
    return (
      <View style={{ gap: 14 }}>
        <PrimaryCta
          labelKey="grievance.identity.optionCnic"
          icon="card-outline"
          disabled={busy}
          onPress={() => handleSelectMode("cnic")}
        />
        <PrimaryCta
          labelKey="grievance.identity.optionPhone"
          icon="call-outline"
          tone="secondary"
          disabled={busy}
          onPress={() => handleSelectMode("phone")}
        />
        <PrimaryCta
          labelKey="grievance.identity.continueAnonymous"
          icon="eye-off-outline"
          tone="secondary"
          disabled={busy}
          onPress={onUseAnonymous}
        />
        {error ? (
          <Text
            style={{
              color: semanticColors.critical,
              fontSize: mobileType.caption.size,
              lineHeight: mobileType.caption.line,
              fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui,
              textAlign: locale === "ur" ? "right" : "left",
            }}
          >
            {t(locale, "grievance.identity.saveError")}
          </Text>
        ) : null}
      </View>
    );
  }

  if (mode === "phone") {
    return (
      <View style={{ gap: 14 }}>
        <TextInput
          value={formatPhone(phone)}
          onChangeText={(value) => setPhone(normalizePhone(value))}
          keyboardType="number-pad"
          maxLength={12}
          placeholder="0300-1234567"
          placeholderTextColor={semanticColors.textSecondary}
          accessibilityLabel={t(locale, "grievance.identity.optionPhone")}
          style={{
            minHeight: 62,
            borderWidth: 1.5,
            borderColor: phone.length > 0 && !validPhone ? semanticColors.critical : semanticColors.borderEssential,
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
        {phone.length > 0 && !validPhone ? (
          <Text
            style={{
              color: semanticColors.critical,
              fontSize: mobileType.caption.size,
              lineHeight: mobileType.caption.line,
              fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui,
              textAlign: locale === "ur" ? "right" : "left",
            }}
          >
            {t(locale, "grievance.identity.invalidPhone")}
          </Text>
        ) : null}
        {error ? (
          <Text
            style={{
              color: semanticColors.critical,
              fontSize: mobileType.caption.size,
              lineHeight: mobileType.caption.line,
              fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui,
              textAlign: locale === "ur" ? "right" : "left",
            }}
          >
            {t(locale, "grievance.identity.saveError")}
          </Text>
        ) : null}
        <PrimaryCta
          labelKey="grievance.identity.continuePhone"
          icon="call-outline"
          disabled={!validPhone}
          loading={busy}
          onPress={() => onUseCnic(phone)}
        />
        <PrimaryCta
          labelKey="grievance.identity.changeOption"
          icon="arrow-back-outline"
          tone="secondary"
          disabled={busy}
          onPress={() => setMode("choice")}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
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
          borderColor: cnic.length > 0 && !validCnic ? semanticColors.critical : semanticColors.borderEssential,
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
      {cnic.length > 0 && !validCnic ? (
        <Text
          style={{
            color: semanticColors.critical,
            fontSize: mobileType.caption.size,
            lineHeight: mobileType.caption.line,
            fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui,
            textAlign: locale === "ur" ? "right" : "left",
          }}
        >
          {t(locale, "grievance.identity.invalid")}
        </Text>
      ) : null}
      {error ? (
        <Text
          style={{
            color: semanticColors.critical,
            fontSize: mobileType.caption.size,
            lineHeight: mobileType.caption.line,
            fontFamily: locale === "ur" ? fontFamily.urduUi : fontFamily.ui,
            textAlign: locale === "ur" ? "right" : "left",
          }}
        >
          {t(locale, "grievance.identity.saveError")}
        </Text>
      ) : null}
      <PrimaryCta
        labelKey="grievance.identity.continueCnic"
        icon="card-outline"
        disabled={!validCnic}
        loading={busy}
        onPress={() => onUseCnic(cnic)}
      />
      <PrimaryCta
        labelKey="grievance.identity.changeOption"
        icon="arrow-back-outline"
        tone="secondary"
        disabled={busy}
        onPress={() => setMode("choice")}
      />
    </View>
  );
}
