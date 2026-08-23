import { Ionicons } from "@expo/vector-icons";
import { canSubmitDraft, workerCategoryCodes, type WorkerCategoryCode } from "@kapas/domain";
import { t, type MessageKey } from "@kapas/localization";
import { complaintService } from "@kapas/mock-services";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { ActionDock } from "../../src/components/action-dock";
import { KapasMark } from "../../src/components/kapas-mark";
import { LightTopBar } from "../../src/components/navigation/light-top-bar";
import { PrimaryCta } from "../../src/components/primary-cta";
import { ScreenNotice } from "../../src/components/screen-notice";
import { ScreenShell } from "../../src/components/screen-shell";
import { ProgressIndicator } from "../../src/features/grievance/components/ProgressIndicator";
import { QuestionRenderer } from "../../src/features/grievance/components/QuestionRenderer";
import { useGrievanceWizard } from "../../src/hooks/use-grievance-wizard";
import { expoIdentityService } from "../../src/services/expoIdentityService";
import { useConnectivityStore } from "../../src/stores/connectivityStore";
import { useGrievanceDraftStore } from "../../src/stores/grievanceDraftStore";
import { useLocaleStore } from "../../src/stores/localeStore";
import { fontFamily, semanticColors } from "../../src/theme/tokens";

function CategoryHeader({ locale, ratio, onBack }: { locale: "ur" | "en"; ratio: number; onBack: () => void }) {
  const rtl = locale === "ur";
  return (
    <View style={{ gap: 10 }}>
      <View style={{ height: 58, alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t(locale, "common.back")}
          style={({ pressed }) => ({ position: "absolute", start: 0, width: 46, height: 46, borderRadius: 23, backgroundColor: "#EEE9D9", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.72 : 1, zIndex: 1 })}
        >
          <Ionicons name={rtl ? "arrow-forward" : "arrow-back"} size={25} color={semanticColors.textPrimary} />
        </Pressable>
        <View style={{ flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
          <KapasMark size={38} />
          <Text style={{ color: semanticColors.actionPrimary, fontSize: 20, lineHeight: 34, fontFamily: rtl ? fontFamily.urduHeading : fontFamily.uiBold }}>
            {t(locale, "app.name")}
          </Text>
        </View>
      </View>
      <ProgressIndicator ratio={ratio} />
    </View>
  );
}

function othersLabel(locale: "ur" | "en", value?: string): string {
  if (value === "individual") {
    return t(locale, "others.no");
  }
  if (value === "2-5") {
    return t(locale, "range.2-5");
  }
  if (value === "6-20") {
    return t(locale, "range.6-20");
  }
  if (value === "more-than-20") {
    return t(locale, "range.20+");
  }
  if (value === "not-sure") {
    return t(locale, "range.unsure");
  }
  return t(locale, "common.notSure");
}

export default function GrievanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const queryClient = useQueryClient();
  const locale = useLocaleStore((s) => s.locale);
  const categoryIntent = useGrievanceDraftStore((s) => s.requestedCategory);
  const setCategoryIntent = useGrievanceDraftStore((s) => s.setRequestedCategory);
  const wizard = useGrievanceWizard();
  const node = wizard.node;
  const draft = wizard.draft;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const routeCategory = typeof params.category === "string" && workerCategoryCodes.includes(params.category as WorkerCategoryCode)
    ? params.category as WorkerCategoryCode
    : undefined;
  const requestedCategory = routeCategory ?? categoryIntent ?? undefined;

  useEffect(() => {
    if (node?.id !== "category" || wizard.selected || !requestedCategory) {
      return;
    }
    void wizard.select(requestedCategory).then(() => setCategoryIntent(null));
  }, [node?.id, requestedCategory, setCategoryIntent, wizard.select, wizard.selected]);

  useEffect(() => () => setCategoryIntent(null), [setCategoryIntent]);

  const handleBack = () => {
    void wizard.goBack().then((result) => {
      if (result === "exit") {
        router.replace("/home");
      }
    });
  };

  const reviewLines =
    node?.type === "review" && draft
      ? [
          {
            labelKey: "grievance.review.identity" as const,
            value: draft.reporterIdentity?.mode === "cnic"
              ? `${t(locale, "grievance.review.cnicEnding")} ${draft.reporterIdentity.cnicLast4 ?? ""}`
              : t(locale, "privacy.ANON"),
            editNodeId: "identity",
          },
          {
            labelKey: "grievance.review.category" as const,
            value: draft.category ? t(locale, `category.${draft.category}` as MessageKey) : t(locale, "common.empty"),
            editNodeId: "category",
          },
          {
            labelKey: "grievance.review.when" as const,
            value: draft.incident.whenLabel
              ? t(locale, `when.${draft.incident.whenLabel}` as MessageKey)
              : t(locale, "common.notSure"),
            editNodeId: "when",
          },
          {
            labelKey: "grievance.review.where" as const,
            value: draft.location.formattedAddress
              ?? (draft.location.placeLabel
                ? `${draft.location.placeLabel}${draft.location.district ? ` · ${draft.location.district}` : ""}${draft.location.province ? ` · ${draft.location.province}` : ""}`
                : undefined)
              ?? t(locale, "common.notSure"),
            editNodeId: "where-current",
          },
          {
            labelKey: "grievance.review.others" as const,
            value: othersLabel(locale, draft.incident.othersAffected),
            editNodeId: "others",
          },
          {
            labelKey: "grievance.review.danger" as const,
            value: draft.incident.immediateDanger ? t(locale, "danger.yes") : t(locale, "danger.no"),
            editNodeId: "danger",
          },
          {
            labelKey: "grievance.review.privacy" as const,
            value: draft.privacyMode
              ? t(locale, `privacy.${draft.privacyMode}` as MessageKey)
              : t(locale, "common.notSure"),
            editNodeId: "privacy",
          },
          {
            labelKey: "grievance.review.voice" as const,
            value: draft.voice ? t(locale, "grievance.voice.attached") : t(locale, "grievance.voice.none"),
            editNodeId: "voice",
          },
          {
            labelKey: "grievance.review.evidence" as const,
            value:
              draft.evidence.length > 0
                ? String(draft.evidence.length)
                : t(locale, "grievance.evidence.none"),
            editNodeId: "evidence",
          },
          {
            labelKey: "grievance.ai.summaryLabel" as const,
            value:
              draft.ai?.failed || !draft.ai
                ? t(locale, "grievance.ai.unavailable")
                : locale === "ur"
                  ? (draft.ai.summaryUr ?? t(locale, "grievance.ai.unavailable"))
                  : (draft.ai.summaryEn ?? t(locale, "grievance.ai.unavailable")),
          },
        ]
      : undefined;

  return (
    <ScreenShell
      header={node?.id === "category"
        ? <CategoryHeader locale={locale} ratio={wizard.progress.ratio} onBack={handleBack} />
        : (
          <LightTopBar titleKey="grievance.title" subtitleKey="grievance.headerHelp" icon="mic-outline" progress={wizard.progress.ratio} onBack={handleBack} />
        )}
      footer={node && node.type !== "ai-processing" && node.type !== "cnic" && node.type !== "current-location" ? (
        <ActionDock>
          <PrimaryCta
            labelKey={node.type === "review" ? "grievance.review.submit" : node.type === "ai-understanding" ? "grievance.ai.confirm" : "common.continue"}
            icon={node.type === "review" ? "send" : "arrow-forward-circle"}
            disabled={!wizard.valid || wizard.voiceBusy || submitting}
            loading={submitting}
            onPress={() => {
              if (node.type === "review") {
                const current = wizard.draft;
                if (!current || !canSubmitDraft(current)) { setSubmitError(true); return; }
                setSubmitError(false);
                setSubmitting(true);
                void (async () => {
                  await new Promise((resolve) => { setTimeout(resolve, 1000); });
                  try {
                    const created = await complaintService.createFromDraft(current);
                    await expoIdentityService.removeCnic(current.id);
                    useGrievanceDraftStore.getState().resetAfterSubmit();
                    await useConnectivityStore.getState().refreshQueue();
                    await queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
                    await queryClient.invalidateQueries({ queryKey: ["complaint", created.trackingId] });
                    router.replace(created.status === "Draft" ? `/grievance/offline-saved?id=${created.trackingId}` : `/grievance/success?id=${created.trackingId}`);
                  } catch { setSubmitError(true); setSubmitting(false); }
                })();
                return;
              }
              void wizard.goNext();
            }}
          />
        </ActionDock>
      ) : undefined}
    >
      {!wizard.hydrated || !node ? (
        <ActivityIndicator
          color={semanticColors.actionPrimary}
          accessibilityLabel={t(locale, "common.loading")}
        />
      ) : null}
      {wizard.error ? <ScreenNotice messageKey="common.error" tone="error" /> : null}
      {submitError ? <ScreenNotice messageKey="grievance.review.missing" tone="error" /> : null}
      {submitting ? <ScreenNotice messageKey="grievance.submit.processing" /> : null}
      {node ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
          <QuestionRenderer
            node={node}
            selected={wizard.selected}
            reviewLines={reviewLines}
            voice={draft?.voice ?? null}
            analysis={draft?.ai}
            evidence={draft?.evidence}
            evidenceError={wizard.evidenceError}
            identityBusy={wizard.identityBusy}
            identityError={wizard.identityError}
            locationCaptureStatus={wizard.locationCaptureStatus}
            detectedAddress={wizard.detectedAddress}
            onSelect={(value) => {
              void wizard.select(value);
            }}
            onVoiceChange={(next) => {
              void wizard.setVoice(next);
            }}
            onVoiceBusyChange={wizard.setVoiceBusy}
            onAddPhoto={() => {
              void wizard.addEvidence("photo");
            }}
            onAddDocument={() => {
              void wizard.addEvidence("document");
            }}
            onRemoveEvidence={(id) => {
              void wizard.removeEvidence(id);
            }}
            onEditSection={(id) => {
              void wizard.goToStep(id);
            }}
            onUseCnic={(cnic) => { void wizard.submitIdentity(cnic); }}
            onUseAnonymous={() => { void wizard.submitIdentity(); }}
            onRequestCurrentLocation={() => { void wizard.requestCurrentLocation(); }}
            onConfirmCurrentLocation={() => { void wizard.confirmCurrentLocation(); }}
            onManualLocation={() => { void wizard.useManualLocation(); }}
          />
        </ScrollView>
      ) : null}
    </ScreenShell>
  );
}
