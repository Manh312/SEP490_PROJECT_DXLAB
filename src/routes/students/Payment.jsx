import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBooking, confirmBooking, resetBookingStatus, fetchBookingHistory } from '../../redux/slices/Booking';
import { useEffect } from 'react';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedArea, selectedTime = [] } = useSelector((state) => {
    console.log('Redux state.booking:', state.booking);
    return state.booking || {};
  });
  const { selectedRoom, loading: roomsLoading, error: roomsError } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(resetBookingStatus());
  }, [dispatch]);

  const fetchedSlots = selectedArea?.fetchedSlots || {};

  const calculateTotalPrice = () => {
    let total = 0;
    if (!Array.isArray(selectedTime) || selectedTime.length === 0) {
      console.log('No selectedTime available:', selectedTime);
      return total;
    }

    const pricePerSlot = selectedArea?.value?.[0]?.price || 10;

    selectedTime.forEach((booking) => {
      if (!booking || !Array.isArray(booking.slots) || booking.slots.length === 0) {
        console.log('Invalid booking entry:', booking);
        return;
      }
      console.log(`Processing date: ${booking.date}, slots: ${booking.slots}`);
      total += booking.slots.length * pricePerSlot;
    });
    return total;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSlotNames = (slotIds, date) => {
    if (!Array.isArray(slotIds) || slotIds.length === 0) return 'Chưa chọn';
    const slotsForDate = fetchedSlots[date] || [];
    return slotIds
      .map((slotId) => {
        const slot = slotsForDate.find((s) => s.slotId === slotId);
        return slot ? `Slot ${slot.slotNumber}` : `Slot ${slotId}`;
      })
      .join(', ');
  };

  const handleConfirmPayment = async () => {
    console.log('Before booking - selectedRoom:', selectedRoom, 'selectedArea:', selectedArea, 'selectedTime:', selectedTime);

    if (!selectedRoom || !selectedRoom.roomId) {
      toast.error('Thông tin phòng không hợp lệ!');
      return;
    }

    const areaTypeId = selectedArea?.value?.[0]?.areaTypeId || selectedArea?.areaTypeId;
    if (!areaTypeId) {
      toast.error('Thông tin khu vực không hợp lệ!');
      return;
    }

    if (!Array.isArray(selectedTime) || selectedTime.length === 0) {
      toast.error('Vui lòng chọn thời gian và slot trước khi thanh toán!');
      return;
    }

    const bookingData = {
      roomID: selectedRoom.roomId,
      areaTypeId: areaTypeId,
      bookingTimes: selectedTime.map((booking) => ({
        bookingDate: new Date(booking.date).toISOString(),
        slotId: Array.isArray(booking.slots) ? booking.slots : [],
      })),
    };

    try {
      const result = await dispatch(createBooking(bookingData)).unwrap(); // Use .unwrap() for cleaner promise handling
      console.log('createBooking result:', result);
      // await dispatch(fetchBookingHistory()).unwrap();
      toast.success('Thanh toán thành công!');
      dispatch(confirmBooking([])); // Reset selectedTime
      navigate('/booked-seats');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi thanh toán!');
    }
  };

  if (roomsLoading) {
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;
  }

  if (roomsError) {
    return <div className="p-6 text-center text-red-500">Lỗi: {roomsError}</div>;
  }

  return (
    <div className="p-6 min-h-screen flex flex-col items-center mt-20 -mb-40">
      <h1 className="text-3xl font-bold text-center mb-6">Xác nhận Thanh Toán</h1>
      <div className="max-w-lg w-full shadow-xl border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin đặt chỗ</h2>
        <div className="space-y-3">
          <p>
            <strong>Phòng:</strong> {selectedRoom?.roomName || 'Chưa chọn'}
          </p>
          <p>
            <strong>Loại khu vực:</strong>{' '}
            {selectedArea?.key?.categoryId === 2 ? 'Khu vực nhóm' : 'Khu vực cá nhân'}
          </p>
          <p>
            <strong>Khu vực:</strong>{' '}
            {selectedArea?.name || selectedArea?.value?.[0]?.areaTypeName || 'Chưa chọn'}
          </p>

          {Array.isArray(selectedTime) && selectedTime.length > 0 ? (
            <div>
              <p>
                <strong>Thời gian & Slot:</strong>
              </p>
              <ul className="list-disc pl-5">
                {selectedTime.map((item, index) => (
                  <li key={index}>
                    {formatDate(item.date)} - {getSlotNames(item.slots, item.date)}
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
          >
            Xác nhận Thanh Toán
          </button>
          <Link
            to={`/area/${selectedArea?.value?.[0]?.areaTypeId || selectedArea?.areaTypeId}`}
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