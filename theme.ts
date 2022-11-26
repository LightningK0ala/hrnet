import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  Theme,
} from "@react-navigation/native";
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from "react-native-paper";
import merge from "deepmerge";

const CombinedBaseDefaultTheme = merge(
  PaperDefaultTheme,
  NavigationDefaultTheme
);
const CombinedBaseDarkTheme = merge(PaperDarkTheme, NavigationDarkTheme);

// DEBUG
// @ts-ignore
window.defaultTheme = NavigationDefaultTheme;
// @ts-ignore
window.darkTheme = NavigationDarkTheme;

const DefaultThemeCustomizations = {
  colors: {
    // primary: "#e6bf54",
    green: "green",
    red: "red",
  },
};

const DarkThemeCustomizations = {
  colors: {
    // primary: "#FFE190",
    background: "#1f1f1f",
    green: "lightgreen",
    red: "#ff7f7f",
  },
};

// Customizations
export const CombinedDefaultTheme = merge(
  CombinedBaseDefaultTheme,
  DefaultThemeCustomizations
) as Theme;
export const CombinedDarkTheme = merge(
  CombinedBaseDarkTheme,
  DarkThemeCustomizations
) as Theme;

type ThemeType = "dark" | "default";

export function getTheme(theme: ThemeType) {
  switch (theme) {
    case "dark":
      return CombinedDarkTheme;
    default:
      return CombinedDefaultTheme;
  }
}
