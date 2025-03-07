import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, setSelectedTime, setPeopleCount, confirmBooking } from '../../redux/slices/Booking';
import { areas, slots } from "../../constants";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XIcon, PlusCircleIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewAreas = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedArea, selectedTime } = useSelector(state => state.booking);
  const [tempPeopleCount, setTempPeopleCount] = useState(1);
  const [step, setStep] = useState('selectPeople');
  const [bookingDates, setBookingDates] = useState([{ date: '', slots: [] }]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTime && Array.isArray(selectedTime) && selectedTime.length > 0 && JSON.stringify(selectedTime) !== JSON.stringify(bookingDates)) {
      setBookingDates(selectedTime);
    }
  }, [selectedTime]);

  const handleSlotChange = (index, slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    // Check if slot is full
    if ((!slot.isAvailable && selectedArea.type !== "group") || 
        (selectedArea.type === "group" && slot.remainingSeats <= 0)) {
      return; // Do nothing if slot is full
    }

    const updatedDates = [...bookingDates];
    const currentSlots = Array.isArray(updatedDates[index].slots) ? updatedDates[index].slots : [];

    let newSlots;
    if (currentSlots.includes(slotId)) {
      newSlots = currentSlots.filter((slot) => slot !== slotId);
    } else {
      newSlots = [...currentSlots, slotId];
    }

    updatedDates[index] = { ...updatedDates[index], slots: newSlots };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

  const handleDateChange = (index, value) => {
    const updatedDates = [...bookingDates];
    updatedDates[index] = { ...updatedDates[index], date: value, slots: updatedDates[index].slots || [] };
    setBookingDates(updatedDates);
    dispatch(setSelectedTime(updatedDates));
  };

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

  const isSlotDisabled = (slot) => {
    return (!slot.isAvailable && selectedArea.type !== "group") || 
           (selectedArea.type === "group" && slot.remainingSeats <= 0);
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
          const slot = slots.find((s) => s.id === slotId);
          if (slot) {
            total += slot.price * (selectedArea.type === 'group' ? tempPeopleCount : 1);
          }
        });
      }
    });
    return total;
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">DXLAB Co-working Space</h1>
      <p className="text-center mb-8">Chọn khu vực phù hợp với nhu cầu làm việc của bạn</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {areas.map((area) => (
          <div key={area.id} className="p-6 border rounded-lg shadow-lg transition-transform transform hover:scale-105">
            <img src={area.image} alt={area.name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{area.name}</h2>
            <p>{area.description.slice(0, 100)}...</p>
            <div>
              <button
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                onClick={() => {
                  dispatch(openModal(area));
                  setTempPeopleCount(1);
                  setStep('selectPeople');
                  setBookingDates([{ date: '', slots: [] }]); 
                }}
              >
                Chọn
              </button>
              {" "}
              <Link to={`/area/${area.type}`} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition">
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
            {selectedArea.type === "group" && step === 'selectPeople' ? (
              <>
                <h2 className="text-xl font-bold mb-4">Nhập số lượng người</h2>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded-lg mb-4"
                  value={tempPeopleCount}
                  onChange={(e) => setTempPeopleCount(Number(e.target.value))}
                />
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => dispatch(closeModal())}>Hủy</button>
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    onClick={() => {
                      if (tempPeopleCount < 1 || tempPeopleCount > 20) {
                        toast.error("Số lượng người phải từ 1 đến 20!");
                      } else {
                        dispatch(setPeopleCount(tempPeopleCount));
                        setStep('selectTime');
                      }
                    }}
                  >
                    Tiếp tục
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-center">Đặt Lịch Tới DXLAB</h2>
                <div className="flex justify-between">
                  <p className="break-words text-base">
                    Bạn đã chọn khu vực: <strong>{selectedArea.name}</strong>
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
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => (
                          <label key={slot.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Array.isArray(booking.slots) && booking.slots.includes(slot.id)}
                              onChange={() => handleSlotChange(index, slot.id)}
                              disabled={isSlotDisabled(slot)}
                              className={isSlotDisabled(slot) ? 'cursor-not-allowed opacity-50' : ''}
                            />
                            {slot.name}
                          </label>
                        ))}
                      </div>
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
                  {selectedArea.type === "group" && (
                    <button className="px-4 py-2 bg-gray-500 rounded-lg" onClick={() => setStep('selectPeople')}>
                      Quay lại
                    </button>
                  )}
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    onClick={(e) => handleConfirmBooking(e)}
                  >
                    Xác nhận
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAreas;