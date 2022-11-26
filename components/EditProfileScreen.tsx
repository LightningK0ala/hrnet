import { useLayoutEffect, useState } from "react";
import { TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { Avatar, Button, Text, TextInput, useTheme } from "react-native-paper";
import Toast from "react-native-root-toast";
import { useSnapshot } from "valtio";
import { state } from "../state";
import { getRoboHashUrl } from "../utils";
import { pool } from "./NostrSocket";
import type { EditProfileScreenProps } from "./Router";

export function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const theme = useTheme();
  const snap = useSnapshot(state);
  const profile = snap.profiles[snap.publicKey];
  const [devSettingsClickCount, setDevSettingsClickCount] = useState(0);
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [name, setName] = useState(profile?.name);
  const [about, setAbout] = useState(profile?.about);
  const [picture, setPicture] = useState(profile?.picture);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          color={theme.colors.text}
          onPress={async () => {
            const content = JSON.stringify({ name, about, picture });
            const event = {
              kind: 0,
              pubkey: snap.publicKey,
              content,
              created_at: Math.floor(Date.now() / 1000),
            };
            // TODO: The result will contain the id which we can use to correlate with a
            // received event and give user feedback if update completed.
            await pool.publish(event, (status: Number, url: String) => {
              console.log(status);
              if (status === 0) {
                console.log(`Publish request sent to ${url}`);
              }
              if (status === 1) {
                // TODO: Notify error? Cut this callback might be called multiple times per relay some might fail others not.
                console.log(`Event published by ${url}`);
              }
            });
          }}
        >
          Save
        </Button>
      ),
    });
  });

  function togglePrivateKeyVisible() {
    setPrivateKeyVisible(!privateKeyVisible);
  }

  // Track clicking the profile avatar 10 times to active dev mode
  // and navigate to dev settings screen
  function incrementDevCounter() {
    if (snap.devMode || devSettingsClickCount > 9) return;
    if (devSettingsClickCount >= 9) {
      state.devMode = true;
      navigation.navigate("DevSettingsScreen");
      Toast.show("Developer mode enabled");
    }
    setDevSettingsClickCount(devSettingsClickCount + 1);
  }

  async function copyToClipboard(value) {
    try {
      await navigator.clipboard.writeText(value);
      Toast.show("Copied to clipboard");
    } catch (e) {
      Toast.show("Copy to clipboard not supported");
    }
  }

  return (
    <View style={{ padding: "20px" }}>
      <View style={{ padding: "20px", alignItems: "center" }}>
        <TouchableWithoutFeedback onPress={incrementDevCounter}>
          <Avatar.Image
            source={{ uri: getRoboHashUrl(snap.publicKey) }}
            size={100}
          />
        </TouchableWithoutFeedback>
      </View>
      <TouchableOpacity onPress={() => copyToClipboard(snap.publicKey)}>
        <Text
          selectable
          style={{
            color: "grey",
            textAlign: "center",
          }}
        >
          {snap.publicKey}
        </Text>
      </TouchableOpacity>
      <View style={{ marginTop: "20px" }}>
        <TextInput label={"Name"} value={name} onChangeText={setName} />
        <TextInput
          multiline
          label={"About"}
          value={about}
          onChangeText={setAbout}
        />
        <TextInput
          label={"Picture URL"}
          value={picture}
          onChangeText={setPicture}
        />
      </View>
      {privateKeyVisible && (
        <View style={{ paddingVertical: "10px" }}>
          <TouchableOpacity onPress={() => copyToClipboard(snap.privateKey)}>
            <Text style={{ textAlign: "center" }}>{snap.privateKey}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Button
        uppercase={false}
        mode="outlined"
        color={theme.colors.text}
        style={{ borderRadius: 50, marginTop: 20 }}
        onPress={togglePrivateKeyVisible}
      >
        {privateKeyVisible ? "Hide" : "Show"} Private Key
      </Button>
    </View>
  );
}
