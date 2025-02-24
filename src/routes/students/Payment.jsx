import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Payment = () => {
  const { selectedArea, selectedTime, peopleCount, selectedSlots } = useSelector(state => state.booking);

  // console.log("selectedTime:", selectedTime);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center mt-20 -mb-40">
      <h1 className="text-3xl font-bold text-center mb-6 ">Xác nhận Thanh Toán</h1>

      <div className="max-w-lg w-full shadow-xl border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin đặt chỗ</h2>
        <div className="space-y-3">
          <p><strong>Khu vực:</strong> {selectedArea?.name || 'Chưa chọn'}</p>

          {/* Chỉ hiển thị số lượng người nếu là nhóm */}
          {selectedArea?.type === 'group' && (
            <p><strong>Số người:</strong> {peopleCount}</p>
          )}

          {/* Hiển thị danh sách slot đã chọn */}
          <p>
            <strong>Slot đã chọn:</strong> {selectedSlots.length > 0 ? selectedSlots.map(slot => `Slot ${slot}`).join(', ') : 'Chưa chọn'}
          </p>

          {/* Hiển thị thời gian */}
          {selectedTime && (
            <p><strong>Thời gian:</strong> {new Date(selectedTime).toLocaleDateString('vi-VN')}</p>
          )}

        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Link to={'/booked-seats'} className="w-full px-6 py-3 text-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
            Xác nhận Thanh Toán
          </Link>
          <Link
            to="/areas"
            className="w-full px-6 py-3 text-center bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            Quay lại Khu Vực chọn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Payment;
