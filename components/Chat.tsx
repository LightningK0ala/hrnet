import { useLiveQuery } from "dexie-react-hooks";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { useSnapshot } from "valtio";
import { getChat } from "../models/db";
import { state } from "../state";
import { dateFormat } from "../utils";
import { encrypt } from "nostr-tools";
import styled from "styled-components/native";
import { pool } from "./NostrSocket";
import { getName, renderAvatar } from "./ChatList";
import { useNavigation } from "@react-navigation/native";
import Sound from "../sound";

const popmp3 = require("../assets/pop.mp3");
const popwebm = require("../assets/pop.webm");

const StyledReplyToBubble = styled.View`
  padding: ${(props) => (props.isEmbedded ? "0px" : "16px")};
  margin-bottom: ${(props) => (props.isEmbedded ? "10px" : "0px")};
`;

const StyledChatBubble = styled.TouchableOpacity`
  margin-vertical: 5px;
  padding: 10px;
  width: 45%;
  border-radius: 10px;
  border-top-left-radius: ${(props) => (props.isSelf ? "10px" : "0px")};
  border-top-right-radius: ${(props) => (props.isSelf ? "0px" : "10px")};
  align-self: ${(props) => (props.isSelf ? "flex-end" : "flex-start")};
`;

const ReplyToBubble = ({
  event,
  isEmbedded = false,
  onClearReply = () => {},
}) => {
  const snap = useSnapshot(state);
  const theme = useTheme();

  return (
    <StyledReplyToBubble isEmbedded={isEmbedded}>
      <View
        style={[
          styles.replyToBubble,
          {
            backgroundColor: theme.colors.border,
            borderLeftColor: theme.colors.text,
          },
        ]}
      >
        {!isEmbedded && (
          <IconButton
            style={styles.replyToClose}
            size={15}
            icon="close"
            onPress={onClearReply}
          />
        )}
        <Text style={styles.chatHeaderTitleName} numberOfLines={1}>
          {getName(event.pubkey, snap.profiles)}
        </Text>
        <Text style={styles.chatContent} numberOfLines={3}>
          {event.content}
        </Text>
      </View>
    </StyledReplyToBubble>
  );
};

const ChatBubble = ({ event, chat, onLongPress }) => {
  const snap = useSnapshot(state);
  const theme = useTheme();
  const eTag = event.tags.filter((t) => t[0] == "e");
  let replyEvent;

  if (eTag.length > 0) {
    const eventId = eTag[0][1];
    replyEvent = chat.filter((c) => c.id == eventId)[0];
  }

  const isSelf = event.pubkey == snap.publicKey;
  const textColor = isSelf ? "white" : theme.colors.text;

  return (
    <>
      <StyledChatBubble
        onLongPress={() => onLongPress(event.id)}
        isSelf={isSelf}
        style={{
          backgroundColor: isSelf ? theme.colors.primary : theme.colors.border,
        }}
      >
        {replyEvent && <ReplyToBubble event={replyEvent} isEmbedded />}
        <Text style={[styles.chatContent, { color: textColor }]}>
          {event.content}
        </Text>
        <Text style={[styles.chatDate, { color: textColor }]}>
          {dateFormat(event.created_at * 1000)}
        </Text>
      </StyledChatBubble>
    </>
  );
};

export function ChatHeaderTitle() {
  const snap = useSnapshot(state, { sync: true });
  const navigation = useNavigation();
  const navState = navigation.getState();
  const { pubkey } = navState.routes[navState.index].params;
  // const pubkey = "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539"
  return (
    <View style={styles.chatHeaderTitleContainer}>
      {renderAvatar(pubkey, snap.profiles)}
      <Text style={styles.chatHeaderTitleName}>
        {getName(pubkey, snap.profiles)}
      </Text>
    </View>
  );
}

