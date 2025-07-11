  import { forwardRef } from "react";
  import { navbarLinks, staffLinks } from "../../constants"; // Import danh sách liên kết
  import { cn } from "../../utils/cn";
  import PropTypes from "prop-types";
  import { NavLink, useLocation } from "react-router-dom";
  import { useTheme } from "../../hooks/use-theme";

  export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { theme } = useTheme();
    const location = useLocation();

    // Kiểm tra nếu đường dẫn bắt đầu bằng "/manage"
    const isManage = location.pathname.startsWith("/manage");

    // Chọn danh sách liên kết phù hợp
    const links = isManage ? staffLinks : navbarLinks;

    return (
      <aside 
        ref={ref} 
        className={cn( 
          collapsed ? "md:w-[70px] md:items-center" : "md:w-[250px]", 
          collapsed ? "max-md:-left-full" : "max-md:left-0", 
          theme === "light" ? "bg-white text-black" : "bg-dark text-white",  
          "transition-colors duration-300"
        )}
      >
        <div className="flex w-full flex-col gap-y-10 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
          {links.map((group) => (
            <nav key={group.title} className={cn("sidebar-group", collapsed && "md:items-center")}>
              <p 
                className={cn(
                  "sidebar-group-title", 
                  collapsed && "md:w-[45px]",
                  theme === "light" ? "text-black" : "text-white"
                  )}
              >
                {group.title}
                {group.children.map((link) => (
                  <NavLink 
                    key={link.label} 
                    to={link.path} 
                    className={cn(
                      "sidebar-item", 
                      collapsed && "md:w-[45px]",
                      theme === "light" ? "text-black" : "text-white"
                    )}
                  >
                    <link.icon 
                      size={22} 
                      className={cn(
                        "flex-shrink-0",
                        theme === "light" ? "text-black" : "text-white"
                      )}
                    />
                    {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                  </NavLink>
                ))}
              </p>
            </nav>
          ))}
        </div>
      </aside>
    );
  });

  Sidebar.displayName = "Sidebar";

  Sidebar.propTypes = {
    collapsed: PropTypes.bool,
  };
