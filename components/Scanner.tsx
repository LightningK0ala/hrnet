import { useNavigation } from "@react-navigation/native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

export default function Scanner({ route }) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const navigation = useNavigation();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // function toggleCameraType() {
  //   setType((current) =>
  //     current === CameraType.back ? CameraType.front : CameraType.back
  //   );
  // }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={(result) => {
          if (result.type == "qr") {
            const returnRoute = route.params?.navigateBackTo;
            if (returnRoute) {
              // NOTE: not using callback param because it is not recommended
              // https://stackoverflow.com/questions/44223727/react-navigation-goback-and-update-parent-state
              navigation.navigate(returnRoute, { scanResult: result.data });
            } else {
              navigation.goBack();
            }
          }
        }}
      >
        <View style={styles.header}>
          <IconButton
            icon="close"
            onPress={() => navigation.goBack()}
            color="white"
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.opaque} />
          <View style={{ flexDirection: "row" }}>
            <View style={styles.opaque} />
            <View style={styles.pinhole} />
            <View style={styles.opaque} />
          </View>
          <View style={styles.opaque} />
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  camera: {
    flex: 1,
  },
  opaque: {
    flex: 1,
    backgroundColor: "black",
    opacity: 0.8,
  },
  pinhole: {
    width: 300,
    height: 300,
    borderWidth: 4,
    borderColor: "white",
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