export default function Chat({ navigation, route }) {
  const theme = useTheme();
  const snap = useSnapshot(state);
  const [isLoaded, setLoaded] = useState(false);
  const [replyToId, setReplyToId] = useState();
  const [highlightedChatId, setHighlightedChatId] = useState();
  const [message, setMessage] = useState("");
  const { pubkey } = route.params;
  // const pubkey = "d97a344cf02063588769a1a62dc2cbd80104abed6de78033f70870f3fa157539"
  const allChat = useLiveQuery(
    () => getChat(snap.publicKey, pubkey),
    [snap.publicKey]
  );
  const scrollViewRef = useRef();
  const pop = new Sound([popmp3, popwebm]);

  useEffect(() => {
    if (!allChat) return;
    allChat.forEach((c) => {
      if (!snap.readMessagesIds?.includes(c.id)) {
        state.readMessagesIds = [...state.readMessagesIds, c.id];
      }
    });
    if (isLoaded) {
      pop.play();
    } else {
      setLoaded(true);
    }
  }, [allChat]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: highlightedChatId ? "" : () => <ChatHeaderTitle />,
      headerLeft: highlightedChatId
        ? () => (
            <IconButton
              icon="arrow-left"
              onPress={() => {
                setHighlightedChatId(undefined);
              }}
            />
          )
        : undefined,
      headerRight: () =>
        highlightedChatId ? (
          <IconButton
            icon="reply"
            onPress={() => {
              setReplyToId(highlightedChatId);
              setHighlightedChatId(undefined);
            }}
          />
        ) : undefined,
    });
  });

  function renderTextInput() {
    return (
      <View
        style={[
          styles.chatMessage,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <TextInput
          multiline
          onSubmitEditing={onSubmit}
          value={message}
          onChangeText={setMessage}
          activeUnderlineColor="none"
          underlineColor="none"
          placeholder="Type a message"
          style={[
            styles.chatInput,
            {
              backgroundColor: theme.colors.border,
              color: theme.colors.text,
              selectionColor: theme.colors.text,
            },
          ]}
        />
        <IconButton
          disabled={message.length < 1}
          icon="send"
          onPress={onSubmit}
        />
      </View>
    );
  }

  async function onSubmit() {
    let event = {
      kind: 4,
      pubkey: snap.publicKey,
      content: encrypt(snap.privateKey, pubkey, message),
      tags: [["p", pubkey]],
      created_at: Math.floor(Date.now() / 1000),
    };
    if (replyToId) {
      event.tags = [...event.tags, ["e", replyToId]];
    }
    pool.publish(event, (status: Number, url: String) => {
      if (status === 0) {
        console.log(`Publish request sent to ${url}`);
      }
      if (status === 1) {
        console.log(`Event published by ${url}`);
      }
    });
    setMessage("");
    setReplyToId(undefined);
  }

  if (allChat && allChat.length < 1)
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.container,
            { flex: 1, alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Text>No messages</Text>
        </View>
        {renderTextInput()}
      </View>
    );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {!allChat && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      )}
      {allChat && (
        <ScrollView
          contentContainerStyle={styles.chatContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current.scrollToEnd({ animated: false })
          }
        >
          {allChat.map((e) => (
            <View
              key={e.id}
              style={{
                backgroundColor:
                  highlightedChatId == e.id ? theme.colors.card : "none",
              }}
            >
              <ChatBubble
                event={e}
                chat={allChat}
                onLongPress={(id) => setHighlightedChatId(id)}
              />
            </View>
          ))}
        </ScrollView>
      )}
      {allChat && replyToId && (
        <ReplyToBubble
          onClearReply={() => setReplyToId(undefined)}
          event={allChat.filter((c) => c.id == replyToId)[0]}
        />
      )}
      {renderTextInput()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatMessage: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatContainer: {
    padding: 16,
  },
  chatBubble: {
    marginVertical: 5,
    padding: 5,
    width: "45%",
    backgroundColor: "lightgrey",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  chatName: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  chatContent: {},
  chatDate: {
    marginTop: 2,
    fontSize: 10,
    alignSelf: "flex-end",
  },
  chatInput: {
    outlineStyle: "none",
    padding: 10,
    flex: 1,
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 5,
    height: 55,
  },
  chatHeaderTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -20,
  },
  chatHeaderTitleName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  replyToBubble: {
    padding: 8,
    borderRadius: 3,
    borderLeftWidth: 4,
  },
  replyToClose: {
    position: "absolute",
    right: 0,
    top: 0,
  },
});
