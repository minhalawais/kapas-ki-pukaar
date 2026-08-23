import { type ReactNode } from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { pagePadding } from "../theme/layout";
import { layout, semanticColors } from "../theme/tokens";

import { AppAttributionFooter } from "./app-attribution-footer";
import { OfflineBanner } from "./offline-banner";

export function ScreenShell({
  children,
  header,
  footer,
  scroll = false,
  contentStyle,
  backgroundColor = semanticColors.pageWorker,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}) {
  const content = {
    ...pagePadding(),
    paddingTop: header ? 12 : 20,
    paddingBottom: footer ? 16 : 24,
    gap: layout.mobileSectionGap,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={["top", "left", "right"]}>
      {header ? <View style={{ paddingHorizontal: layout.mobilePagePaddingX }}>{header}</View> : null}
      <View style={{ paddingHorizontal: layout.mobilePagePaddingX }}>
        <OfflineBanner />
      </View>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
          <AppAttributionFooter />
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content, contentStyle]}>
          {children}
          <AppAttributionFooter stickToBottom />
        </View>
      )}
      {footer}
    </SafeAreaView>
  );
}
