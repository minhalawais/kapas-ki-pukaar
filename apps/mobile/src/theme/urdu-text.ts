import type { TextStyle } from "react-native";

/**
 * Naskh/Nastaliq glyphs hang below the Latin baseline.
 * Tight lineHeight or zero padding clips descenders on Android/iOS.
 */
export function urduLineHeight(fontSize: number, role: "ui" | "heading" = "ui"): number {
  return Math.round(fontSize * (role === "heading" ? 1.95 : 1.72));
}

export function urduSafeText(fontSize: number, role: "ui" | "heading" = "ui"): TextStyle {
  return {
    fontSize,
    lineHeight: urduLineHeight(fontSize, role),
    paddingTop: Math.round(fontSize * 0.06),
    paddingBottom: Math.round(fontSize * 0.22),
    includeFontPadding: true,
  };
}
