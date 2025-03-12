import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSlot } from "../../redux/slices/Slot";
import { toast } from "react-toastify";
import { Clock } from "lucide-react";

const CreateSlot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.slots);

  const [slot, setSlot] = useState({
    start_time: "",
    end_time: "",
    break_time: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nếu input là start_time hoặc end_time, thêm ":00" để có "HH:mm:ss"
    const formattedValue =
      name === "start_time" || name === "end_time" ? `${value}:00` : value;

    setSlot({ ...slot, [name]: formattedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slot.start_time || !slot.end_time) {
      toast.error("Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc.");
      return;
    }

    const formattedSlot = {
      StartTime: slot.start_time, // Đã có dạng "HH:mm:ss"
      EndTime: slot.end_time,
      BreakTime: parseInt(slot.break_time, 10) || 10,
    };

    console.log("Dữ liệu gửi lên API:", formattedSlot); // Debug

    dispatch(createSlot(formattedSlot))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
        navigate("/dashboard/slot");
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <div className="p-6 shadow-xl border rounded-lg max-w-lg mx-auto mt-10 mb-30">
      <div className="text-2xl font-semibold mb-4 flex items-center">
        <Clock className="mr-2" />
        <span>Tạo Slot Mới</span>
      </div>
      {loading && <p>Đang tạo slot...</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Start Time */}
        <div>
          <label className="block font-medium">Giờ Bắt Đầu</label>
          <input
            type="time"
            name="start_time"
            value={slot.start_time}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-400"
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
            className="w-full px-3 py-2 border rounded-lg hover:bg-gray-400"
            required
          />
        </div>

        {/* Break Time */}
        <div>
          <label className="block font-medium">Thời Gian Nghỉ (phút)</label>
          <input
            type="number"
            min={1}
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
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
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