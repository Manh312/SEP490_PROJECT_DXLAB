import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSlot } from "../../redux/slices/Slot";

const CreateSlot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.slots);

  const [slot, setSlot] = useState({
    slot_name: "",
    start_time: "",
    end_time: "",
    break_time: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Nếu input là start_time hoặc end_time, thêm ":00" để có "HH:mm:ss"
    const formattedValue = (name === "start_time" || name === "end_time") 
      ? `${value}:00` 
      : value;
  
    setSlot({ ...slot, [name]: formattedValue });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!slot.start_time || !slot.end_time) {
      alert("Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc.");
      return;
    }
  
    const formattedSlot = {
      StartTime: slot.start_time,  // Đã có dạng "HH:mm:ss"
      EndTime: slot.end_time,
      BreakTime: parseInt(slot.break_time, 10) || 10,
    };
  
    console.log("Dữ liệu gửi lên API:", formattedSlot); // Debug
  
    try {
      await dispatch(createSlot(formattedSlot)).unwrap();
      alert("Slot đã được tạo thành công!");
      navigate("/dashboard/slot");
    } catch (err) {
      console.error("Lỗi khi tạo slot:", err);
      alert("Lỗi khi tạo slot: " + JSON.stringify(err));
    }
  };
  

  return (
    <div className="p-6 shadow-xl rounded-lg bg-white max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🕒 Tạo Slot Mới</h2>
      {loading && <p>Đang tạo slot...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        

        {/* Start Time */}
        <div>
          <label className="block font-medium">Giờ Bắt Đầu</label>
          <input
            type="time"
            name="start_time"
            value={slot.start_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block font-medium">Giờ Kết Thúc</label>
          <input
            type="time"
            name="end_time"
            value={slot.end_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Break Time */}
        <div>
          <label className="block font-medium">Thời Gian Nghỉ (phút)</label>
          <input
            type="number"
            name="break_time"
            value={slot.break_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/slot")}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo Slot"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSlot;