import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useThemeTokens } from "@/theme";

export type AuraTone = "brand" | "success" | "warning" | "error";

export interface AuraProps {
  /** Height of the glow field in dp (it fades out before this). Default 520. */
  height?: number;
  tone?: AuraTone;
  /** 0–1 multiplier on the glow strength. Default 1. */
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ambient light behind a screen's top area — two soft radial glows (a primary
 * hue top-left and a secondary hue top-right) bleeding into the midnight
 * canvas. Purely decorative: absolutely positioned, never intercepts touches.
 * Place as the first child of a screen root.
 */
export function Aura({ height = 520, tone = "brand", intensity = 1, style }: AuraProps) {
  const t = useThemeTokens();
  const dark = t.scheme === "dark";
  const [a, b] =
    tone === "success"
      ? [t.colors.success, t.colors.accent]
      : tone === "warning"
        ? [t.colors.warning, t.colors.error]
        : tone === "error"
          ? [t.colors.error, t.colors.warning]
          : [t.brand.b500, t.combo?.accent.b500 ?? t.colors.accent];
  const k = (dark ? 1 : 0.55) * intensity;

  return (
    <View pointerEvents="none" style={[styles.root, { height }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="auraA" cx="18%" cy="0%" rx="85%" ry="70%" fx="18%" fy="0%">
            <Stop offset="0" stopColor={a} stopOpacity={0.42 * k} />
            <Stop offset="0.45" stopColor={a} stopOpacity={0.12 * k} />
            <Stop offset="1" stopColor={a} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auraB" cx="92%" cy="8%" rx="70%" ry="55%" fx="92%" fy="8%">
            <Stop offset="0" stopColor={b} stopOpacity={0.28 * k} />
            <Stop offset="0.5" stopColor={b} stopOpacity={0.07 * k} />
            <Stop offset="1" stopColor={b} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#auraA)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#auraB)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "absolute", top: 0, left: 0, right: 0 },
});
