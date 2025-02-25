import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../../hooks/use-theme";
import {Link} from "react-router-dom";
import { FaAddressBook, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

const ViewProfile = () => {
  const [user, setUser] = useState(null);
  const theme = useTheme();

  console.log(user);
  

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    // Loading state hoặc thông báo chưa đăng nhập
    return (
      <>
      <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <p className="text-center text-lg font-semibold">Đang tải thông tin...</p>
      </div>
      </>
    );
  }


  return (
    <div className={`min-h-screen p-6 ${theme === "dark" ? "bg-black text-white" : ""}`}>
      <div className="max-w-4xl mx-auto border rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center">
          <img
            src={user.photoURL || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full shadow-lg mb-4 border-4 border-orange-500"
          />
          <h1 className="text-3xl font-bold">{user.displayName || "Người dùng"}</h1>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="flex items-center">
              <FaEnvelope className="mr-2 text-orange-500" />
              <span>
                <span className="font-semibold">Email:</span> {user.email || "Chưa cập nhật"}
              </span>
            </p>
            <p className="flex items-center">
              <FaPhoneAlt className="mr-2 text-orange-500" />
              <span className="font-normal">
                Số điện thoại: {user.phoneNumber || "Chưa cập nhật"}
              </span>
            </p>
            <p className="flex items-center">
              <FaAddressBook className="mr-2 text-orange-500" />
              <span className="font-normal">Địa chỉ: Chưa cập nhật</span>
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Cài đặt tài khoản</h2>
          <Link
            to={"/change-profile"}
            className="inline-flex items-center bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition transform hover:scale-105"
          >
            Chỉnh sửa hồ sơ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
