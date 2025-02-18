import { Link } from "react-router-dom";
import { services } from "../../constants";
import { useTheme } from "../../hooks/use-theme";

const Services = () => {
  const theme = useTheme();
  return (
    <div className={`relative mt-20 pb-20 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="text-center">
        <h2 className="text-orange-500 text-2xl font-medium uppercase">Các loại hình dịch vụ</h2>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10 space-x-10">
        {services.map((service, index) => (
          <div 
            key={index} 
            className="border border-neutral-600 rounded-lg p-8 w-full sm:w-[320px] lg:w-[380px] text-center"
          >
            <h3 className="text-xl">{service.text}</h3>
            <p className="text-neutral-400 mt-2">{service.description}</p>
            <button className="mt-6 bg-gradient-to-r from-orange-500 to-orange-700 text-white px-6 py-3 rounded-lg hover:opacity-90 transition">
              <Link to={"/about"}>Khám phá ngay</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
