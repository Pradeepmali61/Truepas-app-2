/** @jsxImportSource react */
/**
 * HomeScreen — Midnight Luxe dashboard. Ambient aura, personal greeting,
 * the Truepas Pass identity card, quick actions, an editorial next-check-in
 * card, the family strip and a grouped list of recent check-ins.
 *
 * Data comes from the real hooks (identity / documents / family / bookings /
 * notifications); every block degrades to a skeleton or empty state.
 */
import { useRouter } from 'expo-router';
import { Bell, CalendarCheck, FileScan, Hotel, Plus, ShieldCheck, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsyncBlock, ProfileDrawer } from '@/components/composite';
import {
    Aura,
    CheckinHero,
    ListGroup,
    ListRow,
    PassCard,
    PressableScale,
    QuickAction,
    RowGlyph,
    SectionHeader,
    venueImage,
} from '@/components/luxe';
import { UseCaseCarousel } from '@/components/truepas';
import { Avatar, FadeUp, Skeleton, SoftIconButton } from '@/components/ui';
import { useDocuments } from '@/features/documents/hooks';
import { useFamily } from '@/features/family/hooks';
import { useBookings } from '@/features/history/hooks';
import { useIdentitySummary } from '@/features/identity/hooks';
import { useNotifications } from '@/features/notifications/hooks';
import { useProfilePicture } from '@/features/profile/hooks';
import { useAppSelector } from '@/store';
import { makeStyles, useThemeTokens } from '@/theme';

/** Height of the floating tab bar (see (tabs)/_layout.tsx). */
const TAB_BAR_HEIGHT = 84;

function greeting(): string {
    const h = new Date().getHours();
    if (h < 5) return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function shortDate(iso: string): string {
    return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function HomeScreen() {
    const styles = useStyles();
    const t = useThemeTokens();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    const { url: avatarUri } = useProfilePicture();
    const [drawer, setDrawer] = useState(false);

    const family = useFamily();
    const bookings = useBookings();
    const unread = useNotifications(true);
    const identity = useIdentitySummary();
    const documents = useDocuments();

    const hasUnread = (unread.data?.pages.flat() ?? []).length > 0;
    const past = bookings.data?.filter((b) => b.status !== 'upcoming') ?? [];
    const upcoming = bookings.data?.filter((b) => b.status === 'upcoming') ?? [];
    const nextUpcoming = [...upcoming].sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
    const verifiedDocs = documents.data?.filter((d) => d.status === 'verified').length;
    const verified = identity.data ? identity.data.status === 'verified' : !!user?.faceEnrolled;
    const firstName = user?.fullName?.split(' ')[0] ?? 'there';

    const refreshing =
        family.isRefetching || bookings.isRefetching || unread.isRefetching || identity.isRefetching;
    const onRefresh = () => {
        void family.refetch();
        void bookings.refetch();
        void unread.refetch();
        void identity.refetch();
        void documents.refetch();
    };

    const go = (path: string) => router.push(path as never);
    const scrollBottom = TAB_BAR_HEIGHT + insets.bottom + t.spacing[6];

    return (
        <View style={styles.screen}>
            <Aura height={560} />
            <SafeAreaView edges={['top']} style={styles.flex}>
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[styles.body, { paddingBottom: scrollBottom }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.textSecondary} />
                    }>
                    {/* ---------- header: avatar + greeting + bell ---------- */}
                    <View style={styles.header}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Open profile"
                            onPress={() => setDrawer(true)}
                            style={styles.who}>
                            <View style={styles.avatarRing}>
                                <Avatar name={user?.fullName} uri={avatarUri ?? undefined} size="md" />
                            </View>
                            <View style={styles.whoText}>
                                <Text style={styles.hello}>{greeting()}</Text>
                                <Text style={styles.name} numberOfLines={1}>
                                    {firstName}
                                </Text>
                            </View>
                        </Pressable>
                        <View>
                            <SoftIconButton icon={Bell} accessibilityLabel="Notifications" onPress={() => go('/notification')} />
                            {hasUnread && <View pointerEvents="none" style={styles.unreadDot} />}
                        </View>
                    </View>

                    {/* ---------- Truepas Pass ---------- */}
                    <FadeUp>
                        <PassCard
                            name={user?.fullName ?? 'Truepas member'}
                            memberId={user?.id ?? '0000'}
                            verified={verified}
                            faceEnrolled={!!user?.faceEnrolled}
                            documents={verifiedDocs}
                            family={family.data?.length}
                            onPress={() => go('/identity')}
                        />
                    </FadeUp>

                    {/* ---------- quick actions ---------- */}
                    <FadeUp delay={60}>
                        <View style={styles.actions}>
                            <QuickAction icon={FileScan} label="Scan ID" onPress={() => go('/document/select-type')} />
                            <QuickAction icon={UserPlus} label="Add family" onPress={() => go('/family/add')} />
                            <QuickAction icon={CalendarCheck} label="Check-ins" onPress={() => go('/(tabs)/history')} />
                            <QuickAction icon={ShieldCheck} label="Security" onPress={() => go('/security')} />
                        </View>
                    </FadeUp>

                    {/* ---------- next check-in ---------- */}
                    {nextUpcoming != null && (
                        <FadeUp delay={110}>
                            <View style={styles.section}>
                                <SectionHeader title="Up next" />
                                <CheckinHero
                                    venue={nextUpcoming.venue}
                                    location={nextUpcoming.location}
                                    checkIn={nextUpcoming.checkIn}
                                    guests={nextUpcoming.guests}
                                    checkedIn={nextUpcoming.checkedInMembers?.length ?? 0}
                                    image={nextUpcoming.image}
                                    type={nextUpcoming.type}
                                    onPress={() => go(`/booking/${nextUpcoming.id}`)}
                                />
                            </View>
                        </FadeUp>
                    )}

                    {/* ---------- family ---------- */}
                    <FadeUp delay={150}>
                        <View style={styles.section}>
                            <SectionHeader
                                title="Family"
                                meta={family.data ? String(family.data.length + 1) : undefined}
                                actionLabel="Manage"
                                onAction={() => go('/family')}
                            />
                            <AsyncBlock
                                state={{
                                    data: family.data,
                                    isPending: family.isPending,
                                    isError: family.isError,
                                    error: family.error,
                                    refetch: () => void family.refetch(),
                                }}
                                skeleton={
                                    <View style={styles.strip}>
                                        {[0, 1, 2, 3].map((i) => (
                                            <View key={i} style={styles.stripCell}>
                                                <Skeleton variant="circle" width={60} height={60} />
                                                <Skeleton variant="text" width={40} />
                                            </View>
                                        ))}
                                    </View>
                                }>
                                {(members) => (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.stripScroller}
                                        contentContainerStyle={styles.strip}>
                                        <PressableScale
                                            to={0.94}
                                            accessibilityLabel="You"
                                            onPress={() => setDrawer(true)}
                                            style={styles.stripCell}>
                                            <MemberAvatar name={user?.fullName} uri={avatarUri ?? undefined} ok={!!user?.faceEnrolled} />
                                            <Text style={styles.stripName}>You</Text>
                                        </PressableScale>
                                        {members.map((m) => (
                                            <PressableScale
                                                key={m.id}
                                                to={0.94}
                                                accessibilityLabel={m.name}
                                                onPress={() => go(`/family/${m.id}`)}
                                                style={styles.stripCell}>
                                                <MemberAvatar name={m.name} ok={m.faceEnrolled} />
                                                <Text style={styles.stripName} numberOfLines={1}>
                                                    {m.name.split(' ')[0]}
                                                </Text>
                                            </PressableScale>
                                        ))}
                                        <PressableScale
                                            to={0.94}
                                            accessibilityLabel="Add family member"
                                            onPress={() => go('/family/add')}
                                            style={styles.stripCell}>
                                            <View style={styles.stripAdd}>
                                                <Plus size={22} strokeWidth={1.8} color={t.colors.textSecondary} />
                                            </View>
                                            <Text style={styles.stripName}>Add</Text>
                                        </PressableScale>
                                    </ScrollView>
                                )}
                            </AsyncBlock>
                        </View>
                    </FadeUp>

                    {/* ---------- recent check-ins ---------- */}
                    <FadeUp delay={190}>
                        <View style={styles.section}>
                            <SectionHeader title="Recent check-ins" actionLabel="See all" onAction={() => go('/(tabs)/history')} />
                            <AsyncBlock
                                state={{
                                    data: bookings.data,
                                    isPending: bookings.isPending,
                                    isError: bookings.isError,
                                    error: bookings.error,
                                    refetch: () => void bookings.refetch(),
                                }}
                                skeleton={<Skeleton variant="rect" height={140} />}>
                                {() =>
                                    past.length === 0 ? (
                                        <ListGroup>
                                            <ListRow
                                                leading={<RowGlyph icon={Hotel} tone="neutral" size={40} />}
                                                title="No check-ins yet"
                                                subtitle="Check in at a partner venue with a glance — it shows up here."
                                            />
                                        </ListGroup>
                                    ) : (
                                        <ListGroup>
                                            {past.slice(0, 3).map((b) => (
                                                <ListRow
                                                    key={b.id}
                                                    leading={<Image source={venueImage(b.image, b.type)} style={styles.thumb} />}
                                                    title={b.venue}
                                                    subtitle={`${shortDate(b.checkIn)} · ${b.location}`}
                                                    trailing={
                                                        <Text style={[styles.status, b.status === 'failed' && styles.statusFailed]}>
                                                            {b.status === 'failed' ? 'Failed' : 'Done'}
                                                        </Text>
                                                    }
                                                    onPress={() => go(`/booking/${b.id}`)}
                                                />
                                            ))}
                                        </ListGroup>
                                    )
                                }
                            </AsyncBlock>
                        </View>
                    </FadeUp>

                    {/* ---------- where it works ---------- */}
                    <FadeUp delay={230}>
                        <View style={styles.section}>
                            <SectionHeader title="Where Truepas works" />
                            <UseCaseCarousel />
                        </View>
                    </FadeUp>
                </ScrollView>
            </SafeAreaView>

            <ProfileDrawer visible={drawer} onClose={() => setDrawer(false)} />
        </View>
    );
}

