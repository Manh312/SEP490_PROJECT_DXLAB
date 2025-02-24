import { Outlet, useLocation } from "react-router-dom";
import Footer from "../layouts/home/Footer";
import Navbar from "../layouts/home/Navbar";
import { Sidebar } from "./dashboard/sidebar";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "../hooks/use-click-outside";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import Header from "./dashboard/Header";

const TIDIO_SCRIPT_URL = import.meta.env.VITE_TIDIO_SCRIPT_URL;

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

<<<<<<< HEAD
  const isDesktopDevice = useMediaQuery("(min-width: 768px)");
  const [collapsed, setCollapsed] = useState(!isDesktopDevice);
  const sidebarRef = useRef(null);

=======
>>>>>>> devevlop
  useEffect(() => {
    setCollapsed(!isDesktopDevice);
  }, [isDesktopDevice]);

  useClickOutside([sidebarRef], () => {
    if (!isDesktopDevice && !collapsed) {
      setCollapsed(true);
    };
  });

  useEffect(() => {
    const scriptUrl = import.meta.env.VITE_TIDIO_SCRIPT_URL;
    if (!scriptUrl) {
      console.error("TIDIO script URL is missing from environment variables.");
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
<<<<<<< HEAD
        <div className={cn("transision-[margin] duration-300", collapsed ? "md:ml-[30px]" : "md:ml-[30px]")}>
          <div className="flex w-full px-6">
            {isDashboard && (
              <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
              />

            )}
            {isDashboard && <div className="w-[1px] bg-gray-700 mx-4" />}
            <div className="flex flex-col flex-1">
              {isDashboard && <Header collapsed={collapsed} setCollapsed={setCollapsed} />}
              <div className="flex-1">
                <Outlet />
              </div>
=======
        <div className="flex w-full">
          {isDashboard && (
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
          <div className="flex flex-col flex-1">
            {isDashboard && <Header collapsed={collapsed} setCollapsed={setCollapsed} />}
            <div className="flex-1">
              <Outlet />
>>>>>>> devevlop
            </div>
          </div>
        </div>
      </div>
      <Footer className={isDashboard ? "w-[200px]" : "w-full"} />
    </div>
  );
};

export default Layout;
