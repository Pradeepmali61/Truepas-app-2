/**
 * Check-ins tab — bookings split into Upcoming / Past under a large title,
 * each rendered as a photo BookingTile that drills into booking detail.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { CalendarClock } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AsyncBlock, SkeletonRows } from '@/components/composite';
import { Aura, BookingTile, LargeTitle, ListGroup, ListRow, RowGlyph } from '@/components/luxe';
import { FadeUp, NeuSegmented } from '@/components/ui';
import { useBookings } from '@/features/history/hooks';
import { makeStyles, useThemeTokens } from '@/theme';
import type { Booking } from '@/types/domain';

/** Height of the floating tab bar (see (tabs)/_layout.tsx). */
const TAB_BAR_HEIGHT = 84;

/** History tab — GET /cb/bookings. The check-in event producer isn't connected
 *  yet so an empty list is a valid production state, not an error. */
export default function HistoryScreen() {
  const styles = useStyles();
  const theme = useThemeTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bookingsQuery = useBookings();
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  /* Tabs stay mounted, so switching back would show the cached list. Refetch
     on every re-focus so a check-in completed meanwhile shows up (BUG018);
     the first focus is covered by the query's own mount fetch. */
  const { refetch } = bookingsQuery;
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) void refetch();
      focusedOnce.current = true;
    }, [refetch]),
  );

  const renderCard = (b: Booking, i: number) => (
    <FadeUp key={b.id} delay={Math.min(i, 8) * 60}>
      <BookingTile
        venue={b.venue}
        location={b.location}
        type={b.type}
        image={b.image}
        status={b.status}
        checkIn={b.checkIn}
        checkOut={b.checkOut}
        guests={b.guests}
        amount={b.amount}
        checkedIn={b.checkedInMembers?.length ?? 0}
        onPress={() => router.push(`/booking/${b.id}` as never)}
      />
    </FadeUp>
  );

  const empty = (title: string, subtitle: string) => (
    <ListGroup>
      <ListRow leading={<RowGlyph icon={CalendarClock} tone="neutral" size={40} />} title={title} subtitle={subtitle} />
    </ListGroup>
  );

  return (
    <View style={styles.screen}>
      <Aura height={420} intensity={0.6} />
      <SafeAreaView edges={['top']} style={styles.flex}>
        <LargeTitle eyebrow="Your stays & visits" title="Check-ins" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={bookingsQuery.isRefetching}
              onRefresh={bookingsQuery.refetch}
              tintColor={theme.colors.textSecondary}
              colors={[theme.colors.actionPrimary]}
            />
          }
          contentContainerStyle={[styles.body, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + theme.spacing[6] }]}>
          <AsyncBlock state={bookingsQuery} skeleton={<SkeletonRows />}>
            {(list) => {
              if (list.length === 0) {
                return empty('No bookings yet', 'Your history appears here after your first check-in.');
              }
              const upcomingList = list.filter((b) => b.status === 'upcoming');
              const past = list.filter((b) => b.status !== 'upcoming');
              /* Land on Past when there's nothing upcoming. */
              const effective = view === 'upcoming' && upcomingList.length === 0 ? 'past' : view;
              const shown = effective === 'upcoming' ? upcomingList : past;
              return (
                <View style={styles.list}>
                  <NeuSegmented
                    label="Check-ins"
                    options={[
                      { value: 'upcoming', label: `Upcoming · ${upcomingList.length}` },
                      { value: 'past', label: `Past · ${past.length}` },
                    ]}
                    value={effective}
                    onChange={setView}
                  />
                  {shown.length === 0
                    ? empty(
                        effective === 'upcoming' ? 'No upcoming check-ins' : 'No past check-ins',
                        effective === 'upcoming'
                          ? 'Booked venues show up here before your visit.'
                          : 'History appears here after your first check-in.',
                      )
                    : shown.map(renderCard)}
                </View>
              );
            }}
          </AsyncBlock>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  screen: { flex: 1, backgroundColor: t.colors.background },
  flex: { flex: 1 },
  body: { paddingHorizontal: t.sizes.screenGutter, paddingTop: t.spacing[3], flexGrow: 1 },
  list: { gap: t.spacing[4] },
}));
