import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTime, confirmBooking, fetchAvailableSlots, fetchCategoryInRoom } from '../../redux/slices/Booking';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PlusCircleIcon, XIcon, ChevronLeft, ChevronRight } from 'lucide-react';

// Ảnh mặc định nếu không có ảnh từ API
const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

// Hàm lấy ngày hiện tại theo múi giờ cục bộ
const getCurrentDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

const AreaDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedTime } = useSelector((state) => state.booking);
  const { categoryInRoom } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading } = useSelector((state) => state.rooms);

  const [bookingDates, setBookingDates] = useState([{ date: getCurrentDate(), slots: [] }]);
  const [fetchedSlots, setFetchedSlots] = useState({});
  const [selectedArea, setSelectedArea] = useState(null);
  const [groupAreas, setGroupAreas] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const today = getCurrentDate();
  const baseUrl = "https://localhost:9999";

  // Fetch category in room when selectedRoom changes
  useEffect(() => {
    if (selectedRoom?.roomId) {
      dispatch(fetchCategoryInRoom({ id: selectedRoom.roomId }));
    }
  }, [dispatch, selectedRoom]);

  // Set selectedArea and groupAreas when categoryInRoom changes
  useEffect(() => {
    if (categoryInRoom?.data?.length > 0) {
      // Làm phẳng danh sách value để lấy tất cả khu vực nhóm
      const groupAreasList = categoryInRoom.data
        .filter((item) => item.key.categoryId === 2) // Lọc categoryId = 2 (khu vực nhóm)
        .flatMap((item) =>
          item.value
            .filter((valueItem) => valueItem.areaCategory === 2)
            .map((valueItem) => ({
              key: item.key,
              value: [valueItem],
            }))
        );
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

  // Fetch slot cho tất cả ngày khi selectedArea thay đổi hoặc bookingDates thay đổi
  useEffect(() => {
    if (selectedArea && selectedRoom && bookingDates.length > 0) {
      fetchAllSlots();
    }
  }, [selectedArea, bookingDates, selectedRoom]);

  // Auto-slide effect for images
  useEffect(() => {
    if (selectedArea?.key.images && selectedArea.key.images.length > 1) {
      const timer = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % selectedArea.key.images.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(timer);
    }
  }, [selectedArea]);

  // Hàm fetch slot cho tất cả ngày trong bookingDates
  const fetchAllSlots = async () => {
    const datesToFetch = bookingDates
      .filter((booking) => booking.date >= today && !fetchedSlots[booking.date]) // Chỉ fetch ngày hợp lệ và chưa có dữ liệu
      .map((booking) => booking.date);

    if (datesToFetch.length === 0) return;

    try {
      const promises = datesToFetch.map((date) =>
        dispatch(
          fetchAvailableSlots({
            roomId: selectedRoom.roomId,
            areaTypeId: selectedArea.value[0].areaTypeId,
            bookingDate: date,
          })
        ).unwrap()
      );
      const results = await Promise.all(promises);

      setFetchedSlots((prev) => {
        const updatedSlots = { ...prev };
        datesToFetch.forEach((date, index) => {
          updatedSlots[date] = results[index].data || [];
        });
        return updatedSlots;
      });
    } catch (error) {
      toast.error('Không thể tải danh sách slot!');
      datesToFetch.forEach((date) => {
        setFetchedSlots((prev) => ({ ...prev, [date]: [] }));
      });
    }
  };

  // Fetch slot cho một ngày cụ thể
  const fetchSlotsForDate = async (date) => {
    if (!selectedArea || !selectedRoom || !date) return;

    try {
      const res = await dispatch(
        fetchAvailableSlots({
          roomId: selectedRoom.roomId,
          areaTypeId: selectedArea.value[0].areaTypeId,
          bookingDate: date,
        })
      ).unwrap();

      setFetchedSlots((prev) => ({
        ...prev,
        [date]: res.data || [],
      }));
    } catch (error) {
      setFetchedSlots((prev) => ({ ...prev, [date]: [] }));
      toast.error(error);
    }
  };

  // Sync bookingDates với selectedTime từ Redux
  useEffect(() => {
    if (Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      setBookingDates(selectedTime);
    }
  }, [selectedTime]);

  const handleSlotChange = (bookingIndex, slotNumber) => {
    const date = bookingDates[bookingIndex].date;
    const slotsForDate = fetchedSlots[date] || [];
    const slot = slotsForDate.find((s) => s.slotNumber === slotNumber);
    if (!slot) return;

    if (slot.availableSlot === 0) {
      toast.error(`Slot ${slot.slotId} không khả dụng!`);
      return;
    }
  
    const updatedDates = [...bookingDates];
    const currentBooking = updatedDates[bookingIndex];
    const currentSlots = Array.isArray(currentBooking.slots) ? currentBooking.slots : [];
  
    const exists = currentSlots.some((s) => s.slotNumber === slotNumber);
  
    const newSlots = exists
      ? currentSlots.filter((s) => s.slotNumber !== slotNumber)
      : [...currentSlots, { slotNumber: slot.slotNumber, slotId: slot.slotId }];
  
    updatedDates[bookingIndex] = { ...currentBooking, slots: newSlots };

    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));  
  };

  const handleDateChange = (index, value) => {
    const updatedDates = [...bookingDates];
    updatedDates[index] = { ...updatedDates[index], date: value, slots: [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
    if (value) {
      fetchSlotsForDate(value);
    }
  };

  const addBookingDate = () => {
    const newBooking = { date: getCurrentDate(), slots: [] };
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

    if (bookingDates.some((item) => item.date < today)) {
      toast.error('Có ngày đặt không hợp lệ! Vui lòng chọn lại ngày từ hôm nay trở đi.');
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
    return bookingDates.reduce((total, booking) => {
      if (!Array.isArray(booking.slots)) return total;
      const slotsForDate = fetchedSlots[booking.date] || [];
      const slotPrice = selectedArea?.value?.[0]?.price || 10;
      return total + booking.slots.length * slotPrice;
    }, 0);
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
      fetchAllSlots(); // Fetch lại slot khi thay đổi khu vực nhóm
    }
  };

  const renderImages = () => {
    const validImages = selectedArea?.key.images && Array.isArray(selectedArea.key.images) && selectedArea.key.images.length > 0 ? selectedArea.key.images : [];
    if (!validImages.length) {
      return (
        <div className="w-full h-56 flex items-center justify-center bg-gray-200 rounded-lg">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
        </div>
      );
    }

    const prevImage = () => {
      setImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    };

    const nextImage = () => {
      setImageIndex((prev) => (prev + 1) % validImages.length);
    };

    const imageSrc = validImages[imageIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : DEFAULT_IMAGE;

    return (
      <div className="relative w-full h-70 group">
        <img
          src={displaySrc}
          alt={`Area image ${imageIndex + 1}`}
          className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
        />
        {validImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {validImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === imageIndex ? "bg-white" : "bg-gray-400"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (roomLoading) return <p className="text-center mt-10">Đang tải thông tin phòng...</p>;
  if (!selectedRoom) return <p className="text-center mt-10 text-orange-500">Vui lòng chọn phòng trước.</p>;
  if (!selectedArea) return <p className="text-center mt-10 text-orange-500">Đang tải thông tin khu vực...</p>;

  return (
    <div className="p-6 min-h-screen flex flex-col md:flex-row gap-6 mt-15 max-w-7xl mx-auto">
      <div className="md:w-1/2 mr-10">
        <h1 className="text-3xl font-bold text-center mb-6">{selectedArea.key.title}</h1>
        {renderImages()}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Mô tả khu vực</h2>
          <p className="text-base text-gray-700 text-left max-w-prose">
            {selectedArea.key.categoryDescription || "Không có mô tả chi tiết."}
          </p>
        </div>
      </div>

      <div className="md:w-1/2 p-6 rounded-lg border shadow-md mt-15 mb-60 ml-10">
        <h2 className="text-xl font-bold mb-4">Đăng ký đặt chỗ</h2>
        <div className="mb-4">
          <p className="break-words text-base">
            Bạn đã chọn khu vực: <strong>{selectedArea.key.title}</strong>
          </p>
        </div>
        {selectedArea.key.categoryId === 2 && groupAreas.length > 0 && (
          <div>
            <label className="block font-medium mb-2">Chọn khu vực nhóm bạn mong muốn:</label>
            <select
              value={selectedArea.value[0].areaTypeId}
              onChange={handleAreaChange}
              className="w-full p-2 mb-4 border rounded-md"
            >
              {groupAreas.map((area) => (
                <option key={area.value[0].areaTypeId} value={area.value[0].areaTypeId}>
                  {area.value[0].areaTypeName} (Kích thước: {area.value[0].size}, Giá: {area.value[0].price} DXL)
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
              {booking.date ? (
                fetchedSlots[booking.date] && fetchedSlots[booking.date].length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {fetchedSlots[booking.date].map((slot) => (
                      <div
                        key={slot.slotId}
                        className={`group relative flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${
                          slot.availableSlot === 0 ? 'text-orange-500 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={slot.slotNumber}
                          checked={booking.slots.some(s => s.slotNumber === slot.slotNumber)}
                          onChange={() => handleSlotChange(index, slot.slotNumber, slot.slotId)}
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
                    ))}
                  </div>
                ) : (
                  <p className="text-orange-500 w-full">
                    {booking.date < today
                      ? 'Chọn ngày hợp lệ để xem slot'
                      : 'Không có slot nào khả dụng cho ngày này'}
                  </p>
                )
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
            Tổng chi phí: <span className="text-orange-500">{calculateTotalPrice()} DXL</span>
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