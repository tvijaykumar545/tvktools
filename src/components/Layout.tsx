import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

const Layout = () => {
  useSessionTimeout();
  return (
    <div className="flex min-h-screen flex-col scanline">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
