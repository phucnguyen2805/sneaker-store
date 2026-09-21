import { Outlet } from 'react-router-dom';

import Header from '../components/Header.jsx';

function MainLayout() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Header />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;