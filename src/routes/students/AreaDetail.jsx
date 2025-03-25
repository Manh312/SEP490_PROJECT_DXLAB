import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTime, setPeopleCount, confirmBooking, setSelectedArea } from '../../redux/slices/Booking';
import { listSlots } from '../../redux/slices/Slot';
import { fetchRooms } from '../../redux/slices/Room'; // Import fetchRooms to get room data
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlusCircleIcon, XIcon } from 'lucide-react';

const AreaDetail = () => {
  const { id } = useParams(); // This will be the areaTypeId (e.g., "1" or "2")
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy dữ liệu từ Redux store
  const { selectedTime, peopleCount, selectedArea: area } = useSelector((state) => state.booking);
  const { slots, loading: slotsLoading, error: slotsError } = useSelector((state) => state.slots);
  const { rooms, loading: roomsLoading, error: roomsError } = useSelector((state) => state.rooms);

  // State cục bộ
  const [bookingDates, setBookingDates] = useState([{ date: '', slots: [] }]);

  // Lấy danh sách slots và rooms khi component mount
  useEffect(() => {
    dispatch(listSlots());
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
    if (rooms.length === 0) return; // Chờ rooms được tải

    // Tìm area dựa trên areaTypeId
    let foundArea = null;
    for (const room of rooms) {
      if (room.area_DTO && room.area_DTO.length > 0) {
        const matchingArea = room.area_DTO.find((area) => area.areaTypeId.toString() === id);
        if (matchingArea) {
          foundArea = {
            areaTypeId: matchingArea.areaTypeId,
            name: matchingArea.areaTypeName, // Use areaTypeName as the display name
            description: room.roomDescription || 'No description available',
            image: room.images && room.images.length > 0 ? room.images[0] : 'default-image.jpg',
            type: matchingArea.areaTypeId === 1 ? 'group' : 'individual', // Map areaTypeId to type
          };
          break;
        }
      }
    }

    if (foundArea) {
      dispatch(setSelectedArea(foundArea));
      if (foundArea.type === 'group' && peopleCount < 1) {
        dispatch(setPeopleCount(1));
      }
    } else {
      toast.error('Khu vực không tồn tại!');
    }
  }, [id, rooms, dispatch, peopleCount]);

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
    updatedDates[index] = { ...updatedDates[index], date: value, slots: updatedDates[index].slots || [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleSlotChange = (index, slotId) => {
    const slot = slots.find((s) => s.slotId === slotId);
    if (!slot) return;

    if (slot.isAvailable === false || (area?.type === 'group' && slot.remainingSeats <= peopleCount)) {
      toast.error(`Slot ${slot.name || slot.slotId} không khả dụng!`);
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
        booking.slots.forEach((slotId) => {
          const slot = slots.find((s) => s.slotId === slotId);
          if (slot) {
            const price = slot.price || 10;
            total += price * (area?.type === 'group' ? peopleCount : 1);
          }
        });
      }
    });
    return total;
  };

  const isSlotDisabled = (slot) => {
    return slot.isAvailable === false || (area?.type === 'group' && slot.remainingSeats <= peopleCount);
  };

  if (roomsLoading) return <p className="text-center mt-10">Đang tải khu vực...</p>;
  if (roomsError) return <p className="text-center mt-10 text-red-500">Lỗi: {roomsError}</p>;
  if (!area) return <p className="text-center mt-10 text-red-500">Không tìm thấy khu vực.</p>;

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
        {area.type === 'group' && (
          <div className="mb-4">
            <label className="block font-medium mb-2">Số lượng người</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md mb-4"
              min="1"
              value={peopleCount}
              onChange={(e) => dispatch(setPeopleCount(Number(e.target.value)))}
            />
          </div>
        )}
        <div className="max-h-96 overflow-y-auto">
          {slotsLoading ? (
            <p>Đang tải slots...</p>
          ) : slotsError ? (
            <p className="text-red-500">Lỗi: {slotsError}</p>
          ) : (
            bookingDates.map((booking, index) => (
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
                <div className="grid grid-cols-2 gap-2">
                  {Array.isArray(slots) && slots.length > 0 ? (
                    slots.map((slot) => (
                      <label key={slot.slotId} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={slot.slotId}
                          checked={Array.isArray(booking.slots) && booking.slots.includes(slot.slotId)}
                          onChange={() => handleSlotChange(index, slot.slotId)}
                          disabled={isSlotDisabled(slot)}
                          className={isSlotDisabled(slot) ? 'cursor-not-allowed opacity-50' : ''}
                        />
                        <span>{slot.name || `Slot ${slot.slotId}`}</span>
                      </label>
                    ))
                  ) : (
                    <p>Không có slot nào khả dụng</p>
                  )}
                </div>
              </div>
            ))
          )}
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