import { Text, View } from "react-native";

import { fontFamily, layout, semanticColors } from "../theme/tokens";

export function AppAttributionFooter({ stickToBottom = false }: { stickToBottom?: boolean }) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel="Powered by Fruit of Sustainability SMC Private Limited"
      style={{
        alignSelf: "stretch",
        alignItems: "center",
        marginTop: stickToBottom ? "auto" : 18,
        paddingHorizontal: layout.mobilePagePaddingX,
        paddingTop: 4,
        paddingBottom: stickToBottom ? 4 : 0,
        gap: 7,
      }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          width: 44,
          height: 2,
          borderRadius: 1,
          backgroundColor: semanticColors.borderEssential,
        }}
      />
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        style={{
          color: semanticColors.textSecondary,
          fontFamily: fontFamily.ui,
          fontSize: 11.5,
          lineHeight: 17,
          textAlign: "center",
          maxWidth: 330,
        }}
      >
        Powered by{" "}
        <Text style={{ color: "#244A8F", fontFamily: fontFamily.uiSemibold }}>
          Fruit of Sustainability (SMC-Private) Limited
        </Text>
      </Text>
    </View>
  );
}
