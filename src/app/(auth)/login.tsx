import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api';
import { toApiError } from '@/api/errors';
import { TruepasIcon } from '@/components/app/TruepasIcon';
import { Alert, FormField, ScreenHeader, Section } from '@/components/composite';
import { Aura } from '@/components/luxe';
import {
    CoreButton,
    Input,
    Link,
    NeuSegmented,
    Select,
    Typography
} from '@/components/ui';
import { COUNTRIES, DEFAULT_COUNTRY_CODE } from '@/constants/countries';
import { loginSchema } from '@/features/auth/schemas';
import { sessionStarted } from '@/features/auth/slice';
import { useKeyboardScrollPad } from '@/hooks/useKeyboardScrollPad';
import { useAppDispatch } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';

type IdentifierMode = 'email' | 'phone';

/**
 * Login — POST /auth/login { identifier, password } → AuthResponse.
 * sessionStarted stores tokens + user; the index gate then routes to consent
 * automatically when faceEnrolled is false.
 * Ported 1:1 from UI-design-repo src/app/screens/auth/LoginScreen.tsx — the
 * phone-number normalization, session-expired banner and 429 Retry-After
 * messaging are our real backend contract, kept on top.
 */
export default function LoginScreen() {
  const styles = useStyles();
  const t = useThemeTokens();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const kbd = useKeyboardScrollPad();
  // Set by the session-expired handler in _layout — explains why the user
  // landed here instead of silently dropping them on a bare login form.
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const [mode, setMode] = useState<IdentifierMode>('email');
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    const parsed = loginSchema.safeParse({ identifier, password });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setIdentifierError(fields.identifier?.[0]);
      setPasswordError(fields.password?.[0]);
      return;
    }
    setLoading(true);
    setFormError(null);
    try {
      let value = identifier.trim();
      if (mode === 'phone') {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
          setIdentifierError('Enter a valid mobile number');
          return;
        }
        const cc = countryCode.slice(1);
        // A bare national number is ≤10 digits — always prepend the country
        // code. Only treat it as already-international when it's longer AND
        // starts with the cc digits (a 10-digit number can itself start with
        // '91', e.g. 9198765432, and must still get the +91 prefix).
        value = digits.startsWith(cc) && digits.length > 10 ? `+${digits}` : `${countryCode}${digits}`;
      }

      const { user, accessToken, refreshToken } = await api.login({
        identifier: value,
        password,
      });

      if (!accessToken || !refreshToken) {
        setFormError(
          'Login incomplete — tokens missing. Please finish registration or contact support.',
        );
        return;
      }

      dispatch(sessionStarted({ user, accessToken, refreshToken }));
    } catch (error) {
      const apiErr = toApiError(error);
      // Surface the server's Retry-After on 429/lockout so the user knows
      // when the next attempt will work instead of hammering the button.
      setFormError(
        apiErr.retryAfterSeconds
          ? `${apiErr.message} Try again in ${apiErr.retryAfterSeconds}s.`
          : apiErr.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Aura height={420} intensity={0.8} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScreenHeader onBack={() => router.back()} />
        <ScrollView
          {...kbd.scrollProps}
          contentContainerStyle={{
            paddingHorizontal: t.sizes.screenGutter,
            paddingTop: t.spacing[2],
            gap: t.spacing[6],
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <View style={styles.brandIcon}>
              <TruepasIcon size={20} color="#ffffff" />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to your Truepas pass with your email or phone.</Text>
          </View>

          {reason === 'session-expired' ? (
            <Alert variant="warning" title="Session expired">
              For your security, you were signed out. Please sign in again to continue.
            </Alert>
          ) : null}

          <Section>
            <NeuSegmented
              label="Sign in method"
              options={[
                { value: 'email', label: 'Email', icon: Mail },
                { value: 'phone', label: 'Phone', icon: Phone },
              ]}
              value={mode}
              onChange={(m) => {
                setMode(m);
                setIdentifier('');
                setIdentifierError(undefined);
                setFormError(null);
              }}
            />
            <FormField
              label={mode === 'email' ? 'Email' : 'Phone number'}
              // Flush the label's left edge with the control's left edge.
              labelInset={0}
              error={identifierError}>
              {mode === 'email' ? (
                <Input
                  placeholder="ada@example.com"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  value={identifier}
                  onChangeText={(v) => {
                    setIdentifier(v);
                    setIdentifierError(undefined);
                    setFormError(null);
                  }}
                  containerStyle={styles.labelledControl}
                  iconLeft={<Mail size={t.iconSize.md} color={t.colors.textMuted} />}
                />
              ) : (
                <View style={styles.phoneRow}>
                  <Select
                    options={COUNTRIES.map((c) => ({
                      value: c.code,
                      label: `${c.flag} ${c.name} (${c.code})`,
                      fieldLabel: `${c.flag} ${c.code}`,
                    }))}
                    value={countryCode}
                    onValueChange={setCountryCode}
                    accessibilityLabel="Country code"
                    style={styles.ccSelect}
                  />
                  <Input
                    placeholder="98765 43210"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    value={identifier}
                    onChangeText={(v) => {
                      setIdentifier(v);
                      setIdentifierError(undefined);
                      setFormError(null);
                    }}
                    state={identifierError ? 'error' : 'default'}
                    containerStyle={styles.phoneInput}
                    iconLeft={<Phone size={t.iconSize.md} color={t.colors.textMuted} />}
                  />
                </View>
              )}
            </FormField>
            <FormField label="Password" labelInset={0} error={passwordError}>
              <Input
                placeholder="••••••••••"
                secureTextEntry
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setPasswordError(undefined);
                  setFormError(null);
                }}
                containerStyle={styles.labelledControl}
                iconLeft={<Lock size={t.iconSize.md} color={t.colors.textMuted} />}
              />
            </FormField>

            {formError && (
              <Typography variant="caption" color="error" center>
                {formError}
              </Typography>
            )}

            <View style={styles.helperRow}>
              <Link onPress={() => router.push('/(auth)/forgot-password' as never)}>
                Forgot password?
              </Link>
            </View>
          </Section>
        </ScrollView>

        <View
          {...kbd.footerProps}
          style={{
            paddingHorizontal: t.sizes.screenGutter,
            paddingTop: t.spacing[6],
            paddingBottom: t.spacing[4] + insets.bottom,
            gap: t.spacing[2],
          }}>
          <CoreButton
            fullWidth
            size="lg"
            loading={loading}
            disabled={!identifier.trim() || !password}
            onPress={() => void submit()}>
            Sign in
          </CoreButton>
          <Typography variant="body-sm" color="muted" center>
            New to Truepas?{' '}
            <Link onPress={() => router.push('/(auth)/register')}>Create account</Link>
          </Typography>
        </View>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  heading: { gap: t.spacing[2], paddingTop: t.spacing[2] },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.actionPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: t.colors.actionPrimary,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    marginBottom: t.spacing[3],
  },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: t.colors.textPrimary,
  },
  sub: { fontSize: 15.5, lineHeight: 23, color: t.colors.textSecondary },
  phoneRow: { flexDirection: 'row', gap: t.spacing[2] },
  labelledControl: {},
  ccSelect: { width: 118 },
  phoneInput: { flex: 1 },
  helperRow: { flexDirection: 'row', justifyContent: 'flex-end' },
}));
