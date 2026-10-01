import { useRouter } from 'expo-router';
import { Info, ScanFace, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToast } from '@/components/composite/Toast';
import { Button } from '@/components/ui/Button';
import { Aura, HeroGlyph, ListGroup, ListRow, RowGlyph } from '@/components/luxe';
import { FadeUp } from '@/components/ui';
import { useBiometricConsent } from '@/features/auth/mutations';
import { biometricConsentGiven } from '@/features/auth/slice';
import { useLogoutFlow } from '@/features/auth/useLogoutFlow';
import { useAppDispatch } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';

const POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ScanFace,
    title: 'A quick liveness check',
    body: "A short guided scan proves it's really you — photos and masks are rejected.",
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted face template',
    body: 'Truepas stores a mathematical template — never your photo — to verify you at venues.',
  },
  {
    icon: Info,
    title: 'Required to continue',
    body: "Face check-in is how Truepas works, so this step can't be skipped. Withdraw later in Settings.",
  },
];

/** Biometric consent — POST /user/me/biometric-consent { accepted: true }.
 *  Mandatory gate before liveness enrollment: accept → face-scan or sign out.
 *  Layout mirrors UI-design-repo ConsentScreen 1:1. */
export default function ConsentScreen() {
  const styles = useStyles();
  const t = useThemeTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { logout, isPending: signingOut } = useLogoutFlow();
  const biometricConsent = useBiometricConsent();
  const loading = biometricConsent.isPending || signingOut;

  const accept = async () => {
    if (loading) return;
    try {
      await biometricConsent.mutateAsync({ accepted: true });
      dispatch(biometricConsentGiven());
      router.push('/(onboarding)/face-scan');
    } catch (err: any) {
      toast({
        variant: 'error',
        title: "Couldn't save consent",
        description: err?.message ?? 'Check your connection and try again.',
      });
    }
  };

  return (
    <View style={styles.safe}>
      <Aura height={480} />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.body}>
            <View style={styles.hero}>
              <HeroGlyph icon={ScanFace} />
              <FadeUp delay={120}>
                <Text style={styles.title}>Check in with{'\n'}just a glance</Text>
              </FadeUp>
              <FadeUp delay={180}>
                <Text style={styles.sub}>
                  Truepas confirms it&apos;s really you at venues — no phone, no wallet, no queue.
                </Text>
              </FadeUp>
            </View>

            <FadeUp delay={260}>
              <ListGroup>
                {POINTS.map((p, i) => (
                  <ListRow
                    key={p.title}
                    leading={<RowGlyph icon={p.icon} tone={i === 1 ? 'success' : i === 2 ? 'neutral' : 'brand'} size={40} />}
                    title={p.title}
                    subtitle={p.body}
                    subtitleLines={4}
                  />
                ))}
              </ListGroup>
            </FadeUp>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: t.spacing[4] + insets.bottom }]}>
          <Button
            fullWidth
            size="lg"
            loading={biometricConsent.isPending}
            disabled={loading}
            onPress={accept}
            accessibilityLabel="Accept and continue">
            Accept and continue
          </Button>
          <Button
            fullWidth
            variant="ghost"
            disabled={loading}
            onPress={logout}
            accessibilityLabel="Sign out instead">
            Sign out instead
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  safe: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: t.spacing[6] },
  body: { flex: 1, gap: t.spacing[6], paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[2] },
  hero: { alignItems: 'center', gap: t.spacing[3] },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -1.1,
    textAlign: 'center',
    color: t.colors.textPrimary,
  },
  sub: { fontSize: 15.5, lineHeight: 23, textAlign: 'center', color: t.colors.textSecondary, paddingHorizontal: t.spacing[2] },
  footer: { paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[3], gap: t.spacing[1] },
}));
