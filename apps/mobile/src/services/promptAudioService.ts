import { PROMPT_FILES, isPromptId, type PromptId } from "@kapas/speech";

import { BUNDLED_PROMPT_ASSETS } from "./generatedPromptAssets";

export { PROMPT_FILES, isPromptId, type PromptId };

export const SCREEN_PROMPT_ID = {
  "M-002": "SC-welcome",
  "M-003": "SC-welcome",
  "M-004": "SC-home",
} as const satisfies Record<string, PromptId>;

export type FoundationScreenId = keyof typeof SCREEN_PROMPT_ID;

/** MP3 decoder + Android audio buffer often finish before the last syllable is audible. */
const PLAYBACK_TAIL_PADDING_MS = 400;

type PlaybackStatus = {
  isLoaded?: boolean;
  didJustFinish?: boolean;
  error?: string;
  positionMillis?: number;
  durationMillis?: number;
  isPlaying?: boolean;
};
type SoundHandle = {
  playAsync: () => Promise<unknown>;
  stopAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
  setOnPlaybackStatusUpdate: (cb: ((status: PlaybackStatus) => void) | null) => void;
};

let activeSound: SoundHandle | null = null;
let activePlaybackCancel: (() => void) | null = null;
let playbackGeneration = 0;

async function getAudio(): Promise<{
  setAudioModeAsync: (mode: Record<string, unknown>) => Promise<void>;
  Sound: { createAsync: (source: number, initialStatus?: Record<string, unknown>) => Promise<{ sound: SoundHandle }> };
}> {
  const mod = (await import("expo-av")) as {
    Audio: {
      setAudioModeAsync: (mode: Record<string, unknown>) => Promise<void>;
      Sound: { createAsync: (source: number, initialStatus?: Record<string, unknown>) => Promise<{ sound: SoundHandle }> };
    };
  };
  return mod.Audio;
}

async function stopActiveSound(): Promise<void> {
  const cancel = activePlaybackCancel;
  activePlaybackCancel = null;
  cancel?.();
  if (!activeSound) return;
  const sound = activeSound;
  activeSound = null;
  try {
    await sound.stopAsync();
  } catch {
    // Playback may already have ended.
  }
  try {
    await sound.unloadAsync();
  } catch {
    // Native audio may already have released the resource.
  }
}

function hasBundledPrompt(promptId: PromptId): boolean {
  return BUNDLED_PROMPT_ASSETS[promptId] !== undefined;
}

function playbackReachedEnd(status: PlaybackStatus): boolean {
  if (status.didJustFinish) return true;
  if (status.durationMillis == null || status.positionMillis == null) return false;
  return status.positionMillis >= status.durationMillis - 80;
}

async function playOne(promptId: PromptId, generation: number): Promise<void> {
  if (generation !== playbackGeneration) return;
  const source = BUNDLED_PROMPT_ASSETS[promptId];
  if (source === undefined) return;
  const Audio = await getAudio();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: false });
  const { sound } = await Audio.Sound.createAsync(source, { progressUpdateIntervalMillis: 100 });
  if (generation !== playbackGeneration) {
    await sound.unloadAsync();
    return;
  }
  activeSound = sound;
  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        if (activePlaybackCancel === finish) activePlaybackCancel = null;
        resolve();
      };
      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        if (activePlaybackCancel === finish) activePlaybackCancel = null;
        reject(error);
      };
      activePlaybackCancel = finish;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.error) fail(new Error(status.error));
        else if (playbackReachedEnd(status)) finish();
      });
      void sound.playAsync().catch((error: unknown) => fail(error instanceof Error ? error : new Error("Prompt playback failed.")));
    });
  } finally {
    if (activeSound === sound) activeSound = null;
    sound.setOnPlaybackStatusUpdate(null);
    await new Promise((resolve) => setTimeout(resolve, PLAYBACK_TAIL_PADDING_MS));
    try {
      await sound.unloadAsync();
    } catch {
      // Native audio may already have released the resource.
    }
  }
}

export const promptAudioService = {
  hasBundledPrompt,
  resolveFileName(promptId: PromptId): string {
    return PROMPT_FILES[promptId];
  },
  resolveScreenPrompt(screenId: FoundationScreenId): PromptId {
    return SCREEN_PROMPT_ID[screenId];
  },
  async stop(): Promise<void> {
    playbackGeneration += 1;
    await stopActiveSound();
  },
  async playPrompt(promptId: PromptId): Promise<void> {
    const generation = playbackGeneration + 1;
    playbackGeneration = generation;
    await stopActiveSound();
    await playOne(promptId, generation);
  },
  async playPrompts(promptIds: readonly PromptId[], onProgress?: (current: number, total: number) => void): Promise<void> {
    const generation = playbackGeneration + 1;
    playbackGeneration = generation;
    await stopActiveSound();
    for (let index = 0; index < promptIds.length; index += 1) {
      if (generation !== playbackGeneration) return;
      onProgress?.(index + 1, promptIds.length);
      await playOne(promptIds[index], generation);
    }
  },
  async playScreenPrompt(screenId: FoundationScreenId): Promise<void> {
    await this.playPrompt(this.resolveScreenPrompt(screenId));
  },
};
