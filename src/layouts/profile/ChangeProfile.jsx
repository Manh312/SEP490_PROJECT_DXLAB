import { useTheme } from "../../hooks/use-theme";

const ChangeProfile = () => {
  const theme = useTheme();
  const borderColor = theme === "dark" ? "border-white" : "";
  const placeholderColor = theme === "dark" ? "placeholder:text-white" : "placeholder:text-black";

  return (
    <div className={`max-w-2xl border ${borderColor} mx-auto p-6 shadow-lg rounded-lg mt-20 mb-20`}>
      <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Chỉnh Sửa Hồ Sơ</h2>
      <form>
        <div className="mb-4">
          <label className="block">Tên</label>
          <input type="text" className={`w-full p-2 border ${borderColor} rounded-lg ${placeholderColor}`} placeholder="Nhập email" />
        </div>
        <div className="mb-4">
          <label className="block">Email</label>
          <input type="email" className={`w-full p-2 border ${borderColor} rounded-lg ${placeholderColor}`} placeholder="Nhập email" />
        </div>
        <div className="mb-4">
          <label className="block">Giới thiệu</label>
          <textarea className={`w-full p-2 border ${borderColor} rounded-lg ${placeholderColor}`} placeholder="Viết đôi lời về bản thân"></textarea>
        </div>
        <div className="mb-6">
          <label className="block">Ảnh đại diện</label>
          <input type="file" className={`w-full p-2 border ${borderColor} rounded-lg`} />
        </div>
        <button className="w-full bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700">Lưu Thay Đổi</button>
      </form>
    </div>
  );
}

export default ChangeProfile;
