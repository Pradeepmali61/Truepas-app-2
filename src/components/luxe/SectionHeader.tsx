import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens } from "@/theme";

export interface SectionHeaderProps {
  title: ReactNode;
  /** Optional trailing count/caption beside the title, e.g. "3". */
  meta?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Section heading — semibold display title, optional muted meta and a
 *  quiet "See all ›" action. */
export function SectionHeader({ title, meta, actionLabel, onAction, style }: SectionHeaderProps) {
  const styles = useStyles();
  const t = useThemeTokens();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {meta != null && <Text style={styles.meta}>{meta}</Text>}
      </View>
      {actionLabel != null && onAction && (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10} onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <ChevronRight size={15} strokeWidth={2.2} color={t.colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleWrap: { flexDirection: "row", alignItems: "baseline", gap: t.spacing[2] },
  title: {
    fontFamily: t.fontFamily.display.semibold,
    fontSize: t.fontSize.md,
    letterSpacing: -0.3,
    color: t.colors.textPrimary,
  },
  meta: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.textMuted },
  action: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionText: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.textSecondary },
}));
