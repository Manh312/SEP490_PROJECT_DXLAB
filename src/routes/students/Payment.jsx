import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';

const Payment = () => {
  const { selectedArea, selectedTime, peopleCount, selectedSlot, monthRange } = useSelector(state => state.booking);

  const formatMonth = (month) => {
    if (!month) return 'Chưa chọn';
    const [year, monthNum] = month.split('-');
    return `Tháng ${monthNum} - ${year}`;
  };

  return (
    <div className="p-6 min-h-screen flex flex-col items-center mt-20 -mb-40">
      <h1 className="text-3xl font-bold text-center mb-6 ">Xác nhận Thanh Toán</h1>

      <div className="max-w-lg w-full shadow-xl border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin đặt chỗ</h2>
        <div className="space-y-3">
          <p><strong>Khu vực:</strong> {selectedArea?.name || 'Chưa chọn'}</p>
          <p><strong>Số người:</strong> {selectedArea?.type === 'group' ? peopleCount : 'Không giới hạn'}</p>
          <p><strong>Slot thời gian:</strong> {selectedSlot}</p>
          {selectedTime ? (
            <p><strong>Thời gian:</strong> {selectedTime}</p>
          ) : (
            <div className="flex items-center gap-2">
              <p><strong>Khoảng thời gian:</strong></p>
              <span>{formatMonth(monthRange.start)}</span>
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
              <span>{formatMonth(monthRange.end)}</span>
            </div>
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
