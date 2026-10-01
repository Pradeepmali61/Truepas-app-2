/**
 * ProfileScreen — identity hero (gradient-ringed avatar, name, verified
 * pill, contact line) over the grouped ProfileMenu.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingState, ProfileMenu, ScreenHeader } from '@/components/composite';
import { Aura, StatusPill } from '@/components/luxe';
import { Avatar } from '@/components/ui';
import { useProfilePicture } from '@/features/profile/hooks';
import { useAppSelector } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';

export default function ProfileScreen() {
  const styles = useStyles();
  const t = useThemeTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { url: profilePictureUrl } = useProfilePicture();

  if (!user) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
        <ScreenHeader title="Profile" />
        <LoadingState fullPage />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <Aura height={460} />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScreenHeader onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: t.spacing[10] + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          {/* ---------- identity hero ---------- */}
          <View style={styles.hero}>
            <View style={styles.ringWrap}>
              <LinearGradient
                colors={[t.brand.b500, t.combo?.accent.b500 ?? t.colors.accent, t.brand.b700]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ring}
              />
              <View style={styles.ringGap}>
                <Avatar name={user.fullName} uri={profilePictureUrl ?? undefined} size="xxl" />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {user.fullName}
            </Text>
            <StatusPill
              status={user.faceEnrolled ? 'verified' : 'pending'}
              label={user.faceEnrolled ? 'Verified identity' : 'Verification pending'}
              style={styles.pill}
            />
            <Text style={styles.contact} numberOfLines={1}>
              {user.email}
            </Text>
            <Text style={styles.contactMono} numberOfLines={1}>
              {user.phone}
            </Text>
          </View>

          <ProfileMenu />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  body: { paddingHorizontal: t.sizes.screenGutter, gap: t.spacing[6] },
  hero: { alignItems: 'center', gap: 6, paddingBottom: t.spacing[2] },
  ringWrap: { width: 108, height: 108, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing[3] },
  ring: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 54 },
  ringGap: { padding: 3, borderRadius: 52, backgroundColor: t.colors.background },
  name: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: t.colors.textPrimary,
  },
  pill: { alignSelf: 'center', marginTop: 2, marginBottom: 6 },
  contact: { fontSize: 14, color: t.colors.textSecondary },
  contactMono: { fontSize: 13, fontFamily: t.fontFamily.mono.regular, color: t.colors.textMuted },
}));
