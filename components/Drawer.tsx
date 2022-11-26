import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  Avatar,
  IconButton,
  Text,
  ToggleButton,
  useTheme,
} from "react-native-paper";
import { useSnapshot } from "valtio";
import { getPicture, state } from "../state";
import { truncatePubkey } from "../utils";

export default function Drawer(props) {
  const snap = useSnapshot(state);
  const name = snap.profiles[snap.publicKey]?.name;
  const [isDarkMode, setIsDarkMode] = useState(snap.theme == "dark");
  const theme = useTheme();

  function toggleDarkMode() {
    if (isDarkMode) {
      state.theme = "default";
    } else {
      state.theme = "dark";
    }
    setIsDarkMode(!isDarkMode);
  }

  return (
    <>
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 10,
          justifyContent: "flex-start",
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => props.navigation.navigate("EditProfileScreen")}
            >
              <Avatar.Image
                source={getPicture(snap.publicKey)}
                size={70}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignSelf: "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold", marginTop: 20 }}>
              {name}
            </Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate("SharePublicKeyScreen")}
            >
              <Text selectable style={{ color: "grey", marginTop: 3 }}>
                {truncatePubkey(snap.publicKey)}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() =>
              props.navigation.navigate("MultiAccountManagerScreen")
            }
          >
            <IconButton
              icon="chevron-down"
              style={{ alignSelf: "flex-start", top: 5 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerContentScrollView {...props} style={{ paddingHorizontal: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <ToggleButton
            icon="lightbulb"
            value={isDarkMode}
            onPress={toggleDarkMode}
          />
        </View>
        <IconButton
          icon="qrcode"
          onPress={() => props.navigation.navigate("SharePublicKeyScreen")}
        />
      </View>
    </>
  );
}
