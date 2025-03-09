import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Payment = () => {
  const { selectedArea, selectedTime, peopleCount } = useSelector((state) => state.booking);
  const { slots, loading, error } = useSelector((state) => state.slots);

  console.log('Selected Time in Payment:', selectedTime);
  console.log('Slots in Payment:', slots);

  const calculateTotalPrice = () => {
    let total = 0;
    if (!Array.isArray(selectedTime)) return total;

    selectedTime.forEach((booking) => {
      if (Array.isArray(booking.slots)) {
        booking.slots.forEach((slotId) => {
          const slot = slots.find((s) => s.slotId === slotId); // Sử dụng slotId thay vì id
          if (slot) {
            const price = slot.price || 10; // Giả định giá mặc định nếu không có price
            total += price * (selectedArea?.type === 'group' ? peopleCount : 1);
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

  // Hàm lấy tên slot từ slotId
  const getSlotNames = (slotIds) => {
    if (!Array.isArray(slotIds) || slotIds.length === 0) return 'Chưa chọn';
    return slotIds
      .map((slotId) => {
        const slot = slots.find((s) => s.slotId === slotId); // Sử dụng slotId
        return slot ? slot.name || `Slot ${slot.slotId}` : slotId;
      })
      .join(', ');
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải dữ liệu slots...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Lỗi: {error}</div>;
  }

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
          {Array.isArray(selectedTime) && selectedTime.length > 0 ? (
            <div>
              <p>
                <strong>Thời gian & Slot:</strong>
              </p>
              <ul className="list-disc pl-5">
                {selectedTime.map((item, index) => (
                  <li key={index}>
                    {formatDate(item.date)} - {getSlotNames(item.slots)}
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
            to={'/rooms/'}
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