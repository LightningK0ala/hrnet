import * as React from "react";
import { Router } from "./components/Router";
import { RootSiblingParent } from "react-native-root-siblings";
import { Provider as PaperProvider } from "react-native-paper";
import { getTheme } from "./theme";
import { state } from "./state";
import { useSnapshot } from "valtio";

export default function () {
  const snap = useSnapshot(state);
  return (
    <PaperProvider theme={getTheme(snap.theme)}>
      <RootSiblingParent>
        <Router />
      </RootSiblingParent>
    </PaperProvider>
  );
}
