import { forwardRef } from "react";
import { navbarLinks, staffLinks } from "../../constants"; // Import mục dành riêng cho Staff
import { cn } from "../../utils/cn";
import PropTypes from "prop-types";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/use-theme";

export const Sidebar = forwardRef(({ collapsed, setCollapsed }, ref) => {
  const location = useLocation();
  const theme = useTheme();
  const isManage = location.pathname.startsWith("/manage"); // Kiểm tra nếu là Staff

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 transition-transform duration-150 bg-black/50",
        collapsed ? "-translate-x-full" : "translate-x-0"
      )}
      onClick={() => setCollapsed(true)}
    >
      <aside
        className={cn(
          "w-[240px] h-full bg-gray-400 shadow-lg p-3 transition-transform duration-150",
          collapsed ? "-translate-x-full" : "translate-x-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col gap-y-10 overflow-y-auto p-3">
          {!isManage
            ? navbarLinks.map((navbarLink) => (
                <nav key={navbarLink.title} className="sidebar-group">
                  <p className="sidebar-group-title">{navbarLink.title}</p>
                  {navbarLink.children.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.path}
                      className={() =>
                        cn(
                          "sidebar-item flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          theme === "dark" ? "text-white" : "text-black",
                          location.pathname === link.path
                            ? "bg-gray-500 text-white"
                            : "hover:bg-gray-300"
                        )
                      }
                      onClick={() => setCollapsed(true)}
                    >
                      <link.icon size={22} />
                      <p className="text-sm font-medium">{link.label}</p>
                    </NavLink>
                  ))}
                </nav>
              ))
            : staffLinks.map((staffLink) => (
                <nav key={staffLink.title} className="sidebar-group">
                  <p className="sidebar-group-title">{staffLink.title}</p>
                  {staffLink.children.map((link) => (
                    <NavLink
                      key={link.label}
                      to={link.path}
                      className={() =>
                        cn(
                          "sidebar-item flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                          theme === "dark" ? "text-white" : "text-black",
                          location.pathname === link.path
                            ? "bg-gray-500 text-white"
                            : "hover:bg-gray-300"
                        )
                      }
                      onClick={() => setCollapsed(true)}
                    >
                      <link.icon size={22} />
                      <p className="text-sm font-medium">{link.label}</p>
                    </NavLink>
                  ))}
                </nav>
              ))}
        </div>
      </aside>
    </div>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
  setCollapsed: PropTypes.func,
};
