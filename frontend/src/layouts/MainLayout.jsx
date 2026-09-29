import { Outlet, useLocation } from "react-router-dom";

import ChatWidget from "../components/ChatWidget.jsx";
import Header from "../components/Header.jsx";

function MainLayout() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Header />

      <main key={location.key} className="page-transition">
        <Outlet />
      </main>

      {!isAdminRoute && <ChatWidget />}
    </div>
  );
}

export default MainLayout;
