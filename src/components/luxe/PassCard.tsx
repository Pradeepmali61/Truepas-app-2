import { LinearGradient } from "expo-linear-gradient";
import { ScanFace, ShieldAlert, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { TruepasIcon } from "@/components/app/TruepasIcon";
import { alpha, makeStyles } from "@/theme";
import { PressableScale } from "./PressableScale";

export interface PassCardProps {
  name: string;
  /** Any stable id — the last 4 characters render as the member number. */
  memberId: string;
  verified: boolean;
  faceEnrolled: boolean;
  /** Number of verified documents on file. */
  documents?: number;
  /** Family members covered by this pass. */
  family?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const INK = "#ffffff";

/**
 * The Truepas Pass — the member's identity rendered as a premium card:
 * deep cobalt → midnight metal, a guilloche ring field, cyan light leak,
 * glass sheen, verified seal and mono member number.
 */
export function PassCard({ name, memberId, verified, faceEnrolled, documents, family, onPress, style }: PassCardProps) {
  const styles = useStyles();
  const tail = memberId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase().padStart(4, "0");
  const Seal = verified ? ShieldCheck : ShieldAlert;

  return (
    <PressableScale
      to={0.98}
      onPress={onPress}
      accessibilityLabel={`Truepas Pass for ${name}, ${verified ? "verified" : "verification incomplete"}`}
      style={[styles.shadow, style]}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={["#2a5bff", "#1638a8", "#0b1640", "#070b1c"]}
          locations={[0, 0.32, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* light leak + guilloche rings */}
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          <Defs>
            <RadialGradient id="leak" cx="100%" cy="0%" rx="70%" ry="80%" fx="100%" fy="0%">
              <Stop offset="0" stopColor="#3fd0ff" stopOpacity={0.55} />
              <Stop offset="0.55" stopColor="#3fd0ff" stopOpacity={0.08} />
              <Stop offset="1" stopColor="#3fd0ff" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#leak)" />
          {Array.from({ length: 14 }, (_, i) => (
            <Circle
              key={i}
              cx="88%"
              cy="112%"
              r={40 + i * 16}
              stroke={INK}
              strokeOpacity={0.05 + (i % 3 === 0 ? 0.03 : 0)}
              strokeWidth={1}
              fill="none"
            />
          ))}
        </Svg>
        <LinearGradient
          pointerEvents="none"
          colors={[alpha(INK, 0.16), alpha(INK, 0)]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { bottom: "55%" }]}
        />

        <View style={styles.top}>
          <View style={styles.brand}>
            <TruepasIcon size={15} color={INK} />
            <Text style={styles.brandText}>TRUEPAS PASS</Text>
          </View>
          <View style={[styles.seal, !verified && styles.sealPending]}>
            <Seal size={13} strokeWidth={2.2} color={verified ? "#7ff0c4" : "#ffd77a"} />
            <Text style={[styles.sealText, !verified && styles.sealTextPending]}>{verified ? "Verified" : "Incomplete"}</Text>
          </View>
        </View>

        <View style={styles.chip}>
          <ScanFace size={20} strokeWidth={1.6} color={alpha(INK, 0.9)} />
        </View>

        <View style={styles.bottom}>
          <View style={styles.nameBlock}>
            <Text style={styles.caption}>Member</Text>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.number} numberOfLines={1}>
              TP •••• {tail}
            </Text>
          </View>
          <View style={styles.stats}>
            <Stat label="Face" value={faceEnrolled ? "On" : "Off"} />
            {documents != null && <Stat label="Docs" value={String(documents)} />}
            {family != null && <Stat label="Family" value={String(family)} />}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  shadow: {
    borderRadius: 26,
    shadowColor: "#1d4dff",
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  card: {
    borderRadius: 26,
    overflow: "hidden",
    padding: t.spacing[5],
    aspectRatio: 1.62,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: alpha(INK, 0.14),
    backgroundColor: "#0b1640",
  },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: t.spacing[2] },
  brandText: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 11.5,
    letterSpacing: 2.4,
    color: alpha(INK, 0.92),
  },
  seal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: t.radii.full,
    backgroundColor: "rgba(47, 214, 154, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(127, 240, 196, 0.28)",
  },
  sealPending: { backgroundColor: "rgba(245, 165, 36, 0.16)", borderColor: "rgba(255, 215, 122, 0.3)" },
  sealText: { fontSize: 12, fontWeight: t.fontWeight.semibold, color: "#b4f7dc" },
  sealTextPending: { color: "#ffe2a0" },
  chip: {
    width: 44,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: alpha(INK, 0.1),
    borderWidth: 1,
    borderColor: alpha(INK, 0.18),
  },
  bottom: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: t.spacing[3] },
  nameBlock: { flex: 1, gap: 2 },
  caption: {
    fontSize: 10,
    fontWeight: t.fontWeight.semibold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: alpha(INK, 0.55),
  },
  name: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 21,
    letterSpacing: -0.5,
    color: INK,
  },
  number: {
    fontFamily: t.fontFamily.mono.medium,
    fontSize: 12.5,
    letterSpacing: 1,
    color: alpha(INK, 0.72),
    marginTop: 2,
  },
  stats: { flexDirection: "row", gap: t.spacing[4] },
  stat: { alignItems: "flex-end", gap: 2 },
  statValue: { fontSize: 13, fontWeight: t.fontWeight.semibold, color: INK },
}));
