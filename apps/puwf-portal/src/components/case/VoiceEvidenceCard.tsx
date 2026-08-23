"use client";

import type { VoiceEvidence } from "@kapas/domain";
import { t } from "@kapas/localization";
import { AudioLines } from "lucide-react";

import { Card } from "@/components/ui/card";
import { demoAudioSrc, formatDuration } from "@/lib/case-workspace";
import { useLocaleStore } from "@/stores/locale-store";

export function VoiceEvidenceCard({
  voice,
  transcriptUr,
  transcriptEn,
}: {
  voice: VoiceEvidence | null;
  transcriptUr?: string;
  transcriptEn?: string;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const src = demoAudioSrc(voice?.localUri);

  return (
    <Card>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink"><AudioLines aria-hidden size={18} className="text-[var(--brand-fos-teal-dark)]" />{t(locale, "portal.case.voice")}</h2>
      {!voice ? (
        <p className="mt-2 text-sm text-muted">{t(locale, "portal.case.noAudio")}</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-control bg-[var(--surface-soft-teal)] p-3">
            {src ? <audio className="h-10 w-full" controls preload="metadata" src={src}>{t(locale, "portal.case.audioUnavailable")}</audio> : <p className="text-xs text-muted">{t(locale, "portal.case.audioUnavailable")}</p>}
            <p className="mt-1 text-xs text-muted">
              {t(locale, "portal.case.duration")}: {formatDuration(voice.durationMs)}
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-control border border-border bg-page p-3">
            <p className="text-xs text-muted">{t(locale, "portal.case.transcript")}</p>
            <p className="mt-1 font-urdu text-sm leading-6 text-ink" dir="rtl">{transcriptUr ?? t(locale, "portal.case.noTranscript")}</p>
          </div>
          <div className="rounded-control border border-border bg-page p-3">
            <p className="text-xs text-muted">{t(locale, "portal.case.translation")}</p>
            <p className="mt-1 text-sm leading-6 text-ink" dir="ltr">{transcriptEn ?? t(locale, "portal.case.noTranslation")}</p>
          </div>
          </div>
        </div>
      )}
    </Card>
  );
}
