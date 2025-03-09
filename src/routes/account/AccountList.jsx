import { useDispatch, useSelector } from "react-redux";
import { setAccounts, setRoleFilter, addAccount, deleteAccount } from "../../redux/slices/Account";

import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const AccountList = () => {
  const dispatch = useDispatch();
  const { accounts, roleFilter } = useSelector((state) => state.accounts);

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const newAccounts = XLSX.utils.sheet_to_json(sheet);

      newAccounts.forEach((acc) => {
        dispatch(
          addAccount({
            id: accounts.length + 1,
            fullName: acc.fullName || "Unknown",
            email: acc.email || "N/A",
            roleId: acc.roleId || "Student",
            avatar: acc.avatar || "https://via.placeholder.com/40",
            walletAddress: acc.walletAddress || "N/A",
          })
        );
      });
    };
  };

  const filteredAccounts =
    roleFilter === "All" ? accounts : accounts.filter((acc) => acc.roleId === roleFilter);

  return (
    <div className="relative p-6 shadow-xl rounded-lg bg-white max-w-5xl mx-auto">
      {/* Nút Import Excel */}
      <div className="absolute top-4 right-4">
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
          📥 Thêm từ Excel
          <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
        </label>
      </div>

      <h2 className="text-2xl font-semibold mb-4">📝 Danh Sách Người Dùng</h2>

      {/* Bộ lọc Role */}
      <div className="mb-4">
        <label className="block font-medium">📌 Lọc theo Vai Trò</label>
        <select
          value={roleFilter}
          onChange={(e) => dispatch(setRoleFilter(e.target.value))}
          className="w-40 px-3 py-2 border rounded-lg"
        >
          <option value="All">Tất Cả</option>
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* Danh sách người dùng */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">
          Danh sách {roleFilter === "All" ? "Tất Cả" : roleFilter} ({filteredAccounts.length} người)
        </h3>
        <div className="border rounded-lg mt-2 max-h-80 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Avatar</th>
                <th className="px-4 py-2">Họ và Tên</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Vai Trò</th>
                <th className="px-4 py-2">Ví Ethereum</th>
                <th className="px-4 py-2">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                  </td>
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.roleId}</td>
                  <td className="px-4 py-2">{user.walletAddress}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    <button
                      onClick={() => dispatch(deleteAccount(user.id))}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Xóa
                    </button>

                    <Link to={`/dashboard/account/update/${user.id}`}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">
                      Cập Nhật
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
