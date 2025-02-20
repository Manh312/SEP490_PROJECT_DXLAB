import { useState } from "react";
import { useTheme } from "../../hooks/use-theme";

const ChangeProfile = () => {
  const theme = useTheme();
  const [avatar, setAvatar] = useState(null);

  const inputClasses = `w-full p-2 border rounded-lg ${
    theme === "dark" ? "border-white placeholder:text-white" : "placeholder:text-black"
  }`;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-2xl border mx-auto p-6 shadow-lg rounded-lg mt-20 mb-20">
      
      <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
        Chỉnh Sửa Hồ Sơ
      </h2>

      {/* Ảnh đại diện */}
      <div className="mb-6 text-center">
        <label className="block mb-2">Ảnh đại diện</label>
        {avatar ? (
          <img src={avatar} alt="Avatar Preview" className="w-32 h-32 mx-auto rounded-full border-2 border-gray-300 shadow-md" />
        ) : (
          <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <input type="file" className="hidden" id="avatarInput" onChange={handleImageChange} />
        <label
          htmlFor="avatarInput"
          className="mt-3 block w-fit mx-auto bg-orange-600 text-white py-1 px-4 rounded-lg cursor-pointer hover:bg-orange-700"
        >
          Chọn ảnh
        </label>
      </div>

      {/* Form chỉnh sửa thông tin */}
      <form>
        <div className="mb-4">
          <label className="block">Tên</label>
          <input type="text" className={inputClasses} placeholder="Họ và tên" />
        </div>
        <div className="mb-4">
          <label className="block">Số điện thoại</label>
          <input type="tel" className={inputClasses} placeholder="Nhập số điện thoại" />
        </div>

        <div className="mb-4">
          <label className="block">Địa chỉ</label>
          <input type="text" className={inputClasses} placeholder="Nhập địa chỉ" />
        </div>

        <button className="w-full bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700">
          Lưu Thay Đổi
        </button>
      </form>
    </div>
  );
};

export default ChangeProfile;
