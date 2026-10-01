import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { alpha, makeStyles, useThemeTokens } from "@/theme";
import { PressableScale } from "./PressableScale";
import { StatusPill } from "./StatusPill";
import { venueImage } from "./venueImage";

export interface BookingTileProps {
  venue: string;
  location: string;
  type?: string;
  image?: string | null;
  status: string;
  checkIn: string;
  checkOut?: string;
  guests: number;
  amount: number;
  checkedIn: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function day(iso: string) {
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function money(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/** Booking card — photo header with status, venue + meta body, and a
 *  party check-in rail for upcoming stays. */
export function BookingTile({ venue, location, type, image, status, checkIn, checkOut, guests, amount, checkedIn, onPress, style }: BookingTileProps) {
  const styles = useStyles();
  const t = useThemeTokens();
  const upcoming = status === "upcoming";
  const progress = Math.min(1, checkedIn / Math.max(guests, 1));
  return (
    <PressableScale to={0.98} onPress={onPress} accessibilityLabel={`${venue}, ${location}`} style={style}>
      <View style={styles.card}>
        <View style={styles.photo}>
          <Image source={venueImage(image, type)} style={styles.image} resizeMode="cover" />
          <LinearGradient
            colors={[alpha("#05070c", 0.25), alpha("#05070c", 0), alpha(t.colors.surface, 1)]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.photoTop}>
            {type ? (
              <View style={styles.typeChip}>
                <Text style={styles.typeText}>{type}</Text>
              </View>
            ) : (
              <View />
            )}
            <StatusPill status={status} onImage />
          </View>
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.venue} numberOfLines={1}>
              {venue}
            </Text>
            <Text style={styles.amount}>{money(amount)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Meta icon={MapPin} text={location} />
          </View>
          <View style={styles.metaRow}>
            <Meta icon={CalendarDays} text={checkOut ? `${day(checkIn)} – ${day(checkOut)}` : day(checkIn)} />
            <Meta icon={Users} text={`${guests} ${guests === 1 ? "guest" : "guests"}`} />
          </View>
          {upcoming && (
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
                {checkedIn}/{guests} checked in
              </Text>
            </View>
          )}
        </View>
      </View>
    </PressableScale>
  );
}

function Meta({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  const styles = useStyles();
  const t = useThemeTokens();
  return (
    <View style={styles.meta}>
      <Icon size={13} strokeWidth={2} color={t.colors.textMuted} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  // Explicit 100% box — on web an absoluteFill Image falls back to the
  // asset's intrinsic 1024px size and shows a zoomed-in corner.
  image: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  // Bundled venue photos are ~1.72:1 — keep the frame close so they aren't over-cropped.
  photo: { aspectRatio: 1.8, padding: t.spacing[3], overflow: "hidden" },
  photoTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: t.radii.full,
    backgroundColor: "rgba(8, 12, 22, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  typeText: { fontSize: 11, fontWeight: t.fontWeight.semibold, letterSpacing: 1, textTransform: "uppercase", color: "#ffffff" },
  body: { paddingHorizontal: t.spacing[4], paddingBottom: t.spacing[4], marginTop: -t.spacing[2], gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: t.spacing[3] },
  venue: { flex: 1, fontFamily: t.fontFamily.display.bold, fontSize: 19, letterSpacing: -0.5, color: t.colors.textPrimary },
  amount: { fontFamily: t.fontFamily.mono.semibold, fontSize: 14, color: t.colors.textPrimary },
  metaRow: { flexDirection: "row", gap: t.spacing[4] },
  meta: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 1 },
  metaText: { fontSize: 13, color: t.colors.textSecondary },
  progressRow: { flexDirection: "row", alignItems: "center", gap: t.spacing[3], marginTop: 6 },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: t.colors.actionSecondaryActive, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 12, color: t.colors.textMuted },
}));
