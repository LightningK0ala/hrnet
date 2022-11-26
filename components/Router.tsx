import {
  NavigationContainer,
  useNavigation,
  useTheme,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import DevSettingsScreen from "./DevSettingsScreen";
import ChatList from "./ChatList";
import Chat from "./Chat";
import Scanner from "./Scanner";
import { IconButton } from "react-native-paper";
import { useSnapshot } from "valtio";
import { state } from "../state";
import { getTheme } from "../theme";
import OnboardingScreen from "./OnboardingScreen";
import NostrSocket from "./NostrSocket";
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import DrawerContent from "./Drawer";
import SharePublicKeyScreen from "./SharePublicKeyScreen";
import { EditProfileScreen } from "./EditProfileScreen";
import type { CompositeScreenProps } from "@react-navigation/native";
import { MultiAccountManagerScreen } from "./MultiAccountManagerScreen";
import AddExistingAccountScreen from "./AddExistingAccountScreen";
import SettingsScreen from "./SettingsScreen";
import NostrRelaysManagementScreen from "./NostrRelaysManagementScreen";

export type AppStackParamsList = {
  OnboardingScreen: undefined;
  AppScreen: undefined;
  AddExistingAccountScreen: {
    scanResult: string;
  };
  Scanner: {
    navigateBackTo: string;
  };
  NostrRelaysManagementScreen: undefined;
};

export type AppScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AppStackParamsList, "AppScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<ChatStackParamsList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

export type OnboardingScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AppStackParamsList, "OnboardingScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<ChatStackParamsList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

export type ScannerScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AppStackParamsList, "Scanner">,
  CompositeScreenProps<
    NativeStackScreenProps<ChatStackParamsList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

export type ChatStackParamsList = {
  ChatList: { scannedResult: string };
  Chat: { pubkey: string };
};

export type ChatListProps = CompositeScreenProps<
  NativeStackScreenProps<ChatStackParamsList, "ChatList">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

export type ChatProps = CompositeScreenProps<
  NativeStackScreenProps<ChatStackParamsList, "Chat">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

export type DrawerParamsList = {
  ChatScreen: undefined;
  DevSettingsScreen: undefined;
  SettingsScreen: undefined;
  SharePublicKeyScreen: undefined;
  EditProfileScreen: undefined;
  MultiAccountManagerScreen: undefined;
};

export type ChatScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamsList, "ChatScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    NativeStackScreenProps<ChatStackParamsList>
  >
>;

export type DevSettingsScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamsList, "DevSettingsScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    NativeStackScreenProps<ChatStackParamsList>
  >
>;

export type SharePublicKeyScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamsList, "SharePublicKeyScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    NativeStackScreenProps<ChatStackParamsList>
  >
>;

export type EditProfileScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamsList, "EditProfileScreen">,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamsList>,
    NativeStackScreenProps<ChatStackParamsList>
  >
>;

const AppStack = createNativeStackNavigator<AppStackParamsList>();
const ChatStack = createNativeStackNavigator<ChatStackParamsList>();
const Drawer = createDrawerNavigator<DrawerParamsList>();

function ChatScreen() {
  const theme = useTheme();

  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <ChatStack.Screen
        name="ChatList"
        component={ChatList}
        options={{
          title: "Chat",
          headerShown: false,
        }}
      />
      <ChatStack.Screen name="Chat" component={Chat} />
    </ChatStack.Navigator>
  );
}

function renderDrawerCustomHeaderLeft(onPress) {
  return () => (
    <IconButton
      icon="arrow-left"
      style={{ paddingLeft: "3px" }}
      onPress={onPress}
    />
  );
}

function AppScreen({ navigation }: AppScreenProps) {
  const snap = useSnapshot(state);
  const theme = useTheme();
  return (
    <>
      <NostrSocket />
      <Drawer.Navigator
        drawerContent={DrawerContent}
        // initialRouteName="SettingsScreen"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          drawerLabelStyle: { marginLeft: -25 },
        }}
      >
        <Drawer.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={() => ({
            title: "Chat",
            drawerIcon: ({ focused }) => (
              <IconButton
                icon="wechat"
                color={focused ? theme.colors.primary : theme.colors.text}
                style={{ margin: 0, padding: 0 }}
              />
            ),
            headerShown: false,
          })}
        />
        <Drawer.Screen
          name="SettingsScreen"
          component={SettingsScreen}
          options={() => ({
            title: "Settings",
            drawerIcon: ({ focused }) => (
              <IconButton
                icon="cog"
                color={focused ? theme.colors.primary : theme.colors.text}
                style={{ margin: 0, padding: 0 }}
              />
            ),
            headerLeft: renderDrawerCustomHeaderLeft(() =>
              navigation.navigate("ChatScreen")
            ),
          })}
        />
        <Drawer.Screen
          name="DevSettingsScreen"
          component={DevSettingsScreen}
          options={() => ({
            title: "Developer",
            headerTitle: "Developer Settings",
            drawerItemStyle: { display: snap.devMode ? undefined : "none" },
            headerLeft: renderDrawerCustomHeaderLeft(() =>
              navigation.navigate("ChatScreen")
            ),
            drawerIcon: ({ focused }) => (
              <IconButton
                icon="hammer"
                color={focused ? theme.colors.primary : theme.colors.text}
                style={{ margin: 0, padding: 0 }}
              />
            ),
          })}
        />
        <Drawer.Screen
          name="SharePublicKeyScreen"
          component={SharePublicKeyScreen}
          options={{
            title: "Share",
            drawerItemStyle: { display: "none" },
            headerTitle: "",
            headerLeft: renderDrawerCustomHeaderLeft(() => navigation.goBack()),
            // TODO:
            // headerRight: () => (
            //   <IconButton
            //     icon="share-variant-outline"
            //     onPress={() => {
            //       alert("TODO: Implement share");
            //     }}
            //   />
            // ),
          }}
        />
        <Drawer.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{
            drawerItemStyle: { display: "none" },
            headerTitle: "Edit Profile",
            headerLeft: renderDrawerCustomHeaderLeft(() => navigation.goBack()),
          }}
        />
        <Drawer.Screen
          name="MultiAccountManagerScreen"
          component={MultiAccountManagerScreen}
          options={{
            drawerItemStyle: { display: "none" },
            headerTitle: "Manage Accounts",
            headerLeft: renderDrawerCustomHeaderLeft(() => navigation.goBack()),
          }}
        />
      </Drawer.Navigator>
    </>
  );
}

export function Router() {
  const snap = useSnapshot(state);
  const theme = getTheme(snap.theme);
  return (
    <NavigationContainer theme={theme}>
      <AppStack.Navigator
        // initialRouteName={"EditProfileScreen"}
        initialRouteName={snap.onboarded ? "AppScreen" : "OnboardingScreen"}
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <AppStack.Screen
          name="OnboardingScreen"
          component={OnboardingScreen}
          options={{ headerShown: false, title: "Onboarding" }}
        />
        <AppStack.Screen
          name="AppScreen"
          component={AppScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{
            headerTitle: "Edit Profile",
          }}
        />
        <AppStack.Screen
          name="Scanner"
          component={Scanner}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="AddExistingAccountScreen"
          component={AddExistingAccountScreen}
          options={{
            headerTitle: "Add Existing Account",
          }}
        />
        <AppStack.Screen
          name="NostrRelaysManagementScreen"
          component={NostrRelaysManagementScreen}
          options={{
            headerTitle: "Nostr Relays",
          }}
        />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}
