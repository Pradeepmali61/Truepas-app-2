import type { ReactNode } from "react";
import { Text, View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles } from "@/theme";

/** Left-aligned large title for tab roots — display weight, optional
 *  eyebrow above and trailing actions. */
export function LargeTitle({
  title,
  eyebrow,
  actions,
  style,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.text}>
        {eyebrow != null && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
      </View>
      {actions != null && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: t.sizes.screenGutter,
    paddingTop: t.spacing[3],
    paddingBottom: t.spacing[2],
    gap: t.spacing[3],
  },
  text: { flex: 1, gap: 2 },
  eyebrow: { fontSize: 13, fontWeight: t.fontWeight.medium, color: t.colors.textMuted },
  title: {
    fontFamily: t.fontFamily.display.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.1,
    color: t.colors.textPrimary,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: t.spacing[2], paddingBottom: 2 },
}));
