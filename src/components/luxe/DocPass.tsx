import { LinearGradient } from "expo-linear-gradient";
import { CarFront, Contact, CreditCard, FileText, Landmark, Plane, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { alpha, makeStyles } from "@/theme";
import { PressableScale } from "./PressableScale";
import { StatusPill } from "./StatusPill";

/** Per-document-type art direction: glyph + a deep two-stop gradient. */
export const DOC_ART: Record<string, { icon: LucideIcon; colors: [string, string]; glow: string }> = {
  passport: { icon: Plane, colors: ["#1d3a9e", "#0b1438"], glow: "#4d8dff" },
  drivingLicense: { icon: CarFront, colors: ["#0f6b78", "#062027"], glow: "#2fd0e0" },
  idCard: { icon: Contact, colors: ["#5135b8", "#160f38"], glow: "#9a7bff" },
  greenCard: { icon: CreditCard, colors: ["#127456", "#06231b"], glow: "#2fd69a" },
  birthCertificate: { icon: FileText, colors: ["#8a5a12", "#2a1a05"], glow: "#f5a524" },
  usVisa: { icon: Landmark, colors: ["#8c2546", "#2a0a15"], glow: "#ff6b8b" },
};
const FALLBACK = { icon: FileText, colors: ["#25304a", "#0d121c"] as [string, string], glow: "#8fa3c8" };

export interface DocPassProps {
  type?: string;
  label: string;
  /** Masked number as returned by the API (e.g. "••••1557"). */
  number: string;
  status: string;
  expiresAt?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function expiry(date?: string | null): string | null {
  if (!date) return null;
  const [y, m] = date.split("T")[0].split("-");
  return y && m ? `Exp ${m}/${y.slice(2)}` : null;
}

/** A document rendered as a wallet pass — tinted by type, glass glyph,
 *  mono masked number, status pill. */
export function DocPass({ type, label, number, status, expiresAt, onPress, style }: DocPassProps) {
  const styles = useStyles();
  const art = DOC_ART[type ?? ""] ?? FALLBACK;
  const Icon = art.icon;
  const exp = expiry(expiresAt);
  const digits = number.replace(/[^0-9a-z]/gi, "").slice(-4);
  return (
    <PressableScale to={0.98} onPress={onPress} accessibilityLabel={`${label}, ${status}`} style={style}>
      <View style={styles.card}>
        <LinearGradient colors={art.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[alpha(art.glow, 0.42), alpha(art.glow, 0.1), alpha(art.glow, 0)]}
          locations={[0, 0.35, 0.7]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.35, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[alpha("#ffffff", 0.1), alpha("#ffffff", 0)]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { bottom: "50%" }]}
        />
        <View style={styles.glyph}>
          <Icon size={20} strokeWidth={1.8} color="#ffffff" />
        </View>
        <View style={styles.body}>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.number} numberOfLines={1}>
              •••• {digits}
            </Text>
            {exp && <Text style={styles.exp}>{exp}</Text>}
          </View>
        </View>
        <StatusPill status={status} onImage style={styles.pill} />
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing[3] + 2,
    paddingHorizontal: t.spacing[4],
    height: 84,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "#0d121c",
  },
  glyph: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  body: { flex: 1, gap: 3 },
  label: { fontFamily: t.fontFamily.display.semibold, fontSize: 16, letterSpacing: -0.3, color: "#ffffff" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: t.spacing[3] },
  exp: { fontSize: 11.5, fontWeight: t.fontWeight.medium, color: "rgba(255,255,255,0.5)" },
  pill: { alignSelf: "center" },
  number: { fontFamily: t.fontFamily.mono.medium, fontSize: 12, letterSpacing: 0.6, color: "rgba(255,255,255,0.65)" },
}));
