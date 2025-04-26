import { useSelector, useDispatch } from 'react-redux';
    import { Link, useNavigate } from 'react-router-dom';
    import { toast } from 'react-toastify';
    import { createBooking, confirmBooking, resetBookingStatus } from '../../redux/slices/Booking'; // Adjust path as needed
    import { useEffect, useState } from 'react';

    const Payment = () => {
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const [isModalOpen, setIsModalOpen] = useState(false);

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

      const getSlotNames = (slots, date) => {
        if (!Array.isArray(slots) || slots.length === 0) return 'Chưa chọn';
        const slotsForDate = fetchedSlots[date] || [];
        return slots
          .map(({ slotNumber }) => {
            const slot = slotsForDate.find((s) => s.slotNumber === slotNumber);
            console.log(slot);
            return slot ? `Slot ${slot.slotNumber}` : `Slot ${slotNumber}`;
          })
          .join(', ');
      };

      const handleConfirmPayment = async () => {
        setIsModalOpen(false); // Close modal after agreeing to terms
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
            slotId: Array.isArray(booking.slots)
              ? booking.slots.map((slot) => slot.slotId)
              : [],
          })),
        };

        try {
          const result = await dispatch(createBooking(bookingData)).unwrap();
          console.log('createBooking result:', result);
          const bookingId = result.data?.bookingId;
          if (!bookingId) {
            throw new Error('Không tìm thấy bookingId trong kết quả');
          }
          toast.success('Thanh toán thành công!');
          dispatch(confirmBooking([]));
          navigate(`/booked-seats/${bookingId}`);
        } catch (error) {
          console.error('Booking error:', error);
          toast.error(error.message || 'Có lỗi xảy ra khi thanh toán!');
        }
      };

      const handleOpenModal = () => {
        setIsModalOpen(true);
      };

      const handleCloseModal = () => {
        setIsModalOpen(false);
      };

      if (roomsLoading) {
        return <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>;
      }

      if (roomsError) {
        return <div className="p-6 text-center text-red-500">Lỗi: {roomsError}</div>;
      }

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Xác Nhận Thanh Toán</h1>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-700">Thông Tin Đặt Chỗ</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Phòng:</span>
                  <span className="text-gray-800">{selectedRoom?.roomName || 'Chưa chọn'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Dịch vụ:</span>
                  <span className="text-gray-800">
                    {selectedArea?.key?.categoryId === 2 ? 'Khu vực nhóm' : 'Khu vực cá nhân'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Khu vực:</span>
                  <span className="text-gray-800">
                    {selectedArea?.name || selectedArea?.value?.[0]?.areaTypeName || 'Chưa chọn'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 block mb-2">Thời gian & Slot:</span>
                  {Array.isArray(selectedTime) && selectedTime.length > 0 ? (
                    <ul className="list-disc pl-5 text-gray-800">
                      {selectedTime.map((item, index) => (
                        <li key={index}>
                          {formatDate(item.date)} - {getSlotNames(item.slots, item.date)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-800">Chưa chọn</span>
                  )}
                </div>
                <div className="flex justify-between border-t pt-4">
                  <span className="font-medium text-gray-600">Tổng chi phí:</span>
                  <span className="text-orange-500 font-semibold">{calculateTotalPrice()} DXL</span>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-8">
                <button
                  onClick={handleOpenModal}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
                >
                  Xác Nhận Thanh Toán
                </button>
                <Link
                  to={`/area/${selectedArea?.value?.[0]?.areaTypeId || selectedArea?.areaTypeId}`}
                  className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 text-center font-semibold"
                >
                  Quay Lại Chọn Khu Vực
                </Link>
              </div>
            </div>
          </div>

          {/* Modal for Payment Terms */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-400 rounded-2xl max-w-lg w-full p-6 relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold mb-4">Điều Khoản Thanh Toán</h2>
                <div className="max-h-96 overflow-y-auto space-y-4">
                  <p>
                    <strong>1. Chấp Nhận Điều Khoản:</strong> Bằng việc nhấn "Đồng Ý và Thanh Toán", bạn đồng ý với các điều khoản và điều kiện được nêu dưới đây.
                  </p>
                  <p>
                    <strong>2. Thanh Toán:</strong> Tổng chi phí là {calculateTotalPrice()} DXL sẽ được thanh toán ngay sau khi xác nhận. Không hoàn tiền sau khi thanh toán hoàn tất.
                  </p>
                  <p>
                    <strong>3. Thông Tin Đặt Chỗ:</strong> Bạn chịu trách nhiệm đảm bảo thông tin phòng, khu vực, và thời gian đặt chỗ là chính xác.
                  </p>
                  <p>
                    <strong>4. Hủy Đặt Chỗ:</strong> Đặt chỗ có thể bị hủy nếu vi phạm chính sách sử dụng của chúng tôi.
                  </p>
                  <p>
                    <strong>5. Trách Nhiệm:</strong> Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ.
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
                  >
                    Đồng Ý và Thanh Toán
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

export default Payment;