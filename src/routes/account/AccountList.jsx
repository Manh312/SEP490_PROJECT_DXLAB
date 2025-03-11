import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { fetchAccounts, setRoleFilter, deleteAccount, addAccount } from "../../redux/slices/Account";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const AccountList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accounts, roleFilter, loading } = useSelector((state) => state.accounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const filteredAccounts = useMemo(() => {
    return roleFilter === "All"
      ? accounts
      : accounts.filter((acc) => String(acc.roleId) === String(roleFilter));
  }, [accounts, roleFilter]);

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const res = await dispatch(addAccount(file)).unwrap();
      toast.success(res.message || "Nhập file Excel thành công! ✅");
      dispatch(fetchAccounts());
    } catch (err) {
      console.error("Lỗi khi nhập file Excel:", err);
      toast.error(err?.message || "Có lỗi xảy ra khi nhập file Excel! ❌");
    }
  };

  return (
    <div className="relative p-6 shadow-xl rounded-lg bg-white max-w-5xl mx-auto">
      <ToastContainer />
      <div className="absolute top-4 right-4 flex space-x-2">
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          📥 Thêm từ Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
        </label>
        <button
          onClick={() => navigate("/dashboard/account/storage")}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-700 transition"
        >
          🗑 Thùng rác
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">📝 Danh Sách Người Dùng</h2>

      <div className="mb-4 w-40">
        <label className="block font-medium">📌 Lọc theo Vai Trò</label>
        <select
          value={roleFilter}
          onChange={(e) => dispatch(setRoleFilter(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="All">Tất Cả</option>
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {loading && <p className="text-blue-500">Đang tải dữ liệu...</p>}

      <div className="mt-4">
        <h3 className="text-lg font-semibold">
          Danh sách {roleFilter === "All" ? "Tất Cả" : roleFilter} ({filteredAccounts.length} người)
        </h3>
        <div className="border rounded-lg mt-2 max-h-80 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Họ và Tên</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Vai Trò</th>
                <th className="px-4 py-2">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((user, index) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.roleName}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => dispatch(deleteAccount(user.userId))}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Xóa
                    </button>
                    <Link
                      to={`/dashboard/account/update/${user.userId}`}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                    >
                      ✏️ Cập Nhật
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
