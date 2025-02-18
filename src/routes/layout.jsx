import { Outlet, useLocation } from "react-router-dom";
import Footer from "../layouts/home/Footer";
import Navbar from "../layouts/home/Navbar";
import { Sidebar } from "./dashboard/sidebar";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "../hooks/use-click-outside";
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import Header from "./dashboard/Header";

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const isDesktopDevice = useMediaQuery("(min-width: 768px)");
  const [collapsed, setCollapsed] = useState(!isDesktopDevice);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setCollapsed(!isDesktopDevice);
  }, [isDesktopDevice]);

  useClickOutside([sidebarRef], () => {
    if (!isDesktopDevice && !collapsed) {
      setCollapsed(true);
    };
  });

  return (
    <div>
      <Navbar className={isDashboard ? "w-[200px]" : "w-full"} />
      <div className={`w-full ${isDashboard ? "" : "max-w-7xl"} mx-auto`}>
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
            </div>
          </div>
        </div>
      </div>
      <Footer className={isDashboard ? "w-[200px]" : "w-full"} />
    </div>
  );
};

export default Layout;
