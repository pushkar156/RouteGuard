import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children, activeScreen, setActiveScreen }) => {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
