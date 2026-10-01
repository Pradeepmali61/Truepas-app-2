/**
 * Documents tab — the identity wallet. Large title, an identity-progress
 * card (three checks on a segmented rail), documents as type-tinted wallet
 * passes, and the venue-issued credentials section.
 *
 * Data comes from useIdentitySummary / useDocuments. There is no issued-
 * credentials endpoint yet, so that section renders its empty state.
 */
import { useRouter } from 'expo-router';
import { Check, FileText, Inbox, Plus, ScanFace, UserRoundCheck } from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsyncBlock } from '@/components/composite';
import { Aura, DocPass, LargeTitle, ListGroup, ListRow, RowGlyph, SectionHeader, StatusPill } from '@/components/luxe';
import { FadeUp, NeuBox, Skeleton, SoftIconButton } from '@/components/ui';
import { useDocuments } from '@/features/documents/hooks';
import { useIdentitySummary } from '@/features/identity/hooks';
import { makeStyles, useThemeTokens } from '@/theme';

/** Height of the floating tab bar (see (tabs)/_layout.tsx). */
const TAB_BAR_HEIGHT = 84;

export default function DocumentsScreen() {
    const styles = useStyles();
    const t = useThemeTokens();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const summary = useIdentitySummary();
    const documents = useDocuments();

    const refreshing = summary.isRefetching || documents.isRefetching;
    const onRefresh = () => {
        void summary.refetch();
        void documents.refetch();
    };

    const scrollBottom = TAB_BAR_HEIGHT + insets.bottom + t.spacing[6];
    const addDocument = () => router.push('/document/select-type' as never);

    return (
        <View style={styles.screen}>
            <Aura height={420} intensity={0.6} />
            <SafeAreaView edges={['top']} style={styles.flex}>
                <LargeTitle
                    eyebrow="Your identity wallet"
                    title="Documents"
                    actions={<SoftIconButton icon={Plus} accessibilityLabel="Add document" onPress={addDocument} />}
                />
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={[styles.body, { paddingBottom: scrollBottom }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.colors.textSecondary} />
                    }>
                    {/* ---------- identity progress ---------- */}
                    <AsyncBlock
                        state={{
                            data: summary.data,
                            isPending: summary.isPending,
                            isError: summary.isError,
                            error: summary.error,
                            refetch: () => void summary.refetch(),
                        }}
                        skeleton={<Skeleton variant="rect" height={210} style={styles.skeletonCard} />}>
                        {(s) => {
                            const checks = [
                                { label: 'Face enrollment', hint: 'Live face scan on file', value: s.face, icon: ScanFace },
                                { label: 'Identity document', hint: 'Passport, licence or ID card', value: s.document, icon: FileText },
                                { label: 'Selfie match', hint: 'Face matched to your document', value: s.selfieMatch, icon: UserRoundCheck },
                            ];
                            const done = checks.filter((c) => c.value === 'verified').length;
                            return (
                                <FadeUp>
                                    <NeuBox variant="raised" radius={24} style={styles.card}>
                                        <View style={styles.cardHead}>
                                            <View style={styles.flex}>
                                                <Text style={styles.cardTitle}>Identity status</Text>
                                                <Text style={styles.cardSub}>
                                                    {done === checks.length ? 'Fully verified — you are good to go' : `${done} of ${checks.length} steps complete`}
                                                </Text>
                                            </View>
                                            <StatusPill status={s.status} />
                                        </View>
                                        <View style={styles.rail}>
                                            {checks.map((c) => (
                                                <View
                                                    key={c.label}
                                                    style={[styles.railSeg, c.value === 'verified' && styles.railSegDone]}
                                                />
                                            ))}
                                        </View>
                                        <View style={styles.checks}>
                                            {checks.map((c) => {
                                                const ok = c.value === 'verified';
                                                return (
                                                    <View key={c.label} style={styles.check}>
                                                        <View style={[styles.checkIcon, ok && styles.checkIconDone]}>
                                                            {ok ? (
                                                                <Check size={14} strokeWidth={3} color={t.colors.textInverse} />
                                                            ) : (
                                                                <c.icon size={15} strokeWidth={2} color={t.colors.textMuted} />
                                                            )}
                                                        </View>
                                                        <View style={styles.flex}>
                                                            <Text style={styles.checkLabel}>{c.label}</Text>
                                                            <Text style={styles.checkHint}>{c.hint}</Text>
                                                        </View>
                                                        <StatusPill status={c.value} />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </NeuBox>
                                </FadeUp>
                            );
                        }}
                    </AsyncBlock>

                    {/* ---------- wallet ---------- */}
                    <View style={styles.section}>
                        <SectionHeader
                            title="Your documents"
                            meta={documents.data ? String(documents.data.length) : undefined}
                            actionLabel="Add"
                            onAction={addDocument}
                        />
                        <AsyncBlock
                            state={{
                                data: documents.data,
                                isPending: documents.isPending,
                                isError: documents.isError,
                                error: documents.error,
                                refetch: () => void documents.refetch(),
                            }}
                            skeleton={
                                <View style={styles.wallet}>
                                    {[0, 1, 2].map((i) => (
                                        <Skeleton key={i} variant="rect" height={84} style={styles.skeletonPass} />
                                    ))}
                                </View>
                            }>
                            {(docs) =>
                                docs.length === 0 ? (
                                    <ListGroup>
                                        <ListRow
                                            leading={<RowGlyph icon={FileText} tone="brand" size={40} />}
                                            title="Add your first document"
                                            subtitle="A passport, ID card or licence verifies your identity."
                                            onPress={addDocument}
                                        />
                                    </ListGroup>
                                ) : (
                                    <View style={styles.wallet}>
                                        {docs.map((d, i) => (
                                            <FadeUp key={d.id} delay={Math.min(i, 8) * 50}>
                                                <DocPass
                                                    type={d.type}
                                                    label={d.label}
                                                    number={d.number}
                                                    status={d.status}
                                                    expiresAt={d.expiresAt}
                                                    onPress={() => router.push(`/document/${d.id}` as never)}
                                                />
                                            </FadeUp>
                                        ))}
                                    </View>
                                )
                            }
                        </AsyncBlock>
                    </View>

                    {/* ---------- issued to you ---------- */}
                    <View style={styles.section}>
                        <SectionHeader title="Issued to you" />
                        <ListGroup>
                            <ListRow
                                leading={<RowGlyph icon={Inbox} tone="neutral" size={40} />}
                                title="No issued credentials"
                                subtitle="Passes issued to you at venue check-ins will appear here."
                            />
                        </ListGroup>
                    </View>
                </ScrollView>
            </SafeAreaView>
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
    card: { padding: t.spacing[5], gap: t.spacing[4] },
    cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing[3] },
    cardTitle: {
        fontFamily: t.fontFamily.display.semibold,
        fontSize: 18,
        letterSpacing: -0.4,
        color: t.colors.textPrimary,
    },
    cardSub: { fontSize: 13, color: t.colors.textMuted, marginTop: 2 },
    rail: { flexDirection: 'row', gap: 6 },
    railSeg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: t.colors.actionSecondaryActive },
    railSegDone: { backgroundColor: t.colors.success },
    checks: { gap: t.spacing[3] + 2 },
    check: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[3] },
    checkIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.colors.actionSecondaryActive,
    },
    checkIconDone: { backgroundColor: t.colors.success },
    checkLabel: { fontSize: 15, fontWeight: t.fontWeight.medium, color: t.colors.textPrimary, letterSpacing: -0.15 },
    checkHint: { fontSize: 12.5, color: t.colors.textMuted, marginTop: 1 },
    wallet: { gap: t.spacing[2] + 2 },
    skeletonCard: { borderRadius: 24 },
    skeletonPass: { borderRadius: 22 },
}));
