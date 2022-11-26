import { generatePrivateKey } from "nostr-tools";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Avatar,
  Button,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal,
  useTheme,
} from "react-native-paper";
import { useSnapshot } from "valtio";
import {
  addAccount,
  deleteAccountByIndex,
  getPicture,
  setPrivateKey,
  state,
} from "../state";
import { truncatePubkey } from "../utils";

export function MultiAccountManagerScreen({ navigation }) {
  const theme = useTheme();
  const snap = useSnapshot(state);
  const [accountIndexToDelete, setAccountIndexToDelete] = useState(undefined);

  function isActive(pubkey: string) {
    return snap.publicKey == pubkey;
  }

  function getName(pubkey: string) {
    return snap.profiles[pubkey]?.name;
  }

  function selectAccount(index: number) {
    setPrivateKey(snap.accounts[index].privkey);
  }

  function deleteAccount() {
    if (typeof accountIndexToDelete !== "undefined") {
      deleteAccountByIndex(accountIndexToDelete);
      setAccountIndexToDelete(undefined);
    }
  }

  function createNewAccount() {
    const key = generatePrivateKey();
    addAccount(key);
    setPrivateKey(key);
  }

  return (
    <>
      <Portal>
        <Dialog visible={typeof accountIndexToDelete !== "undefined"}>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete the account?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button color={theme.colors.red} onPress={deleteAccount}>
              Yes
            </Button>
            <Button onPress={() => setAccountIndexToDelete(undefined)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          {snap.accounts?.map((a, i) => {
            return (
              <List.Item
                key={i}
                onPress={() => selectAccount(i)}
                left={() => (
                  <Avatar.Image
                    size={40}
                    source={getPicture(a.pubkey)}
                    style={{ marginRight: 10, alignSelf: "center" }}
                  />
                )}
                title={getName(a.pubkey)}
                titleStyle={{ fontWeight: "bold" }}
                description={truncatePubkey(a.pubkey)}
                right={() => (
                  <View style={{ flexDirection: "row", alignSelf: "center" }}>
                    <IconButton
                      icon={
                        isActive(a.pubkey)
                          ? "check-circle"
                          : "checkbox-blank-circle-outline"
                      }
                      onPress={() => selectAccount(i)}
                      color={
                        isActive(a.pubkey) ? theme.colors.primary : undefined
                      }
                    />
                    {snap.accounts.length > 1 && (
                      <IconButton
                        onPress={() => setAccountIndexToDelete(i)}
                        color={theme.colors.red}
                        icon="delete"
                      />
                    )}
                  </View>
                )}
                style={{ padding: 16, justifyContent: "center" }}
              />
            );
          })}
        </ScrollView>
        <View
          style={{
            padding: 20,
            borderTopWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Button
            uppercase={false}
            mode="outlined"
            color={theme.colors.text}
            style={{ borderRadius: 50, marginBottom: 10 }}
            onPress={createNewAccount}
          >
            Create a new account
          </Button>
          <Button
            uppercase={false}
            mode="outlined"
            color={theme.colors.text}
            style={{ borderRadius: 50 }}
            onPress={() => navigation.navigate("AddExistingAccountScreen")}
          >
            Add existing account
          </Button>
        </View>
      </View>
    </>
  );
}
