import { useTheme } from "../../hooks/use-theme";

const About = () => {
  const theme = useTheme();
  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Về Chúng Tôi</h1>
        <p className="text-lg mb-10">DXLAB - Hệ thống không gian phòng LAB hàng đầu tại FPT University</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p>DXLAB hướng đến việc cung cấp môi trường làm việc hiện đại, tiện nghi và sáng tạo cho sinh viên và giảng viên.</p>
        </div>
        <img src="https://source.unsplash.com/500x300/?team,office" alt="About Us" className="rounded-lg shadow-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
        {["Không gian hiện đại", "Hỗ trợ tận tình", "Mạng lưới kết nối rộng rãi"].map((item, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2">{item}</h3>
            <p>Mô tả ngắn về lợi ích của không gian làm việc DXLAB.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;