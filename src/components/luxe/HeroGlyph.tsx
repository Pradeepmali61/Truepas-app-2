import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { PopIn, Pulse } from "@/components/ui";
import { alpha, useThemeTokens } from "@/theme";
import { useSvgId } from "./useSvgId";

export type HeroTone = "brand" | "success" | "warning" | "error";

/**
 * The hero orb for intro / result screens: a soft radial halo, three
 * hairline orbit rings and a glossy gradient core holding the glyph.
 * Pops in, then breathes. Use one per screen, above the headline.
 */
export function HeroGlyph({
  icon: Icon,
  tone = "brand",
  size = 168,
  style,
}: {
  icon: LucideIcon;
  tone?: HeroTone;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useThemeTokens();
  const [c1, c2] =
    tone === "success"
      ? [t.colors.success, "#0e7a57"]
      : tone === "warning"
        ? [t.colors.warning, "#a3610a"]
        : tone === "error"
          ? [t.colors.error, "#a32c3d"]
          : [t.brand.b500, t.brand.b700];
  const core = Math.round(size * 0.43);
  const id = useSvgId("halo");

  return (
    <View style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}>
      <Svg style={StyleSheet.absoluteFill} width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c1} stopOpacity={0.38} />
            <Stop offset="0.55" stopColor={c1} stopOpacity={0.08} />
            <Stop offset="1" stopColor={c1} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
        {[0.48, 0.4, 0.32].map((k, i) => (
          <Circle
            key={k}
            cx={size / 2}
            cy={size / 2}
            r={size * k}
            stroke={c1}
            strokeOpacity={0.1 + i * 0.07}
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>
      <PopIn ms={420}>
        <Pulse to={1.05} ms={1600}>
          <View
            style={{
              width: core,
              height: core,
              borderRadius: core / 2,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: alpha("#ffffff", 0.22),
              shadowColor: c1,
              shadowOpacity: 0.7,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <LinearGradient colors={[c1, c2]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={[alpha("#ffffff", 0.35), alpha("#ffffff", 0)]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ zIndex: 1 }}>
              <Icon size={Math.round(core * 0.46)} strokeWidth={1.8} color="#ffffff" />
            </View>
          </View>
        </Pulse>
      </PopIn>
    </View>
  );
}
