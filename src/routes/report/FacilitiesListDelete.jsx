import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { removeFacilityFromArea } from '../../redux/slices/Area'; // Adjust path to your areaSlice
import { toast } from 'react-toastify';

const FacilitiesListDelete = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const dispatch = useDispatch();
  const { listfacicheck, currentReport, loading } = useSelector((state) => state.reports); 
  

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };
  
  

  // Handle facility removal
  const handleRemoveFacility = (facility) => {
    const data = {
      areaId: currentReport.areaId,
      facilityId: facility.facilityId,
      batchNumber: facility.batchNumber,
      importDate: facility.importDate,
      quantity: facility.quantity,
      status: 2,
    };
    console.log('Data before dispatch:', data);
    try {
      dispatch(removeFacilityFromArea(data));
      toast.success('Xóa thiết bị thành công!');
    } catch (error) {
      console.error('Error removing facility:', error);
      toast.error(error.message); 
    }  
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-700 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center">
            Danh Sách Thiết Bị Cần Xóa
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Display loading state */}
          {loading ? (
            <p className="text-orange-500 text-center">Đang tải dữ liệu...</p>
          ) : (
            <>
              {/* Display the list of facilities to be deleted */}
              {listfacicheck.length > 0 ? (
                <div className="grid gap-4 sm:gap-6">
                  {listfacicheck.map((facility, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      {/* Facility Info */}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">Tên Thiết Bị:</span> {facility.facilityTitle}
                        </p>
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">Tên Thiết Bị:</span> {facility.batchNumber}
                        </p>
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">Số Lượng Thiết Bị:</span> {facility.quantity}
                        </p>
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">Thuộc Khu Vực:</span> {currentReport.areaName}
                        </p>
                        <p className="text-sm sm:text-base">
                          <span className="font-semibold">Ngày Nhập:</span> {formatDate(facility.importDate)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemoveFacility(facility)}
                        className="bg-red-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-all disabled:bg-red-300 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                        <span className="text-sm sm:text-base">Xóa</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">
                  Không có thiết bị nào để hiển thị.
                </p>
              )}

              {/* Back Button */}
              <div className="flex justify-center mt-6">
                <Link
                  to={`/dashboard/report/${id}`}
                  className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-x-2 hover:from-gray-600 hover:to-gray-800 transition-all shadow-md text-sm sm:text-base font-normal"
                >
                  <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Quay Lại
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilitiesListDelete;