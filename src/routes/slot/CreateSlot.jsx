import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSlot } from "../../redux/slices/Slot";
import { toast } from "react-toastify";
import { Clock, Check, ArrowLeft, Calendar } from "lucide-react";

const CreateSlot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.slots);

  const [slot, setSlot] = useState({
    timeSlot: "", // Thêm trường timeSlot
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

    if (!slot.start_time || !slot.end_time || !slot.timeSlot) {
      toast.error("Vui lòng nhập đầy đủ time slot, giờ bắt đầu và kết thúc.");
      return;
    }

    const formattedSlot = {
      TimeSlot: slot.timeSlot, // Thêm TimeSlot vào payload
      StartTime: slot.start_time,
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tạo slot...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 mb-10 min-h-screen">
      <div className="w-full max-w-4xl mx-auto rounded-2xl border shadow-lg p-6 sm:p-8 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Clock className="h-8 w-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl font-semibold">Tạo Slot Mới</h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Start Time */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 !text-orange-500" /> Giờ Bắt Đầu{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="time"
                name="start_time"
                value={slot.start_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-400 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                required
              />
            </div>

            {/* End Time */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 !text-orange-500" /> Giờ Kết Thúc{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="time"
                name="end_time"
                value={slot.end_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-400 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                required
              />
            </div>

            {/* Time Slot */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-500" /> Time Slot{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="number"
                name="timeSlot"
                value={slot.timeSlot}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 placeholder-gray-500"
                placeholder="Nhập time slot"
                required
              />
            </div>

            {/* Break Time */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-500" /> Thời Gian Nghỉ (phút){" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="number"
                min={1}
                name="break_time"
                value={slot.break_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 placeholder-gray-500"
                placeholder="Nhập thời gian nghỉ (phút)"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/slot")}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="text-sm sm:text-base font-medium">Quay lại</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" /> Tạo Slot
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSlot;