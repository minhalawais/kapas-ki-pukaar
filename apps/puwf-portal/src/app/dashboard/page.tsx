"use client";

import { t, type MessageKey } from "@kapas/localization";
import { AlertTriangle, CheckCircle2, ClockAlert, FolderOpen, Inbox, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { FilterBar, type DashboardFilterDraft } from "@/components/complaints/FilterBar";
import { DonutChart, ExecutiveTrendChart, RankedList, SignalCard } from "@/components/dashboard/DashboardCharts";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/shell/page-header";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { prioritySeriesColor, privacySafeRows } from "@/lib/analytics";
import { emptyFilters, readStoredFilters, toComplaintFilters, writeStoredFilters } from "@/lib/dashboard";
import { useDashboardData, useProvinces } from "@/lib/use-complaints";
import { useLocaleStore } from "@/stores/locale-store";

function percent(value: number | null): string {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function hours(value: number | null): string {
  if (value == null) return "—";
  if (value < 24) return `${Math.round(value)}h`;
  return `${Math.round(value / 24)}d`;
}

function numberText(value: number): string {
  return new Intl.NumberFormat("en-PK").format(value);
}

function geographyLabel(locale: "en" | "ur", key: string): string {
  return key === "suppressed" ? t(locale, "portal.analytics.suppressed") : t(locale, `province.${key}` as MessageKey);
}

export default function DashboardPage() {
  const locale = useLocaleStore((s) => s.locale);
  const [draft, setDraft] = useState<DashboardFilterDraft>(emptyFilters);
  const [filtersReady, setFiltersReady] = useState(false);
  const filters = useMemo(() => toComplaintFilters(draft), [draft]);
  const query = useDashboardData(filters, filtersReady);
  const provinces = useProvinces();

  useEffect(() => {
    const stored = readStoredFilters();
    const globalSearch = new URLSearchParams(window.location.search).get("search");
    setDraft(globalSearch ? { ...stored, search: globalSearch } : stored);
    setFiltersReady(true);
  }, []);

  function updateFilters(next: DashboardFilterDraft) {
    setDraft(next);
    writeStoredFilters(next);
  }

  const snapshot = query.data?.snapshot;
  const safeGeography = snapshot ? privacySafeRows(snapshot.byProvince) : [];
  const safeGender = snapshot ? privacySafeRows(snapshot.byGender) : [];
  const topCategory = snapshot?.byCategory[0];
  const topProvince = safeGeography[0];

  return (
    <section className="space-y-5">
      <PageHeader title={t(locale, "portal.dashboard.title")} description={t(locale, "portal.dashboard.note")} />
      {query.isLoading || !filtersReady ? <LoadingState label={t(locale, "common.loading")} /> : null}
      {query.isError ? <ErrorState title={t(locale, "common.error")} retryLabel={t(locale, "common.retry")} onRetry={() => void query.refetch()} /> : null}

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="border-b border-border px-4 py-4">
          <h2 className="text-sm font-semibold text-ink">{t(locale, "portal.dashboard.filtersTitle")}</h2>
          <p className="mt-1 text-xs text-muted">{t(locale, "portal.dashboard.filtersNote")}</p>
        </div>
        <FilterBar value={draft} provinces={provinces.data ?? []} onChange={updateFilters} onClear={() => updateFilters(emptyFilters())} />
      </div>

      {snapshot ? (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <MetricCard label={t(locale, "portal.kpi.total")} value={numberText(snapshot.total)} icon={FolderOpen} tone="neutral" helper={t(locale, "portal.kpi.helper.total")} />
            <MetricCard label={t(locale, "portal.kpi.open")} value={numberText(snapshot.openCount)} icon={Inbox} tone="info" helper={t(locale, "portal.kpi.helper.open")} />
            <MetricCard label={t(locale, "portal.kpi.critical")} value={numberText(snapshot.criticalCount)} icon={AlertTriangle} tone="critical" helper={t(locale, "portal.kpi.helper.critical")} />
            <MetricCard label={t(locale, "portal.kpi.overdue")} value={numberText(snapshot.overdueCount)} icon={ClockAlert} tone="warning" helper={t(locale, "portal.kpi.helper.overdue")} />
            <MetricCard label={t(locale, "portal.kpi.resolutionRate")} value={percent(snapshot.resolutionRate)} icon={CheckCircle2} tone="success" helper={t(locale, "portal.kpi.helper.resolutionRate")} />
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <ExecutiveTrendChart title={t(locale, "portal.dashboard.reportingTrend")} rows={snapshot.trend} emptyLabel={t(locale, "common.empty")} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-1">
              <SignalCard label={t(locale, "portal.dashboard.firstAction")} value={hours(snapshot.averageFirstActionHours)} helper={t(locale, "portal.dashboard.firstActionNote")} tone={snapshot.averageFirstActionHours != null && snapshot.averageFirstActionHours > 48 ? "warning" : "success"} />
              <SignalCard label={t(locale, "portal.dashboard.resolutionTime")} value={hours(snapshot.averageResolutionHours)} helper={t(locale, "portal.dashboard.resolutionTimeNote")} tone="neutral" />
              <SignalCard label={t(locale, "portal.dashboard.topIssue")} value={topCategory ? t(locale, `category.${topCategory.key}` as MessageKey) : "—"} helper={t(locale, "portal.dashboard.topIssueNote")} tone="neutral" />
              <SignalCard label={t(locale, "portal.dashboard.topProvince")} value={topProvince ? geographyLabel(locale, topProvince.key) : "—"} helper={t(locale, "portal.dashboard.topProvinceNote")} tone="neutral" />
            </div>
          </div>

          <section aria-labelledby="risk-heading" className="space-y-3">
            <div>
              <h2 id="risk-heading" className="text-lg font-semibold text-ink">{t(locale, "portal.dashboard.riskTitle")}</h2>
              <p className="text-xs text-muted">{t(locale, "portal.dashboard.riskNote")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DonutChart title={t(locale, "portal.chart.priority")} rows={snapshot.byPriority} emptyLabel={t(locale, "common.empty")} labelFor={(key) => t(locale, `portal.priority.${key}` as MessageKey)} colorFor={prioritySeriesColor} />
              <DonutChart title={t(locale, "portal.chart.status")} rows={snapshot.byStatus} emptyLabel={t(locale, "common.empty")} labelFor={(key) => t(locale, `portal.status.${key}` as MessageKey)} />
            </div>
          </section>

          <section aria-labelledby="access-heading" className="space-y-3">
            <div>
              <h2 id="access-heading" className="text-lg font-semibold text-ink">{t(locale, "portal.dashboard.accessTitle")}</h2>
              <p className="text-xs text-muted">{t(locale, "portal.dashboard.accessNote")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <RankedList title={t(locale, "portal.chart.category")} rows={snapshot.byCategory} emptyLabel={t(locale, "common.empty")} labelFor={(key) => t(locale, `category.${key}` as MessageKey)} />
              <RankedList title={t(locale, "portal.chart.geography")} rows={safeGeography} emptyLabel={t(locale, "common.empty")} labelFor={(key) => geographyLabel(locale, key)} />
              <RankedList title={t(locale, "portal.chart.gender")} rows={safeGender} emptyLabel={t(locale, "common.empty")} labelFor={(key) => key === "suppressed" ? t(locale, "portal.analytics.suppressed") : t(locale, `portal.gender.${key}` as MessageKey)} />
            </div>
          </section>

          <section aria-labelledby="quality-heading" className="space-y-3">
            <div>
              <h2 id="quality-heading" className="text-lg font-semibold text-ink">{t(locale, "portal.dashboard.qualityTitle")}</h2>
              <p className="text-xs text-muted">{t(locale, "portal.dashboard.qualityNote")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
              <DonutChart title={t(locale, "portal.chart.privacy")} rows={snapshot.byPrivacy} emptyLabel={t(locale, "common.empty")} labelFor={(key) => t(locale, `privacy.${key}` as MessageKey)} />
              <DonutChart title={t(locale, "portal.chart.outcome")} rows={snapshot.byOutcome} emptyLabel={t(locale, "common.empty")} labelFor={(key) => t(locale, `portal.analytics.outcome.${key}` as MessageKey)} />
              <div className="grid grid-cols-1 gap-3">
                <SignalCard label={t(locale, "portal.chart.humanReview")} value={percent(snapshot.aiHumanReviewShare)} helper={t(locale, "portal.dashboard.humanReviewNote")} tone={snapshot.aiHumanReviewShare != null && snapshot.aiHumanReviewShare > 25 ? "warning" : "success"} />
                <SignalCard label={t(locale, "portal.chart.aiConfidence")} value={percent(snapshot.aiLowConfidenceShare)} helper={t(locale, "portal.dashboard.lowConfidenceNote")} tone={snapshot.aiLowConfidenceShare != null && snapshot.aiLowConfidenceShare > 20 ? "warning" : "success"} />
                <SignalCard label={t(locale, "portal.dashboard.reopenRate")} value={percent(snapshot.reopenRate)} helper={t(locale, "portal.dashboard.reopenRateNote")} tone="neutral" />
              </div>
            </div>
          </section>

          <div className="flex items-center gap-2 rounded-card border border-border bg-surface px-4 py-3 text-xs text-muted">
            <TimerReset size={16} className="text-action" />
            <span>{t(locale, "portal.dashboard.generatedAt")} {new Date(snapshot.generatedAt).toLocaleString(locale === "ur" ? "ur-PK" : "en-PK")}</span>
          </div>
        </>
      ) : null}
    </section>
  );
}
