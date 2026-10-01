import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { alpha, makeStyles, useThemeTokens } from "../../theme";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Midnight Luxe button. Primary is a cobalt → Truepas-sky gradient with a
 * soft brand glow and a glass sheen; secondary/outline are rimmed graphite.
 * Every press scales to 0.97 and fires a selection haptic.
 */
export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  iconLeft,
  iconRight,
  fullWidth,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const styles = useStyles();
  const theme = useThemeTokens();
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const filled = variant === "primary" || variant === "destructive";

  const spinnerColor = filled ? theme.colors.onActionPrimary : theme.colors.textPrimary;
  const gradient: readonly [string, string, ...string[]] =
    variant === "destructive"
      ? [theme.colors.error, "#e0435f"]
      : [theme.colors.actionPrimary, theme.brand.b500, theme.combo?.accent.b600 ?? theme.colors.accent];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={(e) => {
        setPressed(true);
        if (variant !== "link" && Platform.OS !== "web") void Haptics.selectionAsync();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[
        styles.base,
        styles[size],
        styles[variant],
        filled && !isDisabled && styles[`${variant}Glow`],
        pressed && styles[`${variant}Pressed`],
        pressed && variant !== "link" && styles.pressedScale,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...rest}
    >
      {filled && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.fillClip, styles[`${size}Radius`]]}>
          <LinearGradient
            colors={isDisabled ? [theme.colors.actionPrimaryDisabled, theme.colors.actionPrimaryDisabled] : gradient}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.8 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[alpha("#ffffff", 0.2), alpha("#ffffff", 0)]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { bottom: "50%" }]}
          />
        </View>
      )}
      {loading ? (
        <Spinner size="sm" color={spinnerColor} />
      ) : (
        iconLeft && <View style={styles.icon}>{iconLeft}</View>
      )}
      {children != null && (
        <Text
          style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
        >
          {children}
        </Text>
      )}
      {!loading && iconRight && <View style={styles.icon}>{iconRight}</View>}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing[2],
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  fillClip: { borderRadius: t.radii.lg, overflow: "hidden" },
  sm: { height: t.sizes.heightSm, paddingHorizontal: t.sizes.controlPaddingXSm, borderRadius: t.radii.md },
  md: { height: t.sizes.heightMd, paddingHorizontal: t.sizes.controlPaddingXMd },
  lg: { height: t.sizes.heightLg, paddingHorizontal: t.sizes.controlPaddingXLg },
  smRadius: { borderRadius: t.radii.md },
  mdRadius: {},
  lgRadius: {},
  fullWidth: { alignSelf: "stretch" },
  pressedScale: { transform: [{ scale: 0.97 }] },

  label: { fontWeight: t.fontWeight.semibold, letterSpacing: -0.1 },
  smLabel: { fontSize: t.fontSize.sm },
  mdLabel: { fontSize: t.fontSize.base },
  lgLabel: { fontSize: t.fontSize.md },

  primary: { borderColor: alpha("#ffffff", 0.14) },
  primaryGlow: {
    shadowColor: t.colors.actionPrimary,
    shadowOpacity: t.scheme === "dark" ? 0.5 : 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryPressed: { opacity: 0.92 },
  primaryLabel: { color: t.colors.onActionPrimary },

  secondary: { backgroundColor: t.colors.surfaceRaised, borderColor: t.colors.border },
  secondaryGlow: {},
  secondaryPressed: { backgroundColor: t.colors.actionSecondaryPressed },
  secondaryLabel: { color: t.colors.textPrimary },

  outline: { backgroundColor: "transparent", borderColor: t.colors.borderStrong },
  outlineGlow: {},
  outlinePressed: { backgroundColor: t.colors.actionSecondary },
  outlineLabel: { color: t.colors.textPrimary },

  ghost: { backgroundColor: "transparent" },
  ghostGlow: {},
  ghostPressed: { backgroundColor: t.colors.actionSecondary },
  ghostLabel: { color: t.colors.textPrimary },

  destructive: { borderColor: alpha("#ffffff", 0.12) },
  destructiveGlow: {
    shadowColor: t.colors.error,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  destructivePressed: { opacity: 0.92 },
  destructiveLabel: { color: t.colors.onActionDanger },

  link: { backgroundColor: "transparent", height: undefined, paddingHorizontal: 0, borderWidth: 0 },
  linkGlow: {},
  linkPressed: { opacity: 0.7 },
  linkLabel: { color: t.colors.textLink },

  disabled: { opacity: 0.55 },
  icon: {},
}));
