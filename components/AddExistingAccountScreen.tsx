import { useTheme } from "@react-navigation/native";
import { getPublicKey } from "nostr-tools";
import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import Toast from "react-native-root-toast";
import { addAccount, setPrivateKey } from "../state";

export default function AddExistingAccountScreen({ navigation, route }) {
  const [privateKeyToLoad, setPrivateKeyToLoad] = useState("");
  const theme = useTheme();
  const scanResult = route.params?.scanResult;

  useEffect(() => {
    if (!!scanResult) setPrivateKeyToLoad(scanResult);
  }, [scanResult]);

  function add() {
    try {
      // Test to see if valid
      getPublicKey(privateKeyToLoad as any);
    } catch (e) {
      Toast.show("Invalid private key");
    }
    try {
      addAccount(privateKeyToLoad);
      setPrivateKey(privateKeyToLoad);
      setPrivateKeyToLoad("");
      navigation.goBack();
    } catch (e) {
      Toast.show(e.message);
    }
  }

  return (
    <View>
      <View
        style={{
          padding: 15,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextInput
          placeholder={"Enter private key"}
          value={privateKeyToLoad}
          onChangeText={(text) => setPrivateKeyToLoad(text)}
          style={[
            styles.searchbar,
            {
              backgroundColor: theme.colors.border,
              color: theme.colors.text,
              selectionColor: theme.colors.text,
            },
          ]}
        />
        {!!privateKeyToLoad && (
          <IconButton
            color="grey"
            icon="close-circle-outline"
            style={{ margin: 0, marginLeft: 5 }}
            onPress={() => setPrivateKeyToLoad("")}
          />
        )}
        {!!navigator.permissions && (
          <IconButton
            color="grey"
            icon="qrcode-scan"
            onPress={() =>
              navigation.navigate("Scanner", {
                navigateBackTo: "AddExistingAccountScreen",
              })
            }
          />
        )}
      </View>
      <Button disabled={!privateKeyToLoad} onPress={add}>
        Add
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    flex: 1,
    outlineStyle: "none",
    borderRadius: 5,
    lineHeight: 20,
    padding: 10,
  },
});
