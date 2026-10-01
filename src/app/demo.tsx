/**
 * Demo Tour — the front door of the stakeholder design preview. Two hero
 * shortcuts (start from Welcome / jump into the app) and every screen of the
 * product, grouped by journey. Each entry forges the session the screen
 * expects and runs on mock data, so any screen opens directly.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, House, Sparkles } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TruepasIcon } from '@/components/app/TruepasIcon';
import { Aura, ListGroup, ListRow, PressableScale, RowGlyph } from '@/components/luxe';
import { FadeUp } from '@/components/ui';
import { applyDemoSession, DEMO_GROUPS, type DemoScreen } from '@/features/demo/catalog';
import { useAppDispatch } from '@/store';
import { alpha, makeStyles, useThemeTokens } from '@/theme';

export default function DemoTourScreen() {
  const styles = useStyles();
  const t = useThemeTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const open = (s: DemoScreen) => {
    applyDemoSession(dispatch, s.session);
    s.prepare?.(dispatch);
    router.push(s.route as never);
  };

  const total = DEMO_GROUPS.reduce((n, g) => n + g.screens.length, 0);

  return (
    <View style={styles.screen}>
      <Aura height={520} />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + t.spacing[10] }]}
          showsVerticalScrollIndicator={false}>
          {/* ---------- intro ---------- */}
          <FadeUp>
            <View style={styles.intro}>
              <View style={styles.brandRow}>
                <View style={styles.brandIcon}>
                  <TruepasIcon size={16} color="#ffffff" />
                </View>
                <Text style={styles.brand}>Truepas</Text>
                <View style={styles.badge}>
                  <Sparkles size={12} strokeWidth={2.2} color={t.colors.onBrandSubtle} />
                  <Text style={styles.badgeText}>Design preview</Text>
                </View>
              </View>
              <Text style={styles.title}>Take the tour</Text>
              <Text style={styles.sub}>
                Every screen of the new Truepas app — {total} in all. Tap any screen to open it; everything runs on sample data.
              </Text>
            </View>
          </FadeUp>

          {/* ---------- shortcuts ---------- */}
          <FadeUp delay={80}>
            <View style={styles.shortcuts}>
              <PressableScale style={styles.shortcutWrap} onPress={() => open(DEMO_GROUPS[1].screens[0])} accessibilityLabel="Start from the beginning">
                <View style={styles.shortcut}>
                  <LinearGradient
                    colors={[t.brand.b600, t.combo?.accent.b600 ?? t.colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Sparkles size={22} strokeWidth={1.8} color="#ffffff" />
                  <View>
                    <Text style={styles.shortcutTitle}>Start fresh</Text>
                    <Text style={styles.shortcutSub}>From the welcome screen</Text>
                  </View>
                  <ArrowRight size={18} color="#ffffff" style={styles.shortcutArrow} />
                </View>
              </PressableScale>
              <PressableScale style={styles.shortcutWrap} onPress={() => open(DEMO_GROUPS[0].screens[0])} accessibilityLabel="Jump into the app">
                <View style={[styles.shortcut, styles.shortcutAlt]}>
                  <House size={22} strokeWidth={1.8} color={t.colors.textPrimary} />
                  <View>
                    <Text style={[styles.shortcutTitle, styles.shortcutTitleAlt]}>Open the app</Text>
                    <Text style={[styles.shortcutSub, styles.shortcutSubAlt]}>Signed in as Sarah</Text>
                  </View>
                  <ArrowRight size={18} color={t.colors.textSecondary} style={styles.shortcutArrow} />
                </View>
              </PressableScale>
            </View>
          </FadeUp>

          {/* ---------- every screen, by journey ---------- */}
          {DEMO_GROUPS.map((g, gi) => (
            <FadeUp key={g.title} delay={120 + gi * 40}>
              <View style={styles.group}>
                <View style={styles.groupHead}>
                  <RowGlyph icon={g.icon} size={34} />
                  <View style={styles.flex}>
                    <Text style={styles.groupTitle}>{g.title}</Text>
                    <Text style={styles.groupBlurb}>{g.blurb}</Text>
                  </View>
                  <Text style={styles.groupCount}>{g.screens.length}</Text>
                </View>
                <ListGroup>
                  {g.screens.map((s, i) => (
                    <ListRow
                      key={s.route + s.title}
                      leading={<Text style={styles.index}>{String(i + 1).padStart(2, '0')}</Text>}
                      title={s.title}
                      onPress={() => open(s)}
                    />
                  ))}
                </ListGroup>
              </View>
            </FadeUp>
          ))}

          <Text style={styles.footer}>Sample data only · no real accounts or payments</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  body: { paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[4], gap: t.spacing[8] },
  intro: { gap: t.spacing[3] },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.actionPrimary,
  },
  brand: { fontFamily: t.fontFamily.display.bold, fontSize: 17, letterSpacing: -0.4, color: t.colors.textPrimary },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: t.radii.full,
    backgroundColor: t.colors.brandSubtle,
  },
  badgeText: { fontSize: 12, fontWeight: t.fontWeight.semibold, color: t.colors.onBrandSubtle },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 38,
    lineHeight: 43,
    letterSpacing: -1.5,
    color: t.colors.textPrimary,
    marginTop: t.spacing[4],
  },
  sub: { fontSize: 15.5, lineHeight: 23, color: t.colors.textSecondary },
  shortcuts: { flexDirection: 'row', gap: t.spacing[3] },
  shortcutWrap: { flex: 1 },
  shortcut: {
    height: 150,
    borderRadius: 24,
    padding: t.spacing[4],
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: alpha('#ffffff', 0.16),
  },
  shortcutAlt: { backgroundColor: t.colors.surfaceRaised, borderColor: t.colors.border },
  shortcutTitle: { fontFamily: t.fontFamily.display.bold, fontSize: 18, letterSpacing: -0.4, color: '#ffffff' },
  shortcutTitleAlt: { color: t.colors.textPrimary },
  shortcutSub: { fontSize: 12.5, color: alpha('#ffffff', 0.8), marginTop: 2 },
  shortcutSubAlt: { color: t.colors.textMuted },
  shortcutArrow: { position: 'absolute', top: t.spacing[4], right: t.spacing[4] },
  group: { gap: t.spacing[3] },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3] },
  groupTitle: { fontFamily: t.fontFamily.display.semibold, fontSize: 17, letterSpacing: -0.35, color: t.colors.textPrimary },
  groupBlurb: { fontSize: 12.5, color: t.colors.textMuted, marginTop: 1 },
  groupCount: { fontFamily: t.fontFamily.mono.medium, fontSize: 13, color: t.colors.textMuted },
  index: { width: 24, fontFamily: t.fontFamily.mono.medium, fontSize: 13, color: t.colors.textMuted },
  footer: { textAlign: 'center', fontSize: 12, color: t.colors.textMuted },
}));
