import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles, useThemeTokens } from "../../theme";
import { iconSize } from "../../theme/tokens";
import { IconButton } from "../ui/IconButton";
import { Typography } from "../ui/Typography";

export interface ScreenHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Shows a back chevron — wire to your navigator */
  onBack?: () => void;
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Top bar for a pushed screen — mirrors the design-repo AppScreen header:
 *  transparent over the screen background (no strip/border), ghost back
 *  arrow in actionPrimary, centered h4 title kept balanced by equal-width
 *  side slots. */
export function ScreenHeader({ title, subtitle, onBack, actions, style }: ScreenHeaderProps) {
  const styles = useStyles();
  const theme = useThemeTokens();
  return (
    <View style={[styles.header, style]}>
      {onBack ? (
        <IconButton
          accessibilityLabel="Back"
          variant="secondary"
          icon={<ChevronLeft size={iconSize.md} strokeWidth={2} color={theme.colors.textPrimary} style={{ marginLeft: -2 }} />}
          onPress={onBack}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.titles}>
        {title != null && (
          <Typography variant="h4" numberOfLines={1} style={styles.title}>
            {title}
          </Typography>
        )}
        {subtitle != null && (
          <Typography variant="caption" color="muted" numberOfLines={1}>
            {subtitle}
          </Typography>
        )}
      </View>
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing[2],
    minHeight: t.sizes.headerHeight,
    paddingHorizontal: t.sizes.screenGutter,
    paddingTop: t.spacing[1],
  },
  title: { fontSize: t.fontSize.md, letterSpacing: -0.3 },
  headerSpacer: { width: 44 },
  titles: { flex: 1, alignItems: "center", gap: 1 },
  actions: {
    minWidth: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: t.spacing[2],
  },
}));
