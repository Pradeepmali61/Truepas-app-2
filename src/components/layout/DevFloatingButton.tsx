import { usePathname, useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { DEMO_MODE } from '@/features/demo/config';

/**
 * Dev-only floating button — jumps to the /dev screen browser from anywhere.
 * Rendered only when __DEV__ (development builds / Metro); the in-component
 * check plus the gate in _layout keeps it out of preview/production bundles.
 */
export function DevFloatingButton() {
  if (DEMO_MODE) {
    return <TourButton />;
  }
  if (!__DEV__) {
    return null;
  }
  return <DevFloatingButtonInner />;
}

/** Demo mode — glass "Tour" pill that returns to the screen catalogue. */
function TourButton() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === '/demo') return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back to the demo tour"
      onPress={() => router.navigate('/demo' as never)}
      style={styles.tour}>
      <LayoutGrid size={15} strokeWidth={2.2} color="#ffffff" />
      <Text allowFontScaling={false} style={styles.tourLabel}>
        Tour
      </Text>
    </Pressable>
  );
}

function DevFloatingButtonInner() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open dev screen browser"
      onPress={() => router.push('/dev' as never)}
      style={styles.button}>
      <Text allowFontScaling={false} style={styles.label}>
        DEV
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tour: {
    position: 'absolute',
    bottom: 112,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(47, 107, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    zIndex: 9998,
    elevation: 8,
    shadowColor: '#2f6bff',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  tourLabel: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  button: {
    position: 'absolute',
    bottom: 110,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
