import { useEffect } from "react"; // Thêm useEffect để gọi API khi component mount
import { useDispatch, useSelector } from "react-redux";
import { Clock10Icon, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listSlots } from "../../redux/slices/Slot";
import { useTheme } from "../../hooks/use-theme";

const SlotList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { slots, loading, error } = useSelector((state) => state.slots);
  const theme = useTheme();

  useEffect(() => {
    dispatch(listSlots());
  }, [dispatch]);

  // const handleDelete = (id) => {
  //   if (window.confirm("Bạn có chắc chắn muốn xóa slot này?")) {
  //     dispatch(deleteSlot(id)); 
  //   }
  // };

  const handleAddSlot = () => {
    navigate("/dashboard/slot/create"); // Điều hướng sang trang CreateSlot
  };

  return (
    <div className="p-6 shadow-xl border rounded-lg transition-all mt-10 mb-20 mr-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-x-2">
          <Clock10Icon className="text-orange-500" />
          <h2 className="text-2xl font-semibold">
            Danh Sách Slot Trong Ngày
          </h2>
        </div>
        <button
          className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-orange-600 transition"
          onClick={handleAddSlot}
        >
          <PlusCircle size={20} /> Thêm Slot
        </button>
      </div>

      {loading && <p>Đang tải danh sách slot...</p>}
      {error && (
        <p className="text-red-500">
          Lỗi: {error.message || JSON.stringify(error)}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-500 text-white">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Tên Slot</th>
              <th className="p-3 text-center">Giờ Bắt Đầu</th>
              <th className="p-3 text-center">Giờ Kết Thúc</th>
              {/* <th className="p-3 text-center">Hành Động</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {slots.length > 0 ? (
              slots.map((slot, index) => (
                <tr key={slot.id} className={`${theme === "dark" ? "hover:bg-gray-300" : ""}`}>
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{slot.slot_name || `Slot ${index + 1}`}</td>
                  <td className="p-3 text-center">{slot.startTime}</td>
                  <td className="p-3 text-center">{slot.endTime}</td>
                  {/* <td className="p-3 flex justify-center gap-x-3">
                    <button
                      className="text-yellow-500 hover:text-yellow-700 transition"
                      onClick={() =>
                        navigate(`/dashboard/slot/edit/${slot.id}`) 
                      }
                    >
                      <PencilLine size={22} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 transition"
                      onClick={() => handleDelete(slot.id)}
                    >
                      <Trash size={22} />
                    </button>
                  </td> */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  Không có slot nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotList;