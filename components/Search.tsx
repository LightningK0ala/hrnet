import { View, TextInput, StyleSheet } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

type ChatProps = {
  placeholder: string;
  onChangeText: (text: string) => void;
  onPressScan?: () => void;
  hideScanner?: boolean;
  onPressClear: () => void;
  value: string;
  containerStyle?: object;
};

export default function Search({
  placeholder,
  onChangeText,
  onPressScan,
  onPressClear,
  hideScanner,
  value,
  containerStyle = {},
  ...props
}: ChatProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        ...containerStyle,
      }}
      {...props}
    >
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[
          styles.search,
          {
            backgroundColor: theme.colors.border,
            color: theme.colors.text,
          },
        ]}
      />
      {!!value && (
        <IconButton
          color="grey"
          icon="close-circle-outline"
          style={{ margin: 0, marginLeft: 5 }}
          onPress={onPressClear}
        />
      )}
      {!!navigator.permissions && !hideScanner && (
        <IconButton color="grey" icon="qrcode-scan" onPress={onPressScan} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    flex: 1,
    outlineStyle: "none",
    borderRadius: 5,
    lineHeight: 20,
    padding: 10,
  },
});
