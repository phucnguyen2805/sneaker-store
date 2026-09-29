import { useContext } from "react";

import { ThemeLanguageContext } from "./themeLanguageContext.js";

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);

  if (!context) {
    throw new Error(
      "useThemeLanguage phải được sử dụng bên trong ThemeLanguageProvider.",
    );
  }

  return context;
}
