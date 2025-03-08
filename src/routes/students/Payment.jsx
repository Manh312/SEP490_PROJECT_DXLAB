import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { slots } from '../../constants';

const Payment = () => {
  const { selectedArea, selectedTime, peopleCount } = useSelector((state) => state.booking);

  console.log('Selected Time in Payment:', selectedTime); 

  const calculateTotalPrice = () => {
    let total = 0;
    selectedTime.forEach((booking) => {
      if (Array.isArray(booking.slots)) {
        booking.slots.forEach((slotId) => {
          const slot = slots.find((s) => s.id === slotId);
          if (slot) {
            total += slot.price * (selectedArea?.type === 'group' ? peopleCount : 1);
          }
        });
      }
    });
    return total;
  };

  // Hàm format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }); // Định dạng: DD/MM/YYYY
  };

  return (
    <div className="p-6 min-h-screen flex flex-col items-center mt-20 -mb-40">
      <h1 className="text-3xl font-bold text-center mb-6">Xác nhận Thanh Toán</h1>
      <div className="max-w-lg w-full shadow-xl border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin đặt chỗ</h2>
        <div className="space-y-3">
          <p>
            <strong>Khu vực:</strong> {selectedArea?.name || 'Chưa chọn'}
          </p>
          {selectedArea?.type === 'group' && (
            <p>
              <strong>Số người:</strong> {peopleCount}
            </p>
          )}
          {selectedTime.length > 0 ? (
            <div>
              <p>
                <strong>Thời gian & Slot:</strong>
              </p>
              <ul className="list-disc pl-5">
                {selectedTime.map((item, index) => (
                  <li key={index}>
                    {formatDate(item.date)} -{' '}
                    {Array.isArray(item.slots) && item.slots.length > 0
                      ? item.slots
                          .map((slotId) => {
                            const slot = slots.find((s) => s.id === slotId);
                            return slot ? slot.name : slotId;
                          })
                          .join(', ')
                      : 'Chưa chọn'}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              <strong>Thời gian & Slot:</strong> Chưa chọn
            </p>
          )}
          <p>
            <strong>Tổng chi phí:</strong>{' '}
            <span className="text-orange-500">{calculateTotalPrice()} DXLAB Coin</span>
          </p>
        </div>
        <div className="flex flex-col gap-4 mt-6">
          <Link
            to={'/booked-seats'}
            className="w-full px-6 py-3 text-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            onClick={() => toast.success('Thanh toán thành công')}
          >
            Xác nhận Thanh Toán
          </Link>
          <Link
            to={`/rooms/`}
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