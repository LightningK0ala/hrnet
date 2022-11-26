import { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Dialog,
  List,
  Paragraph,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";
import { resetDatabase } from "../models/db";
import { resetState } from "../state";

export default function SettingsScreen({ navigation }) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const theme = useTheme();

  function reset() {
    resetDatabase();
    resetState();
    navigation.replace("OnboardingScreen");
  }

  return (
    <View>
      <Portal>
        <Dialog
          onDismiss={() => setShowResetDialog(false)}
          visible={showResetDialog}
        >
          <Dialog.Content>
            <Paragraph>You are about to reset all application data.</Paragraph>
            <Paragraph>
              If you haven't backed up any of your keys they will be{" "}
              <Text style={{ fontWeight: "bold" }}>permanently lost</Text>.
            </Paragraph>
            <Paragraph>Are you sure you want to continue?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button color={theme.colors.red} onPress={reset}>
              Yes
            </Button>
            <Button onPress={() => setShowResetDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <List.Section>
        <List.Item
          title="Nostr Relays"
          right={() => <List.Icon icon="chevron-right" />}
          onPress={() => navigation.navigate("NostrRelaysManagementScreen")}
        />
        <List.Item
          title={() => (
            <Button
              color={theme.colors.red}
              onPress={() => setShowResetDialog(true)}
            >
              Reset data
            </Button>
          )}
        />
      </List.Section>
    </View>
  );
}
