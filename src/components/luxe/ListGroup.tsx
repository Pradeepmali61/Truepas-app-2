import { ChevronRight } from "lucide-react-native";
import { Children, Fragment, isValidElement, useState, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens } from "@/theme";
import { NeuBox } from "../ui/NeuBox";

/**
 * Inset grouped list — one rimmed surface, rows separated by hairlines that
 * start after the leading icon (iOS settings rhythm).
 */
export function ListGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <NeuBox variant="flat" radius={22} style={[styles.group, style]}>
      {rows.map((row, i) => (
        <Fragment key={row.key ?? i}>
          {i > 0 && <View style={styles.divider} />}
          {row}
        </Fragment>
      ))}
    </NeuBox>
  );
}

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Leading visual — usually <RowGlyph/> or an avatar/thumbnail. */
  leading?: ReactNode;
  /** Trailing content — a value, badge or switch. A chevron is added when `onPress` is set and `chevron` isn't false. */
  trailing?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  /** Max subtitle lines. Default 2. */
  subtitleLines?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function ListRow({ title, subtitle, leading, trailing, chevron, destructive, subtitleLines = 2, onPress, accessibilityLabel }: ListRowProps) {
  const styles = useStyles();
  const t = useThemeTokens();
  const [pressed, setPressed] = useState(false);
  const body = (
    <View style={[styles.row, pressed && styles.rowPressed]}>
      {leading}
      <View style={styles.text}>
        <Text style={[styles.title, destructive && styles.titleDanger]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle != null && (
          <Text style={styles.subtitle} numberOfLines={subtitleLines}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
      {onPress && chevron !== false && <ChevronRight size={18} strokeWidth={2} color={t.colors.textMuted} />}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof title === "string" ? title : undefined)}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {body}
    </Pressable>
  );
}

/** Rounded-square tinted glyph tile for list rows and quick actions. */
export function RowGlyph({
  icon: Icon,
  tone = "brand",
  size = 36,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tone?: "brand" | "success" | "warning" | "error" | "neutral";
  size?: number;
}) {
  const t = useThemeTokens();
  const map = {
    brand: [t.colors.brandSubtle, t.colors.onBrandSubtle],
    success: [t.colors.successSubtle, t.colors.success],
    warning: [t.colors.warningSubtle, t.colors.warning],
    error: [t.colors.errorSubtle, t.colors.error],
    neutral: [t.colors.actionSecondaryActive, t.colors.textSecondary],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={1.9} color={fg} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  group: { paddingVertical: t.spacing[1] },
  divider: { height: 1, backgroundColor: t.colors.borderSubtle, marginLeft: 68, marginRight: t.spacing[4] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing[3] + 2,
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    minHeight: 60,
  },
  rowPressed: { backgroundColor: t.colors.actionSecondary },
  text: { flex: 1, gap: 2 },
  title: { fontSize: t.fontSize.base, fontWeight: t.fontWeight.medium, color: t.colors.textPrimary, letterSpacing: -0.15 },
  titleDanger: { color: t.colors.error },
  subtitle: { fontSize: t.fontSize.sm - 0.5, color: t.colors.textMuted },
}));
