import { useState } from "react";
import * as XLSX from "xlsx";

const CreateAccount = () => {
  const [account, setAccount] = useState({ fullName: "", email: "", role: "Staff" });
  const [accounts, setAccounts] = useState([]);
  const [filterRole, setFilterRole] = useState("All");

  const handleChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleAddAccount = () => {
    if (!account.fullName || !account.email) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setAccounts([...accounts, { ...account, id: accounts.length + 1 }]);
    setAccount({ fullName: "", email: "", role: "Staff" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const formattedData = jsonData.map((row, index) => ({
        id: accounts.length + index + 1,
        fullName: row["Full Name"] || "Unknown",
        email: row["Email"] || "No Email",
        role: row["Role"] || "Staff",
      }));

      setAccounts([...accounts, ...formattedData]);
    };
    reader.readAsArrayBuffer(file);
  };

  const displayedList = filterRole === "All" ? accounts : accounts.filter((acc) => acc.role === filterRole);

  return (
    <div className="p-6 shadow-xl rounded-lg bg-white max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📝 Tạo Tài Khoản</h2>

      {/* Form Add Account */}
      <div className="space-y-3 mb-4">
        <input
          type="text"
          name="fullName"
          value={account.fullName}
          onChange={handleChange}
          placeholder="Họ và Tên"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="email"
          name="email"
          value={account.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <select
          name="role"
          value={account.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
        <button
          onClick={handleAddAccount}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600 transition"
        >
          ➕ Thêm Tài Khoản
        </button>
      </div>

      {/* Upload Excel */}
      <div className="mb-4">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="w-full px-3 py-2 border rounded-lg" />
      </div>

      {/* Filter Role */}
      <div className="mb-4">
        <select
          name="filterRole"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="All">Tất Cả</option>
          <option value="Staff">Staff</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* List Accounts */}
      <div className="border rounded-lg mt-2 max-h-60 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Họ và Tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {displayedList.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.fullName}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateAccount;