/** Avatar inside a status ring — mint when the face is enrolled, amber when not. */
function MemberAvatar({ name, uri, ok }: { name?: string; uri?: string; ok: boolean }) {
    const styles = useStyles();
    const t = useThemeTokens();
    return (
        <View style={[styles.memberRing, { borderColor: ok ? t.colors.success : t.colors.warning }]}>
            <Avatar name={name} uri={uri} size="lg" tinted />
        </View>
    );
}

const useStyles = makeStyles((t) => ({
    screen: { flex: 1, backgroundColor: t.colors.background },
    flex: { flex: 1 },
    body: {
        paddingHorizontal: t.sizes.screenGutter,
        paddingTop: t.spacing[3],
        gap: t.spacing[8],
    },
    section: { gap: t.spacing[3] + 2 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: -t.spacing[3],
    },
    who: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3], flexShrink: 1 },
    avatarRing: {
        padding: 2,
        borderRadius: t.radii.full,
        borderWidth: 1,
        borderColor: t.colors.borderStrong,
    },
    whoText: { gap: 1, flexShrink: 1 },
    hello: { fontSize: 13, color: t.colors.textMuted, fontWeight: t.fontWeight.medium },
    name: {
        fontFamily: t.fontFamily.display.bold,
        fontSize: 22,
        letterSpacing: -0.6,
        color: t.colors.textPrimary,
    },
    unreadDot: {
        position: 'absolute',
        top: 9,
        right: 10,
        width: 9,
        height: 9,
        borderRadius: t.radii.full,
        backgroundColor: t.colors.accent,
        borderWidth: 2,
        borderColor: t.colors.surfaceRaised,
    },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -t.spacing[2] },
    stripScroller: { marginHorizontal: -t.sizes.screenGutter },
    strip: { flexDirection: 'row', gap: t.spacing[4], paddingHorizontal: t.sizes.screenGutter },
    stripCell: { alignItems: 'center', gap: t.spacing[2], width: 64 },
    stripName: { fontSize: 12.5, fontWeight: t.fontWeight.medium, color: t.colors.textSecondary },
    memberRing: { padding: 2.5, borderRadius: t.radii.full, borderWidth: 1.5 },
    stripAdd: {
        width: 61,
        height: 61,
        borderRadius: t.radii.full,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: t.colors.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors.surface,
    },
    thumb: { width: 44, height: 44, borderRadius: 12 },
    status: { fontSize: 12.5, fontWeight: t.fontWeight.semibold, color: t.colors.success },
    statusFailed: { color: t.colors.error },
}));
