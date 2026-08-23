import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  isPromptId,
  promptAudioService,
  type FoundationScreenId,
  type PromptId,
} from "../services/promptAudioService";
import { useLocaleStore } from "../stores/localeStore";
import { useVoiceGuidanceStore } from "../stores/voiceGuidanceStore";

type PlaybackState = "idle" | "loading" | "playing" | "error";

type AutoPromptTarget =
  | { kind: "screen"; id: FoundationScreenId }
  | { kind: "prompt"; id: PromptId }
  | null;

/**
 * Voice-first playback: speak the current screen/step automatically on focus.
 * Stops when the user leaves or the prompt target changes.
 */
export function useAutoPromptPlayback(target: AutoPromptTarget) {
  const [state, setState] = useState<PlaybackState>("idle");
  const generationRef = useRef(0);
  const locale = useLocaleStore((current) => current.locale);
  const guidanceEnabled = useVoiceGuidanceStore((current) => current.enabled);
  const guidanceHydrated = useVoiceGuidanceStore((current) => current.hydrated);

  useFocusEffect(
    useCallback(() => {
      if (!target || locale !== "ur" || !guidanceHydrated || !guidanceEnabled) {
        setState("idle");
        return;
      }

      const generation = ++generationRef.current;
      let cancelled = false;

      const run = async () => {
        setState("loading");
        try {
          setState("playing");
          if (target.kind === "screen") {
            await promptAudioService.playScreenPrompt(target.id);
          } else {
            await promptAudioService.playPrompt(target.id);
          }
          if (!cancelled && generationRef.current === generation) {
            setState("idle");
          }
        } catch {
          if (!cancelled && generationRef.current === generation) {
            setState("error");
          }
        }
      };

      void run();

      return () => {
        cancelled = true;
        generationRef.current += 1;
        void promptAudioService.stop();
        setState("idle");
      };
    }, [guidanceEnabled, guidanceHydrated, locale, target?.kind, target && "id" in target ? target.id : null]),
  );

  return { state };
}

export function useAutoScreenPrompt(screenId: FoundationScreenId) {
  return useAutoPromptPlayback({ kind: "screen", id: screenId });
}

export function useAutoPromptId(promptId: string | undefined) {
  const target: AutoPromptTarget = isPromptId(promptId)
    ? { kind: "prompt", id: promptId }
    : null;
  return useAutoPromptPlayback(target);
}

/** @deprecated Prefer useAutoScreenPrompt — kept for any remaining manual callers */
export function usePromptPlayback(screenId: FoundationScreenId) {
  return useAutoScreenPrompt(screenId);
}
