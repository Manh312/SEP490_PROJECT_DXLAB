import { Outlet, useLocation } from "react-router-dom";
import Footer from "../layouts/home/Footer";
import Navbar from "../layouts/home/Navbar";
import { Sidebar } from "./dashboard/sidebar";
import { useEffect, useState } from "react";
import Header from "./dashboard/Header";

const TIDIO_SCRIPT_URL = import.meta.env.VITE_TIDIO_SCRIPT_URL;

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!collapsed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [collapsed]);

  useEffect(() => {
    if (TIDIO_SCRIPT_URL) {
      const script = document.createElement("script");
      script.src = TIDIO_SCRIPT_URL;
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div>
      <Navbar className={isDashboard ? "w-[200px]" : "w-full"} />
      <div className={`w-full ${isDashboard ? "" : "max-w-7xl"} mx-auto`}>
        <div className="flex w-full">
          {isDashboard && (
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
          <div className="flex flex-col flex-1">
            {isDashboard && <Header collapsed={collapsed} setCollapsed={setCollapsed} />}
            <div className="flex-1">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <Footer className={isDashboard ? "w-[200px]" : "w-full"} />
    </div>
  );
};

export default Layout;
