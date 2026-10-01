/** @jsxImportSource react */
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Redirect, Tabs } from 'expo-router';
import { CalendarCheck, FileText, House } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppSelector } from '@/store';
import { alpha, makeStyles, useThemeTokens } from '@/theme';

function TabItem({ isFocused, options, label, onPress }: { isFocused: boolean; options: any; label: string; onPress: () => void }) {
  const theme = useThemeTokens();
  const styles = useStyles();
  const [scale] = useState(() => new Animated.Value(1));
  const [glow] = useState(() => new Animated.Value(isFocused ? 1 : 0));

  useEffect(() => {
    Animated.spring(glow, { toValue: isFocused ? 1 : 0, friction: 8, tension: 120, useNativeDriver: true }).start();
  }, [isFocused, glow]);

  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, friction: 7, tension: 160, useNativeDriver: true }).start();

  const color = isFocused ? theme.colors.textPrimary : theme.colors.textMuted;
  const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 22 }) : null;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => to(0.9)}
      onPressOut={() => to(1)}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={styles.tabItem}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale }] }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.activePill, { opacity: glow, transform: [{ scaleX: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }]}
        />
        <View style={styles.tabContent}>
          {icon}
          <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Floating glass capsule tab bar over a fade-to-canvas scrim. */
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <View pointerEvents="box-none" style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, theme.spacing[3]) }]}>
      <LinearGradient
        pointerEvents="none"
        colors={[alpha(theme.colors.background, 0), alpha(theme.colors.background, 0.92), theme.colors.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.navBar}>
        {state.routes.map((route: typeof state.routes[number], index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = (options.tabBarLabel as string) ?? (options.title as string) ?? route.name;
          const onPress = () => {
            void Haptics.selectionAsync();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };
          return <TabItem key={route.key} isFocused={isFocused} options={options} label={label} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

/** Bottom tabs matching the design-repo V2 Dashboard mockup. */
export default function TabsLayout() {
  const { status, faceEnrolled } = useAppSelector((state) => state.auth);

  if (status !== 'authenticated') {
    return <Redirect href="/(auth)/welcome" />;
  }
  if (!faceEnrolled) {
    return <Redirect href="/(onboarding)/consent" />;
  }

  const tabIcon = (IconCmp: typeof House) => {
    function TabIcon({ color, size }: { color: ColorValue; size: number }) {
      return <IconCmp size={size} strokeWidth={1.9} color={color as string} />;
    }
    return TabIcon;
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon(House),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: tabIcon(FileText),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Check-ins',
          tabBarIcon: tabIcon(CalendarCheck),
        }}
      />
    </Tabs>
  );
}

const useStyles = makeStyles((t) => ({
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: t.spacing[6],
    paddingHorizontal: t.spacing[6],
  },
  navBar: {
    flexDirection: 'row',
    height: 66,
    padding: 6,
    borderRadius: 33,
    backgroundColor: t.scheme === 'dark' ? 'rgba(14, 19, 30, 0.97)' : t.colors.glass,
    borderWidth: 1,
    borderColor: t.colors.glassBorder,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  tabItem: { flex: 1 },
  tabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabContent: { alignItems: 'center', gap: 3, zIndex: 1 },
  activePill: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 27,
    backgroundColor: t.colors.actionSecondaryActive,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  label: { fontSize: 11, fontWeight: t.fontWeight.medium, color: t.colors.textMuted, letterSpacing: 0.1 },
  labelActive: { color: t.colors.textPrimary, fontWeight: t.fontWeight.semibold },
}));
