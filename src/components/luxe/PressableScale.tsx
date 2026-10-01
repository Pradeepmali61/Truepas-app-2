import * as Haptics from "expo-haptics";
import { useState, type ReactNode } from "react";
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

export interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  /** Scale at full press. Default 0.97. */
  to?: number;
  /** Fire a selection haptic on press-in. Default true. */
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * The single tactile primitive for tappable cards/tiles: a spring scale-down
 * on press plus a light haptic. Uses press callbacks + Animated (never a
 * function `style`, which NativeWind drops on native).
 */
export function PressableScale({ to = 0.97, haptic = true, style, children, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const spring = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: Platform.OS !== "web", speed: 40, bounciness: v === 1 ? 6 : 0 }).start();
  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={(e) => {
        spring(to);
        if (haptic && Platform.OS !== "web") void Haptics.selectionAsync();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        spring(1);
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
