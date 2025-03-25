import { Outlet, useLocation } from "react-router-dom";
import Footer from "../layouts/home/Footer";
import Navbar from "../layouts/home/Navbar";
import { Sidebar } from "./dashboard/sidebar";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "../hooks/use-click-outside";
import { useEffect, useRef, useState } from "react";
import Header from "./dashboard/Header";
import { useAddress } from "@thirdweb-dev/react";


const TIDIO_SCRIPT_URL = import.meta.env.VITE_TIDIO_SCRIPT_URL;

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isManage = location.pathname.startsWith("/manage");

  const isDesktopDevice = useMediaQuery("(min-width: 768px)");
  const [collapsed, setCollapsed] = useState(!isDesktopDevice);
  const sidebarRef = useRef(null);

  const address = useAddress();

  useEffect(() => {
    setCollapsed(!isDesktopDevice);
  }, [isDesktopDevice]);

  useClickOutside([sidebarRef], () => {
    if (!isDesktopDevice && !collapsed) {
      setCollapsed(true);
    }
  });

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
      <Navbar className={isDashboard || isManage ? "w-[200px]" : "w-full"} />
      <div className={`w-full ${isDashboard || isManage ? "" : ""} mx-auto`}>

        <div className="flex w-full">
          {(isDashboard || isManage) && address && (
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
          )}
          <div className="flex flex-col flex-1">
            {(isDashboard || isManage) && address && (
              <Header collapsed={collapsed} setCollapsed={setCollapsed} />
            )}
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
