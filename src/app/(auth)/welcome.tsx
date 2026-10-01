/**
 * Welcome — the signed-out front door. Full-bleed family photography melting
 * into the midnight canvas, a floating glass face-scan chip that tells the
 * product story at a glance, a display headline and the two entry points.
 * No back button: this is the root of the signed-out stack.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BadgeCheck, IdCard, ScanFace, Users, type LucideIcon } from 'lucide-react-native';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TruepasIcon } from '@/components/app/TruepasIcon';
import { Aura } from '@/components/luxe';
import { CoreButton, FadeUp, PopIn, Pulse, ScanFrame, ScanLine } from '@/components/ui';
import { alpha, makeStyles, useThemeTokens } from '@/theme';

const HERO = require('../../../assets/images/use-cases/family.jpg');

const FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: ScanFace, label: 'Face check-in' },
  { icon: Users, label: 'Family' },
  { icon: IdCard, label: 'Verified IDs' },
];

export default function WelcomeScreen() {
  const styles = useStyles();
  const t = useThemeTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = Math.round(height * 0.6);

  return (
    <View style={styles.screen}>
      {/* ---------- photography + fades ---------- */}
      <View style={[styles.hero, { height: heroHeight }]}>
        <Image source={HERO} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={[alpha(t.brand.b700, 0.35), alpha(t.brand.b700, 0)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[alpha(t.colors.background, 0.55), alpha(t.colors.background, 0.05), alpha(t.colors.background, 0.6), t.colors.background]}
          locations={[0, 0.3, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Aura height={heroHeight * 1.3} intensity={0.6} />

      {/* ---------- brand bar ---------- */}
      <View style={[styles.brandBar, { paddingTop: insets.top + t.spacing[3] }]}>
        <TruepasIcon size={18} color="#ffffff" />
        <Text style={styles.brandText}>Truepas</Text>
      </View>

      {/* ---------- floating scan chip ---------- */}
      <View style={[styles.scanWrap, { top: heroHeight * 0.3 }]}>
        <PopIn ms={480}>
          <Pulse to={1.03} ms={1800}>
            <View style={styles.scanCard}>
              <ScanFrame padding={10} style={styles.scanFrame}>
                <View style={styles.scanWell}>
                  <ScanLine color={alpha(t.colors.accent, 0.9)} />
                  <ScanFace size={40} strokeWidth={1.4} color="#ffffff" />
                </View>
              </ScanFrame>
              <View style={styles.verified}>
                <BadgeCheck size={14} strokeWidth={2.2} color={t.colors.success} />
                <Text style={styles.verifiedText}>Identity verified</Text>
                <Text style={styles.verifiedTime}>0.4s</Text>
              </View>
            </View>
          </Pulse>
        </PopIn>
      </View>

      {/* ---------- copy + actions ---------- */}
      <View style={[styles.content, { paddingBottom: insets.bottom + t.spacing[4] }]}>
        <FadeUp delay={160}>
          <Text style={styles.headline}>
            Your face is{'\n'}
            <Text style={styles.headlineAccent}>your pass.</Text>
          </Text>
        </FadeUp>
        <FadeUp delay={240}>
          <Text style={styles.sub}>
            Contactless check-in at hotels, parks and cruises — for you and everyone you travel with.
          </Text>
        </FadeUp>
        <FadeUp delay={300}>
          <View style={styles.features}>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.feature}>
                <f.icon size={14} strokeWidth={2} color={t.colors.onBrandSubtle} />
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>
        </FadeUp>
        <FadeUp delay={380}>
          <View style={styles.actions}>
            <CoreButton fullWidth size="lg" onPress={() => router.push('/(auth)/register')}>
              Create your pass
            </CoreButton>
            <CoreButton fullWidth size="lg" variant="ghost" onPress={() => router.push('/(auth)/login')}>
              I already have an account
            </CoreButton>
          </View>
        </FadeUp>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    paddingHorizontal: t.sizes.screenGutter + 4,
  },
  brandText: { fontFamily: t.fontFamily.display.bold, fontSize: 19, letterSpacing: -0.4, color: '#ffffff' },
  scanWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  scanCard: {
    alignItems: 'center',
    gap: t.spacing[3],
    padding: t.spacing[4],
    paddingBottom: t.spacing[3],
    borderRadius: 28,
    backgroundColor: 'rgba(8, 12, 22, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },
  scanFrame: {},
  scanWell: {
    width: 92,
    height: 92,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: alpha(t.brand.b600, 0.28),
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: t.radii.full,
    backgroundColor: 'rgba(47, 214, 154, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(127, 240, 196, 0.25)',
  },
  verifiedText: { fontSize: 12.5, fontWeight: t.fontWeight.semibold, color: '#c9f9e5' },
  verifiedTime: { fontFamily: t.fontFamily.mono.medium, fontSize: 11.5, color: alpha('#c9f9e5', 0.6) },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: t.sizes.screenGutter + 4,
    gap: t.spacing[4],
  },
  headline: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 44,
    lineHeight: 47,
    letterSpacing: -1.8,
    color: t.colors.textPrimary,
  },
  headlineAccent: { color: t.colors.onBrandSubtle },
  sub: { fontSize: 16, lineHeight: 24, color: t.colors.textSecondary, letterSpacing: -0.15 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing[2] },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: t.radii.full,
    backgroundColor: t.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  featureText: { fontSize: 12, fontWeight: t.fontWeight.medium, color: t.colors.textSecondary },
  actions: { gap: t.spacing[1], marginTop: t.spacing[3] },
}));
