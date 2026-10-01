/** @jsxImportSource react */
import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens } from "../../theme";
import { Spinner } from "./Spinner";

export interface IconButtonProps extends Omit<PressableProps, "style" | "children"> {
  /** Required — there is no visible label */
  accessibilityLabel: string;
  icon: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  loading,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const styles = useStyles();
  const theme = useThemeTokens();
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === "primary" || variant === "destructive"
      ? theme.colors.onActionPrimary
      : theme.colors.actionPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? <Spinner size="sm" color={spinnerColor} /> : icon}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: t.radii.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sm: { width: 36, height: 36 },
  md: { width: 44, height: 44 },
  lg: { width: 52, height: 52 },

  primary: { backgroundColor: t.colors.actionPrimary, borderColor: "rgba(255,255,255,0.14)" },
  primaryPressed: { backgroundColor: t.colors.actionPrimaryPressed, transform: [{ scale: 0.94 }] },
  secondary: { backgroundColor: t.colors.surfaceRaised, borderColor: t.colors.border },
  secondaryPressed: { backgroundColor: t.colors.actionSecondaryPressed, transform: [{ scale: 0.94 }] },
  outline: { borderColor: t.colors.borderStrong, backgroundColor: "transparent" },
  outlinePressed: { backgroundColor: t.colors.actionSecondary, transform: [{ scale: 0.94 }] },
  ghost: { backgroundColor: "transparent" },
  ghostPressed: { backgroundColor: t.colors.actionSecondary, transform: [{ scale: 0.94 }] },
  destructive: { backgroundColor: t.colors.actionDanger },
  destructivePressed: { backgroundColor: t.colors.actionDangerPressed, transform: [{ scale: 0.94 }] },
  disabled: { opacity: t.opacity.disabled },
}));
