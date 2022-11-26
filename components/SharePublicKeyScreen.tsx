import { useNavigation, useTheme } from "@react-navigation/native";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text, ThemeProvider } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import Toast from "react-native-root-toast";
import { useSnapshot } from "valtio";
import { state } from "../state";
import { getRoboHashUrl } from "../utils";

export default function SharePublicKeyScreen() {
  const snap = useSnapshot(state);
  const theme = useTheme();
  const navigation = useNavigation();

  console.log(navigation.getState(), navigation.getParent());

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(snap.publicKey);
      Toast.show("Pubkey copied to clipboard");
    } catch (e) {
      Toast.show("Copy to clipboard not supported");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >
      <TouchableOpacity
        onPress={copyToClipboard}
        style={{ alignItems: "center" }}
      >
        <View
          style={{
            borderWidth: 4,
            borderRadius: 10,
            borderColor: theme.colors.text,
            padding: 20,
            backgroundColor: theme.colors.primary,
          }}
        >
          <QRCode
            value={snap.publicKey}
            size={200}
            backgroundColor={theme.colors.primary}
            color={"white"}
            logoBackgroundColor={theme.colors.primary}
            logoBorderRadius={40}
            logoMargin={5}
            logoSize={40}
            logo={getRoboHashUrl(snap.publicKey)}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={copyToClipboard}>
        <Text
          selectable
          style={{ marginTop: 20, padding: 40, textAlign: "center" }}
        >
          {snap.publicKey}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
