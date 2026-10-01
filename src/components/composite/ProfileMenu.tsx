/**
 * ProfileMenu — the grouped settings list on ProfileScreen (and the profile
 * drawer): account, family & privacy, support, sign out and delete account,
 * version footer, and the sign-out confirmation sheet.
 */
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { CircleHelp, FileLock2, Info, LogOut, Palette, Pencil, ShieldCheck, Trash2, Users } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { useLogoutFlow } from "../../features/auth/useLogoutFlow";
import { makeStyles, useThemeTokens } from "../../theme";
import { iconSize } from "../../theme/tokens";
import { ListGroup, ListRow, RowGlyph } from "../luxe/ListGroup";
import { ActionSheet } from "./ActionSheet";

export function ProfileMenu({ onNavigate }: { onNavigate?: () => void }) {
  const styles = useStyles();
  const t = useThemeTokens();
  const router = useRouter();
  const { logout } = useLogoutFlow();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const go = (href: string) => {
    onNavigate?.();
    router.push(href as never);
  };

  return (
    <>
      <View style={styles.group}>
        <Text style={styles.groupLabel}>Account</Text>
        <ListGroup>
          <ListRow leading={<RowGlyph icon={Pencil} />} title="Personal details" subtitle="Name, email, phone, photo" onPress={() => go("/profile/edit")} />
          <ListRow leading={<RowGlyph icon={ShieldCheck} tone="success" />} title="Security & sign-in" subtitle="Password, PIN, face" onPress={() => go("/security")} />
          <ListRow leading={<RowGlyph icon={Palette} tone="neutral" />} title="Appearance" onPress={() => go("/settings")} />
        </ListGroup>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Family & privacy</Text>
        <ListGroup>
          <ListRow leading={<RowGlyph icon={Users} />} title="Family members" onPress={() => go("/family")} />
          <ListRow leading={<RowGlyph icon={FileLock2} tone="neutral" />} title="Data & privacy" onPress={() => go("/legal/data-privacy")} />
        </ListGroup>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Support</Text>
        <ListGroup>
          <ListRow leading={<RowGlyph icon={CircleHelp} tone="neutral" />} title="Help centre" onPress={() => go("/help")} />
          <ListRow leading={<RowGlyph icon={Info} tone="neutral" />} title="About Truepas" onPress={() => go("/about")} />
        </ListGroup>
      </View>

      <ListGroup>
        <ListRow leading={<RowGlyph icon={LogOut} tone="neutral" />} title="Sign out" chevron={false} onPress={() => setConfirmSignOut(true)} />
        <ListRow leading={<RowGlyph icon={Trash2} tone="error" />} title="Delete account" destructive onPress={() => go("/account/delete")} />
      </ListGroup>

      <Text style={styles.version}>Truepas {Constants.expoConfig?.version ?? "1.0.0"}</Text>

      <ActionSheet
        visible={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title="Sign out of Truepas?"
        items={[
          {
            key: "signout",
            label: "Sign out",
            destructive: true,
            icon: <LogOut size={iconSize.md} color={t.colors.error} />,
            onSelect: () => void logout(),
          },
        ]}
      />
    </>
  );
}

const useStyles = makeStyles((t) => ({
  group: { gap: t.spacing[2] },
  groupLabel: {
    fontSize: 12,
    fontWeight: t.fontWeight.semibold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: t.colors.textMuted,
    marginLeft: t.spacing[1],
  },
  version: { textAlign: "center", fontSize: 12, color: t.colors.textMuted, fontFamily: t.fontFamily.mono.regular },
}));
