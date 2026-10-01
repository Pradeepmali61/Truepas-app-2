import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens, type SemanticColors } from "../../theme";

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  /** Hash-based accent tint for the fallback (design-repo: family members). */
  tinted?: boolean;
  style?: StyleProp<ViewStyle>;
}

const PX = { xs: 26, sm: 34, md: 42, lg: 52, xl: 66, xxl: 96 } as const;
const FONT = { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 32 } as const;

const TINTS: [keyof SemanticColors, keyof SemanticColors][] = [
  ["actionPrimarySubtle", "actionPrimary"],
  ["accentSubtle", "onAccentSubtle"],
  ["successSubtle", "onSuccessSubtle"],
  ["infoSubtle", "onInfoSubtle"],
  ["warningSubtle", "onWarningSubtle"],
];

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() ?? "")
    .join("");
}

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ uri, name, size = "md", tinted, style }: AvatarProps) {
  const styles = useStyles();
  const t = useThemeTokens();
  const [imgError, setImgError] = useState(false);
  const showImage = uri && !imgError;

  const tint = tinted && name ? TINTS[hashName(name) % TINTS.length] : null;
  const tintStyle = tint ? { backgroundColor: t.colors[tint[0]] } : null;
  const tintText = tint ? { color: t.colors[tint[1]] } : null;

  return (
    <View
      style={[styles.avatar, { width: PX[size], height: PX[size] }, tintStyle, style]}
      accessibilityLabel={name ? `Avatar for ${name}` : "Avatar"}
      accessibilityRole="image"
    >
      {!showImage && !tint && (
        <LinearGradient
          colors={[t.brand.b600, t.scheme === "dark" ? "#14204a" : t.brand.b700]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {showImage ? (
        <Image
          source={{ uri }}
          style={styles.image}
          onError={() => setImgError(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={[styles.fallback, { fontSize: FONT[size] }, tintText]}>
          {name?.trim() ? initials(name) : "?"}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  avatar: {
    borderRadius: t.radii.full,
    backgroundColor: t.colors.actionPrimarySubtle,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  fallback: {
    color: "#ffffff",
    fontFamily: t.fontFamily.display.semibold,
    fontWeight: t.fontWeight.semibold,
    letterSpacing: -0.3,
  },
}));
