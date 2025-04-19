import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateSlot } from "../../redux/slices/Slot";
import { toast } from "react-toastify";
import { Clock, Check, ArrowLeft, Calendar } from "lucide-react";

const UpdateSlot = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { slots, loading, error } = useSelector((state) => state.slots);

  const [formData, setFormData] = useState({
    slotName: "",
    startTime: "",
    endTime: "",
    status: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null);

  useEffect(() => {
    const slotId = parseInt(id);

    const slot = slots.find((s) => s.slotId === slotId);
    if (slot) {
      setCurrentSlot(slot);
      setFormData({
        slotName: slot.slotName || "",
        startTime: slot.startTime || "",
        endTime: slot.endTime || "",
        status: slot.status !== undefined ? slot.status : true,
      });
    } else {
      // If slot is not found, show an error and redirect
      toast.error("Không tìm thấy slot với ID này!");
      navigate("/dashboard/slots");
    }
  }, [slots, dispatch, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedSlotName = formData.slotName.trim();
    const trimmedStartTime = formData.startTime.trim();
    const trimmedEndTime = formData.endTime.trim();

    if (!trimmedSlotName) {
      toast.error("Tên slot là bắt buộc!");
      return;
    }
    if (!trimmedStartTime) {
      toast.error("Thời gian bắt đầu là bắt buộc!");
      return;
    }
    if (!trimmedEndTime) {
      toast.error("Thời gian kết thúc là bắt buộc!");
      return;
    }

    const slotData = {
      slotName: trimmedSlotName,
      startTime: trimmedStartTime,
      endTime: trimmedEndTime,
      status: formData.status,
    };

    try {
      await dispatch(updateSlot({ id: parseInt(id), slotData })).unwrap();
      toast.success("Cập nhật slot thành công!");
      navigate("/dashboard/slot"); // Adjust the route as per your app's routing
    } catch (err) {
      toast.error(err.message || "Lỗi khi cập nhật slot");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!currentSlot) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-600 text-lg animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 mb-10 bg-gray-100 min-h-screen">
      <div className="w-full max-w-4xl mx-auto rounded-2xl border bg-white shadow-lg p-6 sm:p-8 transition-all duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Clock className="h-8 w-8 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Cập Nhật Slot {id}</h2>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slot Name */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-orange-500" /> Tên Slot{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                name="slotName"
                value={formData.slotName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Nhập tên slot"
                required
              />
            </div>

            {/* Start Time */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-500" /> Thời Gian Bắt Đầu{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
                required
              />
            </div>

            {/* End Time */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-500" /> Thời Gian Kết Thúc{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
                required
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <span className="flex items-center">
                  <Check className="mr-2 h-5 w-5 text-orange-500" /> Trạng Thái{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
              >
                <option value={true}>Hoạt động</option>
                <option value={false}>Không hoạt động</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/slot")} // Adjust the route as per your app's routing
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="text-sm sm:text-base font-medium">Quay Lại</span>
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
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
                  <Check className="mr-2 h-5 w-5" /> Cập Nhật
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded-lg mt-6 text-center text-sm sm:text-base">
            Lỗi: {error.message || "Đã xảy ra lỗi không xác định"}
          </p>
        )}
      </div>
    </div>
  );
};

export default UpdateSlot;