import { useEffect } from "react";
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

  console.log("Slots data:", JSON.stringify(slots, null, 2));
  console.log("Error:", error);

  const handleAddSlot = () => {
    navigate("/dashboard/slot/create");
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-8 mb-10">
      <div className="w-full border border-gray-600 mx-auto rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <Clock10Icon className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              Danh Sách Slot Trong Ngày
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-x-2 shadow-md hover:bg-orange-600 transition"
              onClick={handleAddSlot}
            >
              <PlusCircle size={20} /> Thêm Slot
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-orange-500 font-medium">Đang tải danh sách slot...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 text-lg">
              Lỗi: {error.message || JSON.stringify(error)}
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock10Icon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không có slot nào.</p>
          </div>
        ) : (
          <>
            {/* Table for Desktop */}
            <div className="hidden md:block border rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b items-center bg-gray-400">
                  <tr>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">#</th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Slot ID
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Số Slot
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Giờ Bắt Đầu
                    </th>
                    <th className="px-2 py-2 text-center md:px-3 md:py-3 font-semibold text-lg uppercase tracking-wide">
                      Giờ Kết Thúc
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, index) => (
                    <tr
                      key={slot.slotId}
                      className={`border-b hover:bg-gray-400 transition-colors ${
                        theme === "dark" ? "hover:bg-gray-300" : ""
                      }`}
                    >
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{index + 1}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{slot.slotId}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">
                        {slot.slotNumber ? `Slot ${slot.slotNumber}` : "N/A"}
                      </td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{slot.startTime}</td>
                      <td className="px-2 py-3 md:px-3 md:py-4 text-center">{slot.endTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card View for Mobile */}
            <div className="block md:hidden space-y-4">
              {slots.map((slot, index) => (
                <div
                  key={slot.slotId}
                  className={`border rounded-lg p-3 sm:p-4 shadow-sm hover:bg-gray-500 transition-colors ${
                    theme === "dark" ? "hover:bg-gray-300" : ""
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">#{index + 1}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Slot ID:</span> {slot.slotId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Số Slot:</span>{" "}
                      {slot.slotNumber ? `Slot ${slot.slotNumber}` : "N/A"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Giờ Bắt Đầu:</span> {slot.startTime}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Giờ Kết Thúc:</span> {slot.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SlotList;