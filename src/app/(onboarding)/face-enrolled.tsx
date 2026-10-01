import { Redirect, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Aura, HeroGlyph, PassCard } from '@/components/luxe';
import { CoreButton, FadeUp } from '@/components/ui';
import { faceEnrollmentCompleted } from '@/features/auth/slice';
import { flowGuards } from '@/services/flowGuards';
import { useAppDispatch, useAppSelector } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';

/** Face enrolled success (POST /cb/face/enroll) — the enroll call already
 *  completed in LivenessCamera; this confirms and leads into the app.
 *  Deep-linking here is bounced back to face-scan: only a real enrollment
 *  may flip faceEnrolled. */
export default function FaceEnrolledScreen() {
  const theme = useThemeTokens();
  const styles = useStyles();
  const user = useAppSelector((state) => state.auth.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [allowed] = useState(() => flowGuards.has('onboarding:face-enrolled'));

  useEffect(() => {
    if (allowed) flowGuards.consume('onboarding:face-enrolled');
  }, [allowed]);

  if (!allowed) return <Redirect href="/(onboarding)/face-scan" />;

  const handleContinue = () => {
    dispatch(faceEnrollmentCompleted());
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <Aura height={520} tone="success" intensity={0.8} />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <View style={styles.body}>
          <View style={styles.hero}>
            <HeroGlyph icon={Check} tone="success" size={150} />
            <FadeUp delay={120}>
              <Text style={styles.title}>You&apos;re all set</Text>
            </FadeUp>
            <FadeUp delay={180}>
              <Text style={styles.sub}>Your face is enrolled and your Truepas Pass is live. Check in anywhere with a glance.</Text>
            </FadeUp>
          </View>
          <FadeUp delay={280}>
            <PassCard
              name={user?.fullName ?? 'Truepas member'}
              memberId={user?.id ?? '0000'}
              verified
              faceEnrolled
            />
          </FadeUp>
        </View>
        <View style={[styles.footer, { paddingBottom: theme.spacing[4] + insets.bottom }]}>
          <CoreButton fullWidth size="lg" accessibilityLabel="Continue to Truepas" onPress={handleContinue}>
            Continue to Truepas
          </CoreButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  body: { flex: 1, paddingHorizontal: t.sizes.screenGutter, gap: t.spacing[6], justifyContent: 'center' },
  hero: { alignItems: 'center', gap: t.spacing[3] },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 32,
    letterSpacing: -1.1,
    textAlign: 'center',
    color: t.colors.textPrimary,
  },
  sub: { fontSize: 15.5, lineHeight: 23, textAlign: 'center', color: t.colors.textSecondary },
  footer: { paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[3] },
}));
