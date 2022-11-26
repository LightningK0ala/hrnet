import { useState } from "react";
import { FlatList, View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  List,
  useTheme,
} from "react-native-paper";
import { useSnapshot } from "valtio";
import { addRelay, removeRelay, state } from "../state";
import Search from "./Search";

export default function NostrRelaysManagementScreen() {
  const [relay, setRelay] = useState("");
  const snap = useSnapshot(state);
  const theme = useTheme();

  function add() {
    addRelay(relay);
    setRelay("");
  }

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={snap.relays}
        renderItem={({ item, index }) => (
          <List.Item
            right={
              snap.relays.length > 1
                ? () => (
                    <IconButton
                      key={index}
                      color={theme.colors.red}
                      icon="delete"
                      onPress={() => removeRelay(item)}
                    />
                  )
                : undefined
            }
            title={item}
          />
        )}
      />
      <Divider style={{ marginVertical: "10px" }} />
      <Search
        hideScanner
        placeholder="Enter new relay url"
        onChangeText={setRelay}
        onPressClear={() => setRelay("")}
        value={relay}
      />
      <Button disabled={!relay} onPress={add}>
        Add
      </Button>
    </View>
  );
}
