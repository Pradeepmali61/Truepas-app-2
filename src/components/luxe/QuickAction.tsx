import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { makeStyles, useThemeTokens } from "@/theme";
import { PressableScale } from "./PressableScale";

/** Square-ish action tile: rimmed glass well with a brand glyph and a short
 *  two-line-max label beneath. Lay out four across in a row. */
export function QuickAction({ icon: Icon, label, onPress, badge }: { icon: LucideIcon; label: string; onPress?: () => void; badge?: boolean }) {
  const styles = useStyles();
  const t = useThemeTokens();
  return (
    <PressableScale to={0.94} onPress={onPress} accessibilityLabel={label} style={styles.cell}>
      <View style={styles.tile}>
        <Icon size={22} strokeWidth={1.8} color={t.colors.textPrimary} />
        {badge && <View style={styles.badge} />}
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  cell: { alignItems: "center", gap: t.spacing[2], width: 74 },
  tile: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.accent,
  },
  label: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: t.fontWeight.medium,
    color: t.colors.textSecondary,
    textAlign: "center",
  },
}));
