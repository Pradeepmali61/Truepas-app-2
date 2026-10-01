import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { alpha, makeStyles, useThemeTokens } from "@/theme";
import { PressableScale } from "./PressableScale";
import { venueImage } from "./venueImage";

export interface CheckinHeroProps {
  venue: string;
  location: string;
  /** ISO date or date-only. */
  checkIn: string;
  guests: number;
  checkedIn: number;
  image?: string | null;
  /** Venue type ("Hotel", "Cruise"…) — picks fallback photography. */
  type?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function relativeDay(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(new Date())) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days < 7) return `In ${days} days`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fullDate(iso: string): string {
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Next check-in — an editorial photo card: full-bleed venue image under a
 * midnight scrim, a glass "when" chip, display-weight venue name and a thin
 * gradient progress rail for party members already checked in.
 */
export function CheckinHero({ venue, location, checkIn, guests, checkedIn, image, type, onPress, style }: CheckinHeroProps) {
  const styles = useStyles();
  const t = useThemeTokens();
  const progress = Math.min(1, checkedIn / Math.max(guests, 1));

  return (
    <PressableScale to={0.98} onPress={onPress} accessibilityLabel={`Next check-in at ${venue}, ${location}`} style={style}>
      <View style={styles.card}>
        <Image source={venueImage(image, type)} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={[alpha("#05070c", 0.15), alpha("#05070c", 0.35), alpha("#05070c", 0.94)]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.top}>
          <View style={styles.glassChip}>
            <View style={styles.liveDot} />
            <Text style={styles.glassChipText}>Next check-in</Text>
          </View>
          <View style={styles.glassChip}>
            <Text style={styles.glassChipStrong}>{relativeDay(checkIn)}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.venue} numberOfLines={1}>
            {venue}
          </Text>
          <View style={styles.metaRow}>
            <Meta icon={MapPin} text={location} />
          </View>
          <View style={styles.metaRow}>
            <Meta icon={CalendarDays} text={fullDate(checkIn)} />
            <Meta icon={Users} text={`${guests} ${guests === 1 ? "guest" : "guests"}`} />
          </View>
          <View style={styles.progressRow}>
            <View style={styles.track}>
              <LinearGradient
                colors={[t.brand.b500, t.combo?.accent.b500 ?? t.colors.accent]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.fill, { width: `${Math.max(progress, 0.02) * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              <Text style={styles.progressStrong}>{checkedIn}</Text>/{guests} checked in
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function Meta({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  const styles = useStyles();
  return (
    <View style={styles.meta}>
      <Icon size={13} strokeWidth={2} color={alpha("#ffffff", 0.7)} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    height: 248,
    borderRadius: 26,
    overflow: "hidden",
    padding: t.spacing[4],
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  glassChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: t.radii.full,
    backgroundColor: "rgba(10, 14, 24, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.colors.success },
  glassChipText: { fontSize: 12, fontWeight: t.fontWeight.medium, color: "rgba(255,255,255,0.85)" },
  glassChipStrong: { fontSize: 12, fontWeight: t.fontWeight.semibold, color: "#ffffff" },
  bottom: { gap: 6 },
  venue: { fontFamily: t.fontFamily.display.bold, fontSize: 24, letterSpacing: -0.7, color: "#ffffff" },
  metaRow: { flexDirection: "row", gap: t.spacing[4] },
  meta: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  metaText: { fontSize: 13, color: "rgba(255,255,255,0.75)" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: t.spacing[3], marginTop: 8 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.16)", overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  progressStrong: { fontFamily: t.fontFamily.mono.semibold, color: "#ffffff" },
}));
