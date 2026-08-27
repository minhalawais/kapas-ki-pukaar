import type { TextStyle } from "react-native";

/**
 * Naskh/Nastaliq glyphs hang below the Latin baseline.
 * Tight lineHeight or zero padding clips descenders on Android/iOS.
 */
export function urduLineHeight(fontSize: number, role: "ui" | "heading" = "ui"): number {
  return Math.round(fontSize * (role === "heading" ? 2.25 : 1.75));
}

export function urduSafeText(fontSize: number, role: "ui" | "heading" = "ui"): TextStyle {
  const isHeading = role === "heading";
  return {
    fontSize,
    lineHeight: urduLineHeight(fontSize, role),
    paddingTop: Math.round(fontSize * (isHeading ? 0.38 : 0.14)),
    paddingBottom: Math.round(fontSize * (isHeading ? 0.35 : 0.22)),
    includeFontPadding: true,
    writingDirection: "rtl",
  };
}

export function urduBrandText(fontSize: number): TextStyle {
  return {
    fontSize,
    lineHeight: Math.round(fontSize * 2.55),
    paddingTop: Math.round(fontSize * 0.58),
    paddingBottom: Math.round(fontSize * 0.3),
    includeFontPadding: true,
    textAlignVertical: "center",
    writingDirection: "rtl",
  };
}

export function localizedTextMetrics(
  locale: "en" | "ur",
  fontSize: number,
  lineHeight: number,
  role: "ui" | "heading" = "ui",
): TextStyle {
  return locale === "ur" ? urduSafeText(fontSize, role) : { fontSize, lineHeight, writingDirection: "ltr" };
}
