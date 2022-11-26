import { useNavigation } from "@react-navigation/native";
import { useLiveQuery } from "dexie-react-hooks";
import { generatePrivateKey } from "nostr-tools";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSnapshot } from "valtio";
import { db, resetDatabase } from "../models/db";
import {
  addAccount,
  resetRelays,
  resetState,
  setPrivateKey,
  state,
} from "../state";
import { dateFormat } from "../utils";

const debugUsers = {
  a: "d3672583d31286903aa7c47c5698ac059eec05ca172a0f00ed19629ace8df5df",
  b: "a7e418b8c7a755c9dd9489a6fefe63d8bf7c5958752b2ffdb297b7bd25280f1f",
};

export default function DevSettingsScreen() {
  const snap = useSnapshot(state, { sync: true });
  const events = useLiveQuery(() => db.nostrEvents.toArray()) || [];
  const navigation = useNavigation();
  const theme = useTheme();

  const newPrivateKey = () => {
    const key = generatePrivateKey();
    setPrivateKey(key);
  };

  function onResetState() {
    resetState();
    navigation.replace("OnboardingScreen");
  }

  function setDebugUser(key) {
    return () => {
      try {
        addAccount(key);
        setPrivateKey(key);
      } catch (e) {}
    };
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text>
        Nostr Latest Event Created At:{" "}
        {snap.nostrLatestEventCreatedAt
          ? dateFormat(snap.nostrLatestEventCreatedAt * 1000)
          : "None"}
      </Text>
      <Text>Nostr Events: {events.length}</Text>
      <Button onPress={resetDatabase}>Reset DB</Button>
      <Button onPress={onResetState}>Reset State</Button>
      <Button onPress={resetRelays}>Reset Relays</Button>
      <Button onPress={() => (state.devMode = false)}>Reset Dev Mode</Button>
      <Button onPress={newPrivateKey}>New Private Key</Button>
      <Button onPress={setDebugUser(debugUsers.a)}>User A</Button>
      <Button onPress={setDebugUser(debugUsers.a)}>User B</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: "20px",
  },
});
