import AppRouter from "./router/AppRouter.jsx";
import ThemeLanguageProvider from "./context/ThemeLanguageContext.jsx";

function App() {
  return (
    <ThemeLanguageProvider>
      <AppRouter />
    </ThemeLanguageProvider>
  );
}

export default App;
