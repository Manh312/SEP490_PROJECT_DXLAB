import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, setSelectedTime, confirmBooking, setSelectedArea } from '../../redux/slices/Booking';
import { fetchAvailableSlots, fetchCategoryInRoom } from '../../redux/slices/Booking';
import { getRoomById } from '../../redux/slices/Room';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { XIcon, PlusCircleIcon, ChevronLeft, ChevronRight, AreaChartIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

// Ảnh mặc định nếu không có ảnh từ API
const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

// Hàm lấy ngày hiện tại theo múi giờ cục bộ
const getCurrentDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

// Hàm cắt ngắn mô tả
const truncateDescription = (description, maxLength = 150) => {
  if (typeof description !== 'string') return '';
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength) + '...';
};

const ViewAreas = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { isModalOpen, selectedArea, selectedTime } = useSelector((state) => state.booking);
  const { categoryInRoom } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading } = useSelector((state) => state.rooms);

  const [bookingDates, setBookingDates] = useState([{ date: getCurrentDate(), slots: [] }]);
  const [fetchedSlots, setFetchedSlots] = useState({});
  const [groupAreas, setGroupAreas] = useState([]);
  const [imageIndices, setImageIndices] = useState({});
  const today = getCurrentDate();
  const baseUrl = "https://localhost:9999";

  // Fetch room data khi id thay đổi
  useEffect(() => {
    if (id) {
      dispatch(getRoomById(id));
    }
  }, [dispatch, id]);

  // Fetch category khi selectedRoom thay đổi
  useEffect(() => {
    if (selectedRoom && selectedRoom.roomId === parseInt(id)) {
      dispatch(fetchCategoryInRoom({ id: selectedRoom.roomId }));
    }
  }, [selectedRoom, dispatch, id]);

  // Cập nhật groupAreas khi categoryInRoom thay đổi
  useEffect(() => {
    if (categoryInRoom?.data?.length > 0) {
      const groupAreasList = categoryInRoom.data
        .filter((item) => item.key.categoryId === 2)
        .flatMap((item) =>
          item.value
            .filter((valueItem) => valueItem.areaCategory === 2)
            .map((valueItem) => ({
              key: item.key,
              value: [valueItem],
            }))
        );
      setGroupAreas(groupAreasList);
    }
  }, [categoryInRoom]);

  // Đồng bộ bookingDates với selectedTime từ Redux
  useEffect(() => {
    if (Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      setBookingDates(selectedTime);
    }
  }, [selectedTime]);

  // Fetch slot cho tất cả ngày khi selectedArea thay đổi hoặc bookingDates thay đổi
  useEffect(() => {
    if (
      selectedArea?.value?.[0]?.areaTypeId &&
      selectedArea?.roomId === selectedRoom?.roomId &&
      bookingDates.length > 0
    ) {
      fetchAllSlots();
    }
  }, [selectedArea, bookingDates, selectedRoom]);

  // Auto-slide effect for images
  useEffect(() => {
    const timers = {};
    categoryInRoom?.data?.forEach((area, index) => {
      if (area.key.images && area.key.images.length > 1) {
        timers[index] = setInterval(() => {
          setImageIndices((prev) => {
            const currentIndex = prev[index] || 0;
            const nextIndex = (currentIndex + 1) % area.key.images.length;
            return { ...prev, [index]: nextIndex };
          });
        }, 3000); // Change image every 3 seconds
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearInterval(timer));
    };
  }, [categoryInRoom]);

  // Hàm fetch slot cho tất cả ngày trong bookingDates
  const fetchAllSlots = async () => {
    const datesToFetch = bookingDates
      .filter(
        (booking) =>
          booking.date &&
          booking.date >= today &&
          !fetchedSlots[booking.date]
      )
      .map((booking) => booking.date);

    if (datesToFetch.length === 0) return;

    try {
      const promises = datesToFetch.map((date) =>
        dispatch(fetchAvailableSlots({
          roomId: selectedRoom.roomId,
          areaTypeId: selectedArea.value[0].areaTypeId,
          bookingDate: date,
        })).unwrap()
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
      console.error("Lỗi khi fetch slots:", error);
      datesToFetch.forEach((date) => {
        setFetchedSlots((prev) => ({ ...prev, [date]: [] }));
      });
    }
  };

  // Fetch slot cho một ngày cụ thể
  const fetchSlotsForDate = async (date) => {
    if (!selectedArea || !selectedRoom || !date) return;

    try {
      const res = await dispatch(fetchAvailableSlots({
        roomId: selectedRoom.roomId,
        areaTypeId: selectedArea.value[0].areaTypeId,
        bookingDate: date,
      })).unwrap();

      setFetchedSlots((prev) => ({
        ...prev,
        [date]: res.data || [],
      }));
    } catch (error) {
      setFetchedSlots((prev) => ({ ...prev, [date]: [] }));
      toast.error(error);
    }
  };

  const handleDetailClick = (area) => {
    dispatch(setSelectedArea(area));
    navigate(`/area/${area.value[0].areaTypeId}`);
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

    const newSlots = currentSlots.includes(slotId)
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
      dispatch(setSelectedArea({
        ...selected,
        name: selected.value[0].areaTypeName,
        description: selected.value[0].areaDescription,
        type: 'group',
      }));
      fetchAllSlots();
    }
  };

  const renderImages = (images, areaIndex) => {
    const validImages = Array.isArray(images) && images.length > 0 ? images : [];
    if (!validImages.length) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-md">
          <span className="text-gray-500 text-sm">Không có ảnh</span>
        </div>
      );
    }

    const currentIndex = imageIndices[areaIndex] || 0;

    const prevImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [areaIndex]: (currentIndex - 1 + validImages.length) % validImages.length,
      }));
    };

    const nextImage = () => {
      setImageIndices((prev) => ({
        ...prev,
        [areaIndex]: (currentIndex + 1) % validImages.length,
      }));
    };

    const imageSrc = validImages[currentIndex];
    const displaySrc =
      typeof imageSrc === "string"
        ? imageSrc.startsWith("http")
          ? imageSrc
          : `${baseUrl}/${imageSrc}`
        : DEFAULT_IMAGE;

    return (
      <div className="relative w-full h-48 group">
        <img
          src={displaySrc}
          alt={`Area ${areaIndex + 1} - image ${currentIndex + 1}`}
          className="w-full h-full object-cover rounded-md shadow-md transition-transform duration-300 group-hover:scale-105"
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
                  className={`w-2 h-2 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 mb-20">
      <div className='p-8 flex flex-col items-center text-center mt-16 mb-20'>
        <h1 className="text-4xl mb-10 tracking-wide">
          Danh sách khu vực tại{" "}
          <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
            DXLAB Co-working Space
          </span>
        </h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Chọn khu vực phù hợp với nhu cầu làm việc của bạn
        </p>
        {roomLoading ? (
          <div className="flex items-center justify-center py-6">
            <FaSpinner className="animate-spin text-orange-500 w-6 h-6 mr-2" />
            <p className="text-orange-500 font-medium">Đang tải thông tin khu vực...</p>
          </div>
        ) : !selectedRoom ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AreaChartIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy phòng với ID: {id}</p>
          </div>
        ) : !categoryInRoom?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AreaChartIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy khu vực nào trong phòng này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
            {categoryInRoom.data.map((area, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 flex flex-col"
              >
                {renderImages(area.key.images, index)}
                <div className="p-6 text-left flex flex-col flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {area.key.title}
                  </h3>
                  <p className="text-gray-600 text-sm flex-grow">
                    {truncateDescription(area.key.categoryDescription)}
                  </p>
                  <div className="mt-4 flex gap-4">
                    <button
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-lg font-semibold transition duration-300"
                      onClick={() => {
                        dispatch(openModal({
                          ...area,
                          name: area.value[0].areaTypeName,
                          description: area.value[0].areaDescription,
                          type: area.value[0].areaCategory === 1 ? 'individual' : 'group',
                          roomId: selectedRoom.roomId,
                        }));
                        setBookingDates([{ date: getCurrentDate(), slots: [] }]);
                      }}
                    >
                      Chọn
                    </button>
                    <Link
                      to={`/area/${area.value[0].areaTypeId}`}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-lg font-semibold text-center transition duration-300"
                      onClick={() => handleDetailClick(area)}
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-300 text-black p-6 rounded-lg shadow-lg lg:w-[600px] md:w-[600px] sm:w-[500px] w-xs relative">
            <button className="absolute top-2 right-2"
              onClick={() => {
                dispatch(closeModal());
                setFetchedSlots({});
                setBookingDates([{ date: getCurrentDate(), slots: [] }]);
              }}>
              <XIcon className="h-6 w-6 text-black" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center">Đặt Lịch Tới DXLAB</h2>
            <div className="mb-4">
              <p className="break-words text-base">
                Bạn đã chọn khu vực: <strong>{selectedArea?.key.title}</strong>
              </p>
            </div>
            {selectedArea?.key.categoryId === 2 && groupAreas.length > 0 && (
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
                  {booking.date ? (
                    fetchedSlots[booking.date] && fetchedSlots[booking.date].length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {fetchedSlots[booking.date].map((slot) => (
                          <div
                            key={slot.slotId}
                            className={`group relative flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${slot.availableSlot === 0 ? 'text-orange-500 cursor-not-allowed' : ''}`}
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
                    <p className="text-orange-500">Vui lòng chọn ngày để xem các slot khả dụng</p>
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
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                onClick={(e) => handleConfirmBooking(e)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAreas;