import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTime, confirmBooking, setSelectedArea } from '../../redux/slices/Booking';
import { fetchAvailableSlots } from '../../redux/slices/Booking';
import { fetchRooms } from '../../redux/slices/Room';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlusCircleIcon, XIcon } from 'lucide-react';

const AreaDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy dữ liệu từ Redux store
  const { selectedTime, selectedArea: area } = useSelector((state) => state.booking);
  const { slotsLoading, slotsError } = useSelector((state) => state.booking);
  const { rooms, loading: roomsLoading, error: roomsError } = useSelector((state) => state.rooms);

  // State cục bộ
  const [bookingDates, setBookingDates] = useState([{ date: '', slots: [] }]);
  const [fetchedSlots, setFetchedSlots] = useState({});

  // Lấy danh sách rooms khi component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Đồng bộ bookingDates với selectedTime
  useEffect(() => {
    if (Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      const normalizedSelectedTime = selectedTime.map((booking) => ({
        ...booking,
        slots: Array.isArray(booking.slots) ? booking.slots : [],
      }));
      setBookingDates(normalizedSelectedTime);
    }
  }, [selectedTime, bookingDates]);

  // Tìm area dựa trên typeName (areaTypeId) từ rooms
  useEffect(() => {
    if (rooms.length === 0) return;

    let foundArea = null;
    for (const room of rooms) {
      if (room.area_DTO && room.area_DTO.length > 0) {
        const matchingArea = room.area_DTO.find((area) => area.areaTypeId.toString() === id);
        if (matchingArea) {
          foundArea = {
            areaTypeId: matchingArea.areaTypeId,
            name: matchingArea.areaTypeName,
            description: room.roomDescription || 'No description available',
            image: room.images && room.images.length > 0 ? room.images[0] : 'default-image.jpg',
            type: matchingArea.areaTypeId === 1 ? 'group' : 'individual',
            roomId: room.roomId,
          };
          break;
        }
      }
    }

    if (foundArea) {
      dispatch(setSelectedArea(foundArea));
    } else {
      toast.error('Khu vực không tồn tại!');
    }
  }, [id, rooms, dispatch, ]);

  // Fetch available slots whenever the date changes
  useEffect(() => {
    bookingDates.forEach((booking) => {
      if (booking.date && area) {
        dispatch(fetchAvailableSlots({
          roomId: area.roomId,
          areaTypeId: area.areaTypeId,
          bookingDate: booking.date,
        })).then((action) => {
          if (action.meta.requestStatus === 'fulfilled') {
            setFetchedSlots((prev) => ({
              ...prev,
              [booking.date]: action.payload.data,
            }));
          }
        });
      }
    });
  }, [bookingDates, area, dispatch]);

  const addBookingDate = () => {
    const newBooking = { date: '', slots: [] };
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

  const handleDateChange = (index, value) => {
    const updatedDates = [...bookingDates];
    updatedDates[index] = { ...updatedDates[index], date: value, slots: [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleSlotChange = (index, slotId) => {
    const date = bookingDates[index].date;
    const slotsForDate = fetchedSlots[date] || [];
    const slot = slotsForDate.find((s) => s.slotId === slotId);
    if (!slot) return;

    if (slot.availableSlots === 0 ) {
      toast.error(`Slot ${slot.slotId} không khả dụng!`);
      return;
    }

    const updatedDates = [...bookingDates];
    const currentBooking = updatedDates[index];
    const currentSlots = Array.isArray(currentBooking.slots) ? currentBooking.slots : [];

    let newSlots;
    if (currentSlots.includes(slotId)) {
      newSlots = currentSlots.filter((s) => s !== slotId);
    } else {
      newSlots = [...currentSlots, slotId];
    }

    updatedDates[index] = { ...currentBooking, slots: newSlots };
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
            total += price * setSelectedArea?.type
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
    return matchingSlot.availableSlot === 0 ;
  };

  if (roomsLoading) return <p className="text-center mt-10">Đang tải khu vực...</p>;
  if (roomsError) return <p className="text-center mt-10 text-orange-500">Lỗi: {roomsError}</p>;
  if (!area) return <p className="text-center mt-10 text-orange-500">Không tìm thấy khu vực.</p>;

  return (
    <div className="p-6 min-h-screen flex flex-col md:flex-row gap-6 mt-15 max-w-7xl mx-auto">
      <div className="md:w-1/2 mr-10">
        <h1 className="text-3xl font-bold text-center mb-6">{area.name}</h1>
        <img src={area.image} alt={area.name} className="w-full h-64 object-cover rounded-md mb-6" />
        <p className="text-center mb-4">{area.description}</p>
      </div>

      <div className="md:w-1/2 p-6 rounded-lg border shadow-md mt-15 mb-60 ml-10">
        <h2 className="text-xl font-bold mb-4">Đăng ký đặt chỗ</h2>
        <div className="mb-4">
          <p className="break-words text-base">
            Bạn đã chọn khu vực: <strong>{area.name}</strong>
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {bookingDates.map((booking, index) => (
            <div key={index} className="mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
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
              {slotsLoading && <p>Đang tải slots...</p>}
              {slotsError && <p className="text-red-500">Lỗi: {slotsError.message || slotsError}</p>}
              {!slotsLoading && !slotsError && booking.date && (
                <div className="grid grid-cols-2 gap-2">
                  {fetchedSlots[booking.date] && fetchedSlots[booking.date].length > 0 ? (
                    fetchedSlots[booking.date].map((slot) => (
                      <div
                        key={slot.slotId}
                        className={`group relative flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${
                          slot.availableSlot === 0
                            ? 'bg-gray-100 text-orange-500 cursor-not-allowed'
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
        <button
          className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition w-40"
          onClick={handleConfirmBooking}
        >
          Xác nhận đặt chỗ
        </button>
      </div>
    </div>
  );
};

export default AreaDetail;