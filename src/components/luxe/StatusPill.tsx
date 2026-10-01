import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens } from "@/theme";

type Tone = "success" | "warning" | "error" | "info" | "neutral";

const TONE: Record<string, Tone> = {
  verified: "success",
  approved: "success",
  completed: "success",
  active: "success",
  upcoming: "info",
  pending: "warning",
  pending_document: "warning",
  pending_liveness: "warning",
  review: "warning",
  missing: "neutral",
  incomplete: "warning",
  failed: "error",
  rejected: "error",
  cancelled: "neutral",
  expired: "error",
};

const LABEL: Record<string, string> = {
  verified: "Verified",
  approved: "Approved",
  completed: "Completed",
  active: "Active",
  upcoming: "Upcoming",
  pending: "Pending",
  pending_document: "Document needed",
  pending_liveness: "Liveness needed",
  review: "In review",
  missing: "Not added",
  incomplete: "Incomplete",
  failed: "Failed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
};

/** Quiet status indicator — a glowing dot plus label on a faint tinted
 *  capsule. `onImage` swaps to a dark glass capsule for use over photos. */
export function StatusPill({ status, label, onImage, style }: { status: string; label?: string; onImage?: boolean; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  const t = useThemeTokens();
  const key = status.toLowerCase();
  const tone = TONE[key] ?? "neutral";
  const fg = {
    success: t.colors.success,
    warning: t.colors.warning,
    error: t.colors.error,
    info: t.colors.info,
    neutral: t.colors.textMuted,
  }[tone];
  const bg = {
    success: t.colors.successSubtle,
    warning: t.colors.warningSubtle,
    error: t.colors.errorSubtle,
    info: t.colors.infoSubtle,
    neutral: t.colors.actionSecondary,
  }[tone];
  const text = label ?? LABEL[key] ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  return (
    <View style={[styles.pill, { backgroundColor: onImage ? "rgba(8, 12, 22, 0.6)" : bg }, onImage && styles.onImage, style]}>
      <View style={[styles.dot, { backgroundColor: fg, shadowColor: fg }]} />
      <Text style={[styles.text, { color: onImage ? "#ffffff" : fg }]}>{text}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: t.radii.full,
    alignSelf: "flex-start",
  },
  onImage: { borderWidth: 1, borderColor: "rgba(255,255,255,0.14)" },
  dot: { width: 6, height: 6, borderRadius: 3, shadowOpacity: 0.9, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  text: { fontSize: 12, fontWeight: t.fontWeight.semibold, letterSpacing: 0 },
}));
