import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, setSelectedTime, confirmBooking } from '../../redux/slices/Booking';
import { fetchAvailableSlots, fetchCategoryInRoom } from '../../redux/slices/Booking';
import { fetchRooms } from '../../redux/slices/Room';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { XIcon, PlusCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewAreas = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isModalOpen, selectedArea, selectedTime } = useSelector((state) => state.booking);
  const { slotsLoading, slotsError } = useSelector((state) => state.booking);
  const { categoryInRoom} = useSelector((state) => state.booking);
  const { rooms} = useSelector((state) => state.rooms);

  const [bookingDates, setBookingDates] = useState([{ date: new Date().toISOString().split('T')[0], slots: [] }]);
  const [fetchedSlots, setFetchedSlots] = useState({});

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  useEffect(() => {
    if (rooms.length > 0) {
      const findRoom = rooms.find((room) => room.roomId === parseInt(id));
      if (findRoom) {
        dispatch(fetchCategoryInRoom({ id: findRoom.roomId }));
      }
    }
  }, [rooms, dispatch, id]);

  useEffect(() => {
    bookingDates.forEach((booking) => {
      if (booking.date && selectedArea) {
        let roomId = null;
        for (const room of rooms) {
          if (room.area_DTO && room.area_DTO.length > 0) {
            const matchingArea = room.area_DTO.find((area) => area.areaTypeId === selectedArea.value[0].areaTypeId);
            if (matchingArea) {
              roomId = room.roomId;
              break;
            }
          }
        }

        if (roomId) {
          dispatch(fetchAvailableSlots({
            roomId: roomId,
            areaTypeId: selectedArea.value[0].areaTypeId,
            bookingDate: booking.date,
          })).then((action) => {
            if (action.meta.requestStatus === 'fulfilled') {
              setFetchedSlots((prev) => ({
                ...prev,
                [booking.date]: action.payload.data,
              }));
            } else {
              toast.error(slotsError.message);
            }
          });
        }
      }
    });
  }, [bookingDates, selectedArea, rooms, dispatch]);

  useEffect(() => {
    if (Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      setBookingDates(selectedTime);
    }
  }, [selectedTime, bookingDates]);

  const handleSlotChange = (bookingIndex, slotId) => {
    const date = bookingDates[bookingIndex].date;
    const slotsForDate = fetchedSlots[date] || [];
    const slot = slotsForDate.find((s) => s.slotId === slotId);
    if (!slot) return;

    if (slot.availableSlot === 0) {
      toast.error(`Slot ${slot.slotId} không khả dụng!`);
      return;
    }

    const updatedDates = [...bookingDates];
    const currentBooking = updatedDates[bookingIndex];
    const currentSlots = Array.isArray(currentBooking.slots) ? currentBooking.slots : [];

    let newSlots;
    if (currentSlots.includes(slotId)) {
      newSlots = currentSlots.filter((s) => s !== slotId);
    } else {
      newSlots = [...currentSlots, slotId];
    }

    updatedDates[bookingIndex] = { ...currentBooking, slots: newSlots };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleDateChange = (index, value) => {
    const updatedDates = [...bookingDates];
    updatedDates[index] = { ...updatedDates[index], date: value, slots: [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const addBookingDate = () => {
    const newBooking = { date: new Date().toISOString().split('T')[0], slots: [] };
    const updatedDates = [...bookingDates, newBooking];
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const removeBookingDate = (index) => {
    if (bookingDates.length === 1) {
      toast.error('Phải có ít nhất một ngày đặt chỗ!');
      return;
    }
    const updatedDates = bookingDates.filter((_, i) => i !== index);
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (bookingDates.some((item) => !item.date)) {
      toast.error('Vui lòng chọn ngày trước khi xác nhận!');
      return;
    }

    if (bookingDates.some((item) => item.date < today)) {
      toast.error('Ngày đặt không hợp lệ! Vui lòng chọn lại ngày khác.');
      return;
    }

    if (bookingDates.some((item) => !Array.isArray(item.slots) || item.slots.length === 0)) {
      toast.error('Vui lòng chọn ít nhất một slot trước khi xác nhận!');
      return;
    }

    dispatch(setSelectedTime(bookingDates));
    dispatch(confirmBooking(bookingDates));
    navigate('/confirm-payment');
  };

  const calculateTotalPrice = () => {
    let total = 0;
    bookingDates.forEach((booking) => {
      if (Array.isArray(booking.slots)) {
        const slotsForDate = fetchedSlots[booking.date] || [];
        booking.slots.forEach((slotId) => {
          const slot = slotsForDate.find((s) => s.slotId === slotId);
          if (slot) {
            const price = slot.price || 10;
            total += price;
          }
        });
      }
    });
    return total;
  };

  const isSlotDisabled = (slot, date) => {
    const slotsForDate = fetchedSlots[date] || [];
    const matchingSlot = slotsForDate.find((s) => s.slotId === slot.slotId);
    if (!matchingSlot) return true;
    return matchingSlot.availableSlot === 0;
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">DXLAB Co-working Space</h1>
      <p className="text-center mb-8">Chọn khu vực phù hợp với nhu cầu làm việc của bạn</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {categoryInRoom?.data?.map((area, index) => (
          <div key={index} className="p-6 border rounded-lg shadow-lg transition-transform transform hover:scale-105">
            <img
              src={`https://localhost:9999${area.key.image}`}
              alt={area.value.areaTypeName}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-2xl font-semibold mb-2">{area.key.title}</h2>
            <p>{area.key.categoryDescription.slice(0, 100)}...</p>
            <div>
              <button
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                onClick={() => {
                  dispatch(openModal({
                    ...area,
                    name: area.value.areaTypeName,
                    description: area.value.areaDescription,
                    type: area.value.areaCategory === 1 ? 'individual' : 'group'
                  }));
                  setBookingDates([{ date: new Date().toISOString().split('T')[0], slots: [] }]);
                }}
              >
                Chọn
              </button>{" "}
              <Link to={`/area/${area.value.areaTypeId}`} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition">
                Chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-300 text-black p-6 rounded-lg shadow-lg lg:w-[600px] md:w-[600px] sm:w-[500px] w-xs relative">
            <button className="absolute top-2 right-2" onClick={() => dispatch(closeModal())}>
              <XIcon className="h-6 w-6 text-black" />
            </button>
            <>
              <h2 className="text-2xl font-bold mb-4 text-center">Đặt Lịch Tới DXLAB</h2>
              <div className="flex justify-between">
                <p className="break-words text-base">
                  Bạn đã chọn khu vực: <strong>{selectedArea?.key.title}</strong>
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {bookingDates.map((booking, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:text-white"
                        value={booking.date}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                      />
                      <button
                        onClick={() => removeBookingDate(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <label className="block font-medium mb-2 mt-2">Chọn Slot:</label>
                    {!slotsLoading && !slotsError && booking.date ? (
                      <div className="grid grid-cols-2 gap-2">
                        {fetchedSlots[booking.date] && fetchedSlots[booking.date].length > 0 ? (
                          fetchedSlots[booking.date].map((slot) => (
                            <div
                              key={slot.slotId}
                              className={`group relative flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${
                                slot.availableSlot === 0
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={slot.slotId}
                                checked={Array.isArray(booking.slots) && booking.slots.includes(slot.slotId)}
                                onChange={() => handleSlotChange(index, slot.slotId)}
                                disabled={isSlotDisabled(slot, booking.date)}
                                className={`${
                                  slot.availableSlot === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                }`}
                              />
                              <span
                                className={`${
                                  slot.availableSlot === 0 ? 'line-through' : ''
                                }`}
                              >
                                Slot {slot.slotNumber} ({slot.availableSlot} chỗ trống)
                              </span>
                              {slot.availableSlot === 0 && (
                                <span className="absolute left-1/2 transform -translate-x-1/2 -top-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                                  Hết chỗ
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>Không có slot nào khả dụng cho ngày này</p>
                        )}
                      </div>
                    ) : (
                      <p>Vui lòng chọn ngày để xem các slot khả dụng</p>
                    )}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-orange-500 mt-2 mb-5" onClick={addBookingDate}>
                <PlusCircleIcon className="h-5 w-5" /> Thêm ngày
              </button>
              <div className="mb-4">
                <p className="text-lg">
                  Tổng chi phí: <span className="text-orange-500">{calculateTotalPrice()} DXLAB Coin</span>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  onClick={(e) => handleConfirmBooking(e)}
                >
                  Xác nhận
                </button>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAreas;