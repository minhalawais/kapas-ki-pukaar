import { type ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { layout, semanticColors } from "../theme/tokens";

export function ActionDock({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        minHeight: 88 + insets.bottom,
        paddingHorizontal: layout.mobilePagePaddingX,
        paddingTop: 14,
        paddingBottom: Math.max(14, insets.bottom),
        borderTopWidth: 1,
        borderTopColor: semanticColors.border,
        backgroundColor: semanticColors.surface,
      }}
    >
      {children}
    </View>
  );
}
