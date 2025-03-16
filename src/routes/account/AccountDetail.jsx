import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const AccountDetail = () => {
  const { accounts, loading } = useSelector((state) => state.accounts);
  console.log(accounts);

  const { id } = useParams();

  console.log(accounts);

  if (!id) {
    return <p className="text-red-500 text-center mt-10">Lỗi: ID không hợp lệ!</p>;
  }

  const account = accounts.find((f) => f.userId === parseInt(id));

  if (loading) {
    return (
      <div className="text-center py-4 mt-10">
        <p className="text-orange-500 text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!account) {
    return <p className="text-red-500 text-center mt-10">Không tìm thấy tài khoản có ID {id}!</p>;
  }

  return (
    <div className="max-w-3xl mx-auto transform transition-all duration-500 ease-in-out hover:scale-[1.02]">
        <div className="max-w-2xl mx-auto mt-20 mb-40 p-6 rounded-lg shadow-xl border transition-all animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-orange-500">
            Chi Tiết Tài khoản Người Dùng
          </h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <tbody>
                <tr className="border-b bg-gray-500">
                  <td className="px-4 py-3 font-semibold text-white w-40">ID Người Dùng:</td>
                  <td className="px-4 py-3 text-white">{account.userId}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Họ Và Tên:</td>
                  <td className="px-4 py-3">{account.fullName}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Email:</td>
                  <td className="px-4 py-3">{account.email}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-3 font-semibold bg-gray-200 text-gray-700">Vai trò:</td>
                  <td className="px-4 py-3">{account.roleName}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    </div>

  );
}

export default AccountDetail;
