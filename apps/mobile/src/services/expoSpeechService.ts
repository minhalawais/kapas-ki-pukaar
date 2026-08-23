import type { Locale, PermissionState, VoiceEvidence } from "@kapas/domain";
import { isPromptId, type SpeechService } from "@kapas/speech";

import { promptAudioService } from "./promptAudioService";

type PlaybackStatus = {
  isLoaded?: boolean;
  didJustFinish?: boolean;
  error?: string;
};

type SoundHandle = {
  playAsync: () => Promise<unknown>;
  stopAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
  setOnPlaybackStatusUpdate: (cb: ((status: PlaybackStatus) => void) | null) => void;
};

type RecordingHandle = {
  startAsync: () => Promise<void>;
  stopAndUnloadAsync: () => Promise<{ durationMillis?: number } | void>;
  getURI: () => string | null;
};

type ExpoAudio = {
  requestPermissionsAsync: () => Promise<{ granted: boolean; canAskAgain?: boolean }>;
  getPermissionsAsync: () => Promise<{ granted: boolean; canAskAgain?: boolean }>;
  setAudioModeAsync: (mode: Record<string, unknown>) => Promise<void>;
  Recording: {
    createAsync: (options: unknown) => Promise<{ recording: RecordingHandle }>;
  };
  RecordingOptionsPresets: { HIGH_QUALITY: unknown };
  Sound: { createAsync: (source: { uri: string }) => Promise<{ sound: SoundHandle }> };
};

async function getAudio(): Promise<ExpoAudio> {
  const mod = (await import("expo-av")) as unknown as { Audio: ExpoAudio };
  return mod.Audio;
}

export class ExpoSpeechService implements SpeechService {
  recordingLocale: Locale = "ur";
  private recording: RecordingHandle | null = null;
  private sound: SoundHandle | null = null;
  private startedAt = 0;

  async requestPermission(): Promise<PermissionState> {
    try {
      const Audio = await getAudio();
      const current = await Audio.getPermissionsAsync();
      if (current.granted) {
        return "granted";
      }
      const next = await Audio.requestPermissionsAsync();
      if (next.granted) {
        return "granted";
      }
      return "denied";
    } catch {
      return "undetermined";
    }
  }

  async startRecording(): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== "granted") {
      throw new Error("Microphone permission is not granted.");
    }
    await this.stopPlayback();
    await promptAudioService.stop();
    const Audio = await getAudio();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    this.recording = recording;
    this.startedAt = Date.now();
  }

  async stopRecording(): Promise<VoiceEvidence> {
    const recording = this.recording;
    if (!recording) {
      throw new Error("No active recording.");
    }
    this.recording = null;
    let durationMs = Math.max(1, Date.now() - this.startedAt);
    try {
      const status = await recording.stopAndUnloadAsync();
      if (status && typeof status.durationMillis === "number" && status.durationMillis > 0) {
        durationMs = status.durationMillis;
      }
    } catch {
      throw new Error("Recording failed.");
    }
    const localUri = recording.getURI();
    if (!localUri) {
      throw new Error("No audio.");
    }
    const Audio = await getAudio();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    return {
      id: `voice-${this.startedAt}`,
      localUri,
      durationMs,
      recordedAt: new Date(this.startedAt).toISOString(),
      locale: this.recordingLocale,
    };
  }

  async play(uri: string): Promise<void> {
    if (!uri) {
      throw new Error("Playback failed.");
    }
    await this.stopPlayback();
    await promptAudioService.stop();
    const Audio = await getAudio();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    const { sound } = await Audio.Sound.createAsync({ uri });
    this.sound = sound;
    await new Promise<void>((resolve, reject) => {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.error) {
          reject(new Error(status.error));
          return;
        }
        if (status.didJustFinish) {
          resolve();
        }
      });
      void sound.playAsync().catch(reject);
    }).finally(() => {
      void this.stopPlayback();
    });
  }

  async stopPlayback(): Promise<void> {
    if (!this.sound) {
      return;
    }
    const sound = this.sound;
    this.sound = null;
    try {
      await sound.stopAsync();
    } catch {
      // Playback may already have ended.
    }
    await sound.unloadAsync();
  }

  async playPrompt(promptId: string, _locale: string): Promise<void> {
    if (!isPromptId(promptId)) {
      throw new Error(`Unknown prompt ${promptId}`);
    }
    await this.stopPlayback();
    await promptAudioService.playPrompt(promptId);
  }

  async deleteRecording(_uri: string): Promise<void> {
    await this.stopPlayback();
  }
}

export const expoSpeechService = new ExpoSpeechService();
