import { Redirect, useRouter } from 'expo-router';
import { ListChecks, ScanFace, Sun, Timer, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert, ScreenHeader } from '@/components/composite';
import { Aura, ListGroup, ListRow, RowGlyph } from '@/components/luxe';
import { CoreButton, Progress, Pulse, RowIcon, ScanFrame, ScanLine, Typography } from '@/components/ui';
import { CameraUnavailable, loadLivenessCamera } from '@/features/liveness/cameraModule';
import { useAppSelector } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';
import { iconSize } from '@/theme/tokens';

const POINTS: { icon: LucideIcon; title: string }[] = [
  { icon: ListChecks, title: 'Follow the on-screen prompts' },
  { icon: Sun, title: 'Find good, even light' },
  { icon: Timer, title: 'Finish within a few minutes' },
];

/** Face scan — mandatory liveness + face enrollment gate (no skip, PRD v2.0).
 *  Shows the "Prove it's really you" prep screen first (mirrors the
 *  UI-design-repo FaceVerification intro); "Start verification" opens the
 *  LivenessCamera, lazy-required so builds without NitroModules show a
 *  fallback. */
const LivenessCamera = loadLivenessCamera();

export default function FaceScanScreen() {
  const theme = useThemeTokens();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [started, setStarted] = useState(false);
  // Liveness only runs after explicit biometric consent — a deep link to this
  // screen must go through the consent step first.
  const biometricConsent = useAppSelector((state) => state.auth.biometricConsent);

  if (!biometricConsent) return <Redirect href="/(onboarding)/consent" />;

  if (!started) {
    return (
      <View style={styles.safe}>
        <Aura height={520} />
        <SafeAreaView edges={['top']} style={styles.flex}>
          <ScreenHeader title="Face verification" onBack={() => router.back()} />
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.introStage}>
              <View style={styles.hero}>
                <ScanFrame padding={14}>
                  <View style={styles.viewfinder}>
                    <ScanLine color={theme.colors.accent} />
                    <Pulse to={1.06} ms={1500}>
                      <ScanFace size={64} strokeWidth={1.2} color={theme.colors.textPrimary} />
                    </Pulse>
                  </View>
                </ScanFrame>
                <Text style={styles.title}>Prove it&apos;s really you</Text>
                <Text style={styles.sub}>A 20-second guided scan. We&apos;ll ask for a few small movements on camera.</Text>
              </View>

              <ListGroup>
                {POINTS.map(({ icon, title }, i) => (
                  <ListRow
                    key={title}
                    leading={<RowGlyph icon={icon} tone={i === 1 ? 'warning' : 'brand'} size={36} />}
                    title={title}
                  />
                ))}
              </ListGroup>
            </View>
          </ScrollView>
          <View style={[styles.footer, { paddingBottom: theme.spacing[4] + insets.bottom }]}>
            <CoreButton
              fullWidth
              size="lg"
              accessibilityLabel="Start verification"
              iconLeft={<ScanFace size={20} strokeWidth={2} color={theme.colors.onActionPrimary} />}
              onPress={() => setStarted(true)}>
              Start face scan
            </CoreButton>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Only checked after "Start verification" — without the native camera
  // module (Expo Go) the intro must still render.
  if (!LivenessCamera) return <CameraUnavailable />;

  return (
    <LivenessCamera
      mode="enroll"
      onSuccess={() => router.replace('/(onboarding)/face-enrolled')}
    />
  );
}

/** Static intro screen (kept for reference — the live camera replaces it). */
export function FaceScanIntro() {
  const theme = useThemeTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Sign Up" />
      <View style={{ paddingHorizontal: theme.spacing[4] }}>
        <Progress value={75} accessibilityLabel="Onboarding progress" />
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing[5],
          gap: theme.spacing[4],
        }}>
        <RowIcon
          tone="primary"
          icon={<ScanFace size={iconSize.xl} color={theme.colors.actionPrimary} />}
        />
        <View style={{ alignItems: 'center', gap: theme.spacing[1] }}>
          <Typography variant="h3" center>
            Let&apos;s scan your face
          </Typography>
          <Typography variant="body-sm" color="secondary" center style={{ maxWidth: 280 }}>
            Good lighting · No glasses/mask · Eye-level camera
          </Typography>
        </View>
        <Alert variant="warning" style={{ alignSelf: 'stretch' }}>
          This step is mandatory and cannot be skipped
        </Alert>
      </View>
      <View
        style={{
          padding: theme.spacing[4],
          paddingTop: theme.spacing[3],
          paddingBottom: theme.spacing[4] + insets.bottom,
          borderTopWidth: theme.sizes.fieldBorderWidth,
          borderTopColor: theme.colors.borderSubtle,
          backgroundColor: theme.colors.surface,
        }}>
        <CoreButton
          fullWidth
          size="lg"
          accessibilityLabel="Start face scan"
          onPress={() => router.push('/(onboarding)/face-scan')}>
          Start Face Scan
        </CoreButton>
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((t) => ({
  safe: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: t.spacing[6] },
  introStage: {
    flex: 1,
    justifyContent: 'center',
    gap: t.spacing[8],
    paddingHorizontal: t.sizes.screenGutter,
  },
  hero: { alignItems: 'center', gap: t.spacing[3] },
  viewfinder: {
    width: 176,
    height: 176,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 28,
    letterSpacing: -0.9,
    textAlign: 'center',
    color: t.colors.textPrimary,
    marginTop: t.spacing[4],
  },
  sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: t.colors.textSecondary, paddingHorizontal: t.spacing[4] },
  footer: { paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[3] },
}));
