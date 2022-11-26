import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useLiveQuery } from "dexie-react-hooks";
import { FlatList, Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, List, Text, useTheme } from "react-native-paper";
import { useSnapshot } from "valtio";
import { getAllChats } from "../models/db";
import { state } from "../state";
import { dateFormat, getRoboHashUrl, truncatePubkey } from "../utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import Search from "./Search";
import { pool } from "./NostrSocket";

export function renderAvatar(pubkey: string, profiles = {}) {
  const theme = useTheme();
  const profile = profiles[pubkey];
  return (
    <Image
      source={profile?.picture || getRoboHashUrl(pubkey)}
      style={[styles.avatar, { borderColor: theme.colors.border }]}
    />
  );
}

export function getName(pubkey: string, profiles) {
  const profile = profiles[pubkey];
  if (state.publicKey == pubkey) return "Me";
  if (!profile?.name) return truncatePubkey(pubkey);
  return profile.name;
}

export default function ChatList({ route }) {
  const [filteredChats, setFilteredChats] = useState();
  const [allLatestChats, setAllLatestChats] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedProfile, setSearchedProfile] = useState();
  const theme = useTheme();
  const snap = useSnapshot(state, { sync: true });
  const allChats = useLiveQuery(
    () => getAllChats(snap.publicKey),
    [snap.privateKey]
  );
  const navigation = useNavigation();
  const scanResult = route.params?.scanResult;

  function convertToSortedLatestChats(chats) {
    return Object.keys(chats)
      .map((key) => {
        const index = chats[key].length - 1;
        const chat = chats[key][index];
        return {
          id: chat.id,
          // NOTE this is the other side pubkey
          pubkey: key,
          content: chat.content,
          created_at: chat.created_at,
        };
      })
      .sort((a, b) => b.created_at - a.created_at);
  }

  useEffect(() => {
    // If we know about this pubkey locally set it from our profiles
    const profile = snap.profiles[searchText];
    if (profile) {
      setSearchedProfile(profile);
    }
    const sub = pool.sub({
      cb: (event: Event) => {
        try {
          const updatedAt = searchedProfile?.updatedAt || 0;
          if (updatedAt >= event.created_at) return;
          // TODO: Use zod to parse this?
          const { name, picture, about } = JSON.parse(event.content);
          // TODO: make this a function so we can update profile.
          setSearchedProfile({
            publicKey: event.pubkey as string,
            name,
            about,
            picture,
            updatedAt: event.created_at,
          });
          const profile = snap.profiles[event.pubkey];
          if (profile?.updatedAt >= event.created_at) return;
          state.profiles = {
            ...state.profiles,
            [event.pubkey]: {
              name,
              about,
              picture,
              updatedAt: event.created_at,
            },
          };
          state.profiles;
        } catch (e) {
          console.error(`Failed to parse event kind 2 with error: ${e}`, event);
        }
      },
      skipVerification: true,
      filter: {
        authors: [searchText],
        kinds: [0],
        limit: 1,
      },
    });
    return () => sub.unsub();
  }, [searchText]);

  useEffect(() => {
    if (!allChats) return;
    if (searchText == "") return setFilteredChats(undefined);
    const regex = new RegExp(searchText, "gi");
    let result = {};
    Object.keys(allChats).map((key) => {
      const events = allChats[key].filter((e) => {
        const profile = snap.profiles[key];
        return (
          regex.test(e.content) || regex.test(key) || regex.test(profile?.name)
        );
      });
      if (events.length < 1) return;
      result[key] = events;
    });
    result = convertToSortedLatestChats(result);
    setFilteredChats(result);
  }, [searchText, allChats]);

  useEffect(() => {
    if (!allChats) return;
    const chats = convertToSortedLatestChats(allChats);
    setAllLatestChats(chats);
  }, [allChats]);

  useEffect(() => {
    scanResult && setSearchText(scanResult);
  }, [scanResult]);

  function onSearchTextChange(text: string) {
    setSearchText(text);
  }

  function onClearSearch() {
    setSearchText("");
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={{ justifyContent: "center" }}
        >
          {renderAvatar(snap.publicKey, snap.profiles)}
        </TouchableOpacity>
        <Search
          placeholder="Search"
          value={searchText}
          onChangeText={onSearchTextChange}
          onPressScan={() =>
            navigation.navigate("Scanner", { navigateBackTo: "ChatList" })
          }
          onPressClear={onClearSearch}
          containerStyle={{ marginHorizontal: 5 }}
        />
      </View>

      {!allChats && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      )}
      {allChats && (
        <ScrollView style={styles.chatlistcontainer}>
          {searchText?.length == 0 && allLatestChats.length == 0 && (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ textAlign: "center" }}>No chats 🙁</Text>
              <Text style={{ textAlign: "center", marginTop: 5 }}>
                Search or scan your friend's pubkey.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchText(
                    "9c8e6bcf8438812fe44ccd32ba4208b3c72193a944d7e6f68ff311b48a28523e"
                  );
                }}
                style={{ marginTop: 5 }}
              >
                <Text
                  style={{ textAlign: "center", color: theme.colors.primary }}
                >
                  You can also send us feedback via chat.
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {filteredChats?.length == 0 &&
            searchText?.length !== 0 &&
            searchText?.length !== 64 &&
            !searchedProfile && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text>No search matches 🙁</Text>
              </View>
            )}
          {searchText?.length == 64 &&
          filteredChats !== undefined &&
          filteredChats.length == 0 ? (
            <>
              <List.Item
                style={[
                  styles.listitem,
                  { borderLeftWidth: 2, borderLeftColor: theme.colors.primary },
                ]}
                title={`${
                  searchedProfile
                    ? searchedProfile?.name
                    : truncatePubkey(searchText)
                }`}
                titleStyle={{ fontWeight: "bold" }}
                left={() => (
                  <Image
                    source={
                      searchedProfile?.picture || getRoboHashUrl(searchText)
                    }
                    style={[
                      styles.avatar,
                      { borderColor: theme.colors.border },
                    ]}
                  />
                )}
                descriptionStyle={styles.description}
                onPress={() =>
                  navigation.navigate("Chat", { pubkey: searchText })
                }
                titleNumberOfLines={1}
                descriptionNumberOfLines={1}
              />
            </>
          ) : (
            <FlatList
              data={filteredChats || allLatestChats}
              renderItem={({ item }) => (
                <List.Item
                  style={styles.listitem}
                  title={getName(item.pubkey, snap.profiles)}
                  titleStyle={styles.title}
                  description={item.content}
                  titleNumberOfLines={1}
                  descriptionStyle={[styles.description]}
                  descriptionNumberOfLines={1}
                  left={() => renderAvatar(item.pubkey, snap.profiles)}
                  right={() => (
                    <Text
                      style={[
                        styles.date,
                        {
                          color: snap.readMessagesIds?.includes(item.id)
                            ? theme.colors.text
                            : theme.colors.green,
                        },
                      ]}
                    >
                      {dateFormat(item.created_at * 1000)}
                    </Text>
                  )}
                  // TODO: Fix typescript typing for navigation
                  // @ts-ignore
                  onPress={() =>
                    navigation.navigate("Chat", { pubkey: item.pubkey })
                  }
                />
              )}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: 16,
  },
  chatlistcontainer: {
    marginTop: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  date: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
    marginLeft: 5,
    alignSelf: "center",
  },
  avatar: {
    marginRight: 5,
    borderWidth: 0.5,
    width: 40,
    height: 40,
    borderRadius: 40,
    alignSelf: "center",
  },
  listitem: {
    justifyContent: "center",
  },
});
