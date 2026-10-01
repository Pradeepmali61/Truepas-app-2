/**
 * Surface primitive — the Midnight Luxe card. (Name kept from the neumorphic
 * era so every screen restyles without call-site churn.)
 *
 *   <NeuBox variant="raised">…</NeuBox>  — layered card: graphite fill, hairline
 *                                           rim, top sheen, deep diffuse shadow
 *   <NeuBox variant="inset">…</NeuBox>   — sunken well: darker fill, faint rim
 *   <NeuBox variant="flat">…</NeuBox>    — rimmed surface, no shadow
 *
 * Elevation in a dark UI reads from *light*, not shadow: a slightly lighter
 * fill, a 1px rim and a sheen across the top edge. The shadow sits on an
 * unclipped outer host; paint and content live on a clipped inner view.
 */
import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { alpha, useThemeTokens } from "../../theme";

export type NeuVariant = "raised" | "inset" | "flat";

/**
 * Caller-style keys that describe the *inside* of the box — paint, padding,
 * child layout and corner radii. They move to the clipped inner view so the
 * outer shadow host stays unclipped; every other key (size, position,
 * margins, opacity…) stays on the host.
 */
const RADIUS_KEYS = new Set([
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderTopStartRadius",
  "borderTopEndRadius",
  "borderBottomStartRadius",
  "borderBottomEndRadius",
]);

const INNER_STYLE_KEYS = new Set([
  ...RADIUS_KEYS,
  "backgroundColor",
  "overflow",
  "borderColor",
  "borderStyle",
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStartWidth",
  "borderEndWidth",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderStartColor",
  "borderEndColor",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingStart",
  "paddingEnd",
  "paddingHorizontal",
  "paddingVertical",
  "flexDirection",
  "alignItems",
  "alignContent",
  "justifyContent",
  "flexWrap",
  "gap",
  "rowGap",
  "columnGap",
]);

export interface NeuBoxProps {
  variant?: NeuVariant;
  /** Corner radius — defaults to the theme xl radius. */
  radius?: number;
  /** Fill color — defaults to the surface (raised/flat) or sunken (inset) tone. */
  color?: string;
  /** Shadow reach in dp. Default 6. */
  depth?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function NeuBox({ variant = "raised", radius, color, depth = 6, style, children }: NeuBoxProps) {
  const t = useThemeTokens();
  const dark = t.scheme === "dark";
  const r = radius ?? t.radii.xl;
  const fill = color ?? (variant === "inset" ? t.colors.surfaceSunken : t.colors.surface);

  const flat = StyleSheet.flatten(style) ?? {};
  const outerStyle: ViewStyle = {};
  const innerStyle: ViewStyle = {};
  const radiusStyle: ViewStyle = {};
  for (const [k, v] of Object.entries(flat)) {
    if (RADIUS_KEYS.has(k)) (radiusStyle as Record<string, unknown>)[k] = v;
    ((INNER_STYLE_KEYS.has(k) ? innerStyle : outerStyle) as Record<string, unknown>)[k] = v;
  }
  const paint = innerStyle.backgroundColor ?? fill;
  // A brand-colored fill (solid buttons) gets a colored glow, not a black drop.
  const tinted = paint === t.colors.actionPrimary;

  // BUG010 — never DROP borderWidth once set: on Android, removing it sends
  // NaN into BorderInsets and the overflow-hidden clip swallows every child.
  // The rim is therefore always an explicit width; caller borders still win.
  const rim: ViewStyle = {
    borderWidth: StyleSheet.hairlineWidth * (Platform.OS === "android" ? 2 : 1.5),
    borderColor:
      variant === "inset"
        ? alpha(dark ? "#ffffff" : "#0a0f1a", dark ? 0.045 : 0.06)
        : tinted
          ? alpha("#ffffff", 0.18)
          : dark
            ? t.colors.border
            : alpha("#0a0f1a", 0.07),
  };

  // Yoga inflates a flexGrow child even inside an auto-height host when a
  // bounded column ancestor has free space (yoga#701) — grow the inner view
  // only when the caller actually sized the host.
  const hostSized =
    outerStyle.height != null ||
    outerStyle.minHeight != null ||
    outerStyle.maxHeight != null ||
    outerStyle.flex != null ||
    outerStyle.flexGrow != null ||
    outerStyle.flexBasis != null ||
    outerStyle.aspectRatio != null;

  const shadow: ViewStyle | null =
    variant === "raised"
      ? {
          shadowColor: tinted ? t.colors.actionPrimary : "#000000",
          shadowOffset: { width: 0, height: Math.round(depth * (tinted ? 1 : 1.4)) },
          shadowOpacity: tinted ? 0.45 : dark ? 0.55 : 0.08,
          shadowRadius: depth * (tinted ? 2.2 : 3),
          ...(Platform.OS === "android" ? { elevation: tinted ? 6 : Math.max(1, Math.round(depth / 2)) } : null),
        }
      : null;

  // BUG015 — collapsable={false}: keep the host a concrete view so Fabric
  // never un-flattens and reparents its children mid-press (Android crash).
  return (
    <View collapsable={false} style={[{ borderRadius: r }, radiusStyle, outerStyle]}>
      {shadow && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderRadius: r, backgroundColor: paint }, radiusStyle, shadow]}
        />
      )}
      <View
        style={[
          { alignSelf: "stretch", borderRadius: r, backgroundColor: paint, overflow: "hidden" },
          hostSized && { flexGrow: 1 },
          rim,
          innerStyle,
        ]}
      >
        {variant !== "inset" && (
          <LinearGradient
            pointerEvents="none"
            colors={[alpha("#ffffff", tinted ? 0.16 : dark ? 0.045 : 0.5), alpha("#ffffff", 0)]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { bottom: "45%" }]}
          />
        )}
        {children}
      </View>
    </View>
  );
}

/** Sunken well — shorthand for NeuBox inset on the sunken tint. */
export function NeuWell(props: Omit<NeuBoxProps, "variant">) {
  const t = useThemeTokens();
  return <NeuBox variant="inset" color={props.color ?? t.colors.surfaceSunken} {...props} />;
}

/** Round glass icon button — header bell / close affordance. `solid` gives
 *  the filled brand variant. */
export interface SoftIconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  size?: number;
  /** Solid brand fill (primary actions). */
  solid?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function SoftIconButton({
  icon: IconCmp,
  onPress,
  size = 44,
  solid,
  disabled,
  accessibilityLabel,
  style,
}: SoftIconButtonProps) {
  const t = useThemeTokens();
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={6}
      style={style}
    >
      <NeuBox
        variant={solid ? "raised" : "flat"}
        radius={size / 2}
        color={solid ? t.colors.actionPrimary : pressed ? t.colors.actionSecondaryPressed : t.colors.surfaceRaised}
        depth={4}
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? t.opacity.disabled : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        }}
      >
        <IconCmp
          size={Math.round(size * 0.44)}
          strokeWidth={1.8}
          color={solid ? t.colors.onActionPrimary : t.colors.textPrimary}
        />
      </NeuBox>
    </Pressable>
  );
}
