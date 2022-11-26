import { useNavigation } from "@react-navigation/native";
import { generatePrivateKey, getPublicKey } from "nostr-tools";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Linking } from "react-native";
import { Button, HelperText, Text, useTheme } from "react-native-paper";
import { addAccount, setPrivateKey, state } from "../state";
import Search from "./Search";

export default function OnboardingScreen({ route }) {
  const navigation = useNavigation();
  const [privateKey, setKey] = useState("");
  const [error, setError] = useState("");
  const theme = useTheme();
  const scanResult = route.params?.scanResult;

  useEffect(() => {
    if (!!scanResult) onChangePrivateKey(scanResult);
  }, [scanResult]);

  function onChangePrivateKey(value) {
    setError(false);
    setKey(value);
    if (!value) return;
    try {
      setPrivateKey(value);
      addAccount(value);
      state.onboarded = true;
      navigation.replace("AppScreen");
    } catch (e) {
      setError(e.message);
    }
  }

  function onNewAccount() {
    const key = generatePrivateKey();
    setPrivateKey(key);
    addAccount(key);
    state.onboarded = true;
    navigation.replace("AppScreen");
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={styles.hornet}>🐝</Text>
      <Text style={styles.hornetText}>
        "Anon has kicked the hornet’s nest, and the swarm is headed towards us."
      </Text>
      <Text style={styles.bodyText}>
        <Text>Welcome to </Text>
        <Text style={{ fontWeight: "bold" }}>Hrnet!</Text>
      </Text>
      <Text style={styles.bodyText}>
        <Text>
          A private, censorship-resistant and encrypted direct message chat
          application built on{" "}
        </Text>
        <Text
          style={{ color: theme.colors.primary }}
          onPress={() =>
            Linking.openURL("https://github.com/nostr-protocol/nostr")
          }
        >
          nostr
        </Text>
        <Text>.</Text>
      </Text>
      <Text style={[styles.bodyText, { marginTop: 30 }]}>
        To begin, generate a new account:
      </Text>
      <Button mode="contained" style={{ marginTop: 10 }} onPress={onNewAccount}>
        new account
      </Button>
      <Text style={[styles.bodyText, { marginTop: 30 }]}>
        Or, load an existing nostr account:
      </Text>
      <Search
        onChangeText={onChangePrivateKey}
        placeholder={"Enter private key"}
        onPressClear={() => onChangePrivateKey("")}
        onPressScan={() =>
          navigation.navigate("Scanner", {
            navigateBackTo: "OnboardingScreen",
          })
        }
        value={privateKey}
        containerStyle={{ marginTop: 10 }}
      />
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 15,
  },
  hornet: {
    alignSelf: "center",
    margin: 10,
    fontSize: 50,
  },
  hornetText: {
    fontStyle: "italic",
    alignSelf: "center",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 18,
    marginTop: 5,
  },
  textInput: {
    marginTop: 10,
    flex: 1,
    outlineStyle: "none",
    borderRadius: 5,
  },
});
