import { Image, type ImageStyle, type StyleProp } from "react-native";

import MARK from "../../assets/logo-mark.png";

/** Cotton, worker, and protected-voice brand mark. Do not mirror in RTL. */
export function KapasMark({
  size = 40,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={MARK}
      accessible={false}
      accessibilityIgnoresInvertColors
      importantForAccessibility="no"
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
