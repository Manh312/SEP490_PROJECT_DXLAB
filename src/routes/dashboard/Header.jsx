import { ChevronsLeft, Search } from "lucide-react";
import PropTypes from "prop-types";
import { useTheme } from "../../hooks/use-theme";

const Header = ({ setCollapsed }) => {
  const { theme } = useTheme();

  return (
    <header className="relative z-10 flex h-[60px] items-center justify-between px-4">
      <div className="flex items-center gap-x-3">
        <button
          className={`btn-ghost size-10 ${theme === "dark" ? "hover:bg-neutral-700" : "hover:bg-neutral-300"} `}
          onClick={() => setCollapsed(false)} // Mở sidebar
        >
          <ChevronsLeft className={`${theme === "dark" ? "text-white" : "text-black"}`} size={24}/>
        </button>
        <div className="input">
          <Search size={20} className={` ${theme === "dark" ? "bg-dark text-white" : "bg-white text-black"}`} />
          <input
            type="text"
            placeholder="Search..."
            name="search"
            id="search"
            className={`w-full bg-transparent outline-none transition-colors
              ${theme === "dark" ? "placeholder:text-white" : "placeholder:text-black"}
            `}          
          />
        </div>
      </div>
    </header>
  );
}

export default Header;

Header.propTypes = {
  setCollapsed: PropTypes.func,
};