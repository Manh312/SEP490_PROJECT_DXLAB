import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTime, confirmBooking, fetchAvailableSlots, fetchCategoryInRoom } from '../../redux/slices/Booking';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlusCircleIcon, XIcon } from 'lucide-react';

const AreaDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedTime } = useSelector((state) => state.booking);
  const { slotsError, categoryInRoom } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading } = useSelector((state) => state.rooms);
  const [bookingDates, setBookingDates] = useState([{ date: new Date().toISOString().split('T')[0], slots: [] }]);
  const [fetchedSlots, setFetchedSlots] = useState({});
  const [selectedArea, setSelectedArea] = useState(null);
  const [groupAreas, setGroupAreas] = useState([]);

  useEffect(() => {
    if (selectedRoom?.roomId) {
      dispatch(fetchCategoryInRoom({ id: selectedRoom.roomId }));
    }
  }, [dispatch, selectedRoom]);

  useEffect(() => {
    if (categoryInRoom?.data && categoryInRoom.data.length > 0) {
      const groupAreasList = categoryInRoom.data.filter((item) => item.value[0].areaCategory === 2);
      setGroupAreas(groupAreasList);

      const area = categoryInRoom.data.find((item) => item.value[0].areaTypeId.toString() === id);
      if (area) {
        setSelectedArea({
          ...area,
          name: area.value[0].areaTypeName,
          description: area.value[0].areaDescription,
          type: area.value[0].areaCategory === 1 ? 'individual' : 'group',
        });
      } else {
        toast.error('Không tìm thấy khu vực!');
        navigate(-1);
      }
    }
  }, [categoryInRoom, id, navigate]);

  useEffect(() => {
    if (Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      setBookingDates(selectedTime);
      selectedTime.forEach((booking) => {
        if (booking.date && !fetchedSlots[booking.date]) {
          fetchSlotsForDate(booking.date);
        }
      });
    }
  }, [selectedTime, fetchedSlots]);

  useEffect(() => {
    if (selectedArea && selectedRoom) {
      bookingDates.forEach((booking) => {
        if (booking.date && !fetchedSlots[booking.date]) {
          fetchSlotsForDate(booking.date);
        }
      });
    }
  }, [selectedArea, selectedRoom, bookingDates, fetchedSlots]);

  const fetchSlotsForDate = (date) => {
    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
      toast.error(`Ngày ${date} không hợp lệ! Vui lòng chọn ngày từ hôm nay trở đi.`);
      return;
    }

    if (selectedArea && selectedRoom) {
      dispatch(fetchAvailableSlots({
        roomId: selectedRoom.roomId,
        areaTypeId: selectedArea.value[0].areaTypeId,
        bookingDate: date,
      })).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          setFetchedSlots((prev) => ({
            ...prev,
            [date]: action.payload.data,
          }));
        } else {
          toast.error(slotsError?.message || `Không thể tải slot cho ngày ${date}`);
        }
      });
    }
  };

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

    let newSlots = currentSlots.includes(slotId)
      ? currentSlots.filter((s) => s !== slotId)
      : [...currentSlots, slotId];

    updatedDates[bookingIndex] = { ...currentBooking, slots: newSlots };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleDateChange = (index, value) => {
    const updatedDates = [...bookingDates];
    updatedDates[index] = { ...updatedDates[index], date: value, slots: [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
    fetchSlotsForDate(value);
  };

  const addBookingDate = () => {
    const newBooking = { date: new Date().toISOString().split('T')[0], slots: [] };
    const updatedDates = [...bookingDates, newBooking];
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
    fetchSlotsForDate(newBooking.date);
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

    if (bookingDates.some((item) => !item.date)) {
      toast.error('Vui lòng chọn ngày trước khi xác nhận!');
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
            // Lấy giá từ selectedArea.value[0].price thay vì fix cứng 10
            const price = selectedArea?.value?.[0]?.price || 10; // Fallback về 10 nếu không có giá
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
    return !matchingSlot || matchingSlot.availableSlot === 0;
  };

  const handleAreaChange = (e) => {
    const selected = groupAreas.find((item) => item.value[0].areaTypeId.toString() === e.target.value);
    if (selected) {
      setSelectedArea({
        ...selected,
        name: selected.value[0].areaTypeName,
        description: selected.value[0].areaDescription,
        type: 'group',
      });
      bookingDates.forEach((booking) => fetchSlotsForDate(booking.date));
    }
  };

  if (roomLoading) return <p className="text-center mt-10">Đang tải thông tin phòng...</p>;
  if (!selectedRoom) return <p className="text-center mt-10 text-orange-500">Vui lòng chọn phòng trước.</p>;
  if (slotsError) return <p className="text-center mt-10 text-orange-500">Lỗi: {slotsError?.message || slotsError}</p>;
  if (!selectedArea) return <p className="text-center mt-10 text-orange-500">Đang tải thông tin khu vực...</p>;

  return (
    <div className="p-6 min-h-screen flex flex-col md:flex-row gap-6 mt-15 max-w-7xl mx-auto">
      <div className="md:w-1/2 mr-10">
        <h1 className="text-3xl font-bold text-center mb-6">{selectedArea.key.title}</h1>
        <img
          src={`https://localhost:9999${selectedArea.key.image}`}
          alt={selectedArea.name}
          className="w-full h-64 object-cover rounded-md mb-6"
        />
        <p className="text-center mb-4">{selectedArea.key.categoryDescription}</p>
      </div>

      <div className="md:w-1/2 p-6 rounded-lg border shadow-md mt-15 mb-60 ml-10">
        <h2 className="text-xl font-bold mb-4">Đăng ký đặt chỗ</h2>
        <div className="mb-4">
          <p className="break-words text-base">
            Bạn đã chọn khu vực: <strong>{selectedArea.key.title}</strong>
          </p>
        </div>
        {selectedArea.value[0].areaCategory === 2 && groupAreas.length > 0 && (
          <div>
            <label className="block font-medium mb-2">Chọn khu vực nhóm bạn mong muốn:</label>
            <select
              value={selectedArea.value[0].areaTypeId}
              onChange={handleAreaChange}
              className="w-full p-2 mb-4 border rounded-md"
            >
              {groupAreas.map((area) => (
                <option key={area.value[0].areaTypeId} value={area.value[0].areaTypeId}>
                  {area.value[0].areaTypeName}
                </option>
              ))}
            </select>
          </div>
        )}
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
              {!slotsError && booking.date ? (
                <div className="grid grid-cols-2 gap-2">
                  {fetchedSlots[booking.date] !== undefined ? (
                    fetchedSlots[booking.date].length > 0 ? (
                      fetchedSlots[booking.date].map((slot) => (
                        <div
                          key={slot.slotId}
                          className={`group relative flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${
                            slot.availableSlot === 0 ? 'text-orange-500 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={slot.slotId}
                            checked={Array.isArray(booking.slots) && booking.slots.includes(slot.slotId)}
                            onChange={() => handleSlotChange(index, slot.slotId)}
                            disabled={isSlotDisabled(slot, booking.date)}
                            className={`${slot.availableSlot === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          />
                          <span className={`${slot.availableSlot === 0 ? 'line-through' : ''}`}>
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
                      <p className="text-orange-500 w-full">Không có slot nào khả dụng cho ngày này</p>
                    )
                  ) : booking.date < new Date().toISOString().split('T')[0] ? (
                    <p className="text-orange-500 w-full">Chọn ngày hợp lệ để xem slot</p>
                  ) : (
                    <p className="text-orange-500 w-full">Đang tải slot...</p>
                  )}
                </div>
              ) : (
                <p className="text-orange-500 w-full">Vui lòng chọn ngày để xem các slot khả dụng</p>
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
        <div className="flex justify-between">
          <button
            className="bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition w-60"
            onClick={() => navigate(`/room/${selectedRoom.roomId}`)}
          >
            Quay lại danh sách khu vực
          </button>
          <button
            className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition w-40"
            onClick={handleConfirmBooking}
          >
            Xác nhận đặt chỗ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaDetail;