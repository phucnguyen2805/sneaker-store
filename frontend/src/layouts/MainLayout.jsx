import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header.jsx";

function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Header />

      <main key={location.key} className="page-transition">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
