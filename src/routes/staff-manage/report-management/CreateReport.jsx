import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createReport } from "../../../redux/slices/Report";

const CreateReport = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [reportDescription, setReportDescription] = useState("");
  const [facilityQuantity, setFacilityQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  // Định dạng ngày hiện tại
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reportDescription.trim()) {
      toast.error("Vui lòng nhập mô tả báo cáo!");
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        bookingDetailId: id,
        reportDescription,
        facilityQuantity: facilityQuantity,
      };

      await dispatch(createReport(reportData)).unwrap();
      toast.success("Tạo báo cáo thành công!");
      navigate(`/manage/reports`);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi hủy
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="py-4 px-2 sm:px-4 lg:px-6 xl:px-8 mb-10">
      <div className="w-full max-w-3xl mx-auto border border-gray-300 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 bg-white">
        {/* Header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            Tạo Đơn Báo Cáo
          </h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Vui lòng điền thông tin để tạo báo cáo mới
          </p>
        </div>

        {/* Thông tin báo cáo */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã Đặt Chỗ
              </label>
              <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                #{id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày Tạo
              </label>
              <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-800">
                {currentDate}
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Nội dung báo cáo */}
          <div className="mb-6">
            <label
              htmlFor="reportDescription"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nội Dung Báo Cáo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Nhập nội dung báo cáo..."
              className="w-full p-4 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-y bg-gray-50"
              rows="8"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số Lượng Thiết Bị
            </label>
            <input
              id="facilityQuantity"
              type="number"
              value={facilityQuantity}
              onChange={(e) => setFacilityQuantity(e.target.value)}
              placeholder="Nhập số lượng thiết bị..."
              className="w-full p-4 border border-gray-300 rounded-lg text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
              min="0"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm sm:text-base transition-all border border-gray-300"
              disabled={loading}
            >
              Quay Lại
            </button>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm sm:text-base transition-all flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
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
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Đang tạo...
                </>
              ) : (
                "Gửi Báo Cáo"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReport;