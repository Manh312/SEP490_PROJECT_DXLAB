import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSlot } from "../../redux/slices/Slot";
import { toast } from "react-toastify";
import { Clock, Check, ArrowLeft, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const CreateSlot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.slots);

  const [slot, setSlot] = useState({
    timeSlot: "",
    start_time: "",
    end_time: "",
    break_time: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      TimeSlot: slot.timeSlot,
      StartTime: slot.start_time,
      EndTime: slot.end_time,
      BreakTime: parseInt(slot.break_time, 10) || 10,
    };

    console.log("Dữ liệu gửi lên API:", formattedSlot);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 mt-50 mb-200">
        <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
        <p className="text-orange-500 font-medium text-base sm:text-lg">
          Đang tạo slot...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 sm:px-6 lg:px-8 overflow-x-hidden">
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <div className="flex flex-row justify-center items-center p-4 gap-2">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white text-center">
              Tạo Slot Mới
            </h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Time Slot */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="timeSlot"
                      value={slot.timeSlot}
                      onChange={handleChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      placeholder="Nhập time slot"
                      required
                    />
                  </div>
                </div>
              </motion.div>
              {/* Giờ Kết Thúc */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Giờ Kết Thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={slot.end_time}
                      onChange={handleChange}
                      className="w-full bg-gray-400 mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Giờ Bắt Đầu */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Giờ Bắt Đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={slot.start_time}
                      onChange={handleChange}
                      className="w-full bg-gray-400 mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Thời Gian Nghỉ */}
              <motion.div
                className="relative bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-md hover:shadow-lg hover:bg-orange-50 transition-all duration-300"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs sm:text-sm font-bold text-gray-500 truncate">
                      Thời Gian Nghỉ (phút) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      name="break_time"
                      value={slot.break_time}
                      onChange={handleChange}
                      className="w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg border border-gray-300 text-gray-800 text-sm sm:text-base font-normal focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition duration-150 ease-in-out"
                      placeholder="Nhập thời gian nghỉ (phút)"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
            variants={itemVariants}
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard/slot")}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:bg-gray-600 transition-all shadow-md text-sm sm:text-base font-normal"
            >
              <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-orange-600 hover:to-orange-800 transition-all shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed text-sm sm:text-base font-normal"
            >
              {loading ? (
                <svg
                  className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
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
                  <Check size={14} className="sm:w-4 sm:h-4" /> Tạo Slot
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateSlot;