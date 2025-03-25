import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBooking, confirmBooking } from '../../redux/slices/Booking';
import { useEffect } from 'react';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedArea, selectedTime, peopleCount, bookingLoading, bookingError, bookingSuccess } = useSelector((state) => state.booking);
  const { slots, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);

  console.log('Selected Time in Payment:', selectedTime);
  console.log('Slots in Payment:', slots);

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = 0;
    if (!Array.isArray(selectedTime)) return total;

    selectedTime.forEach((booking) => {
      if (Array.isArray(booking.slots)) {
        booking.slots.forEach((slotId) => {
          const slot = slots.find((s) => s.slotId === slotId);
          if (slot) {
            const price = slot.price || 10;
            total += price * (selectedArea?.type === 'group' ? peopleCount : 1);
          }
        });
      }
    });
    return total;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get slot names from slotIds
  const getSlotNames = (slotIds) => {
    if (!Array.isArray(slotIds) || slotIds.length === 0) return 'Chưa chọn';
    return slotIds
      .map((slotId) => {
        const slot = slots.find((s) => s.slotId === slotId);
        return slot ? slot.name || `Slot ${slot.slotId}` : slotId;
      })
      .join(', ');
  };

  // Handle payment confirmation
  const handleConfirmPayment = () => {
    if (!selectedArea || !selectedArea.roomId || !selectedArea.areaTypeId) {
      toast.error('Thông tin khu vực không hợp lệ!');
      return;
    }

    if (!Array.isArray(selectedTime) || selectedTime.length === 0) {
      toast.error('Vui lòng chọn thời gian và slot trước khi thanh toán!');
      return;
    }

    const bookingData = {
      roomId: selectedArea.roomId,
      areaTypeId: selectedArea.areaTypeId,
      bookingDates: selectedTime.map((booking) => ({
        slotId: booking.slots, // Array of slotIds
        date: booking.date,
      })),
    };

    // Dispatch the createBooking thunk
    dispatch(createBooking(bookingData));
  };

  // Handle API response
  useEffect(() => {
    if (bookingSuccess) {
      toast.success('Thanh toán thành công!');
      dispatch(confirmBooking()); // Reset booking state
      navigate('/booked-seats');
    }
    if (bookingError) {
      toast.error(`Lỗi: ${bookingError}`);
    }
  }, [bookingSuccess, bookingError, navigate, dispatch]);

  if (slotsLoading) {
    return <div className="p-6 text-center">Đang tải dữ liệu thông tin đặt...</div>;
  }

  if (slotsError) {
    return <div className="p-6 text-center text-red-500">Lỗi: {slotsError}</div>;
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
          <button
            onClick={handleConfirmPayment}
            className="w-full px-6 py-3 text-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Đang xử lý...' : 'Xác nhận Thanh Toán'}
          </button>
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