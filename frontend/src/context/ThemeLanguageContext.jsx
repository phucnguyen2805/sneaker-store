import { useMemo, useState } from "react";

import { ThemeLanguageContext } from "./themeLanguageContext.js";

const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem("siteLanguage");

  return savedLanguage === "en" ? "en" : "vi";
};

function ThemeLanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  );

  return (
    <ThemeLanguageContext.Provider value={value}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export default ThemeLanguageProvider;
