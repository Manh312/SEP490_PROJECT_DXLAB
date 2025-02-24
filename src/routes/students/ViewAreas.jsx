import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, setSelectedTime, setPeopleCount, setSelectedSlots, confirmBooking } from '../../redux/slices/Booking';
import { areas, slots } from "../../constants";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, XIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const ViewAreas = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedArea, selectedTime, selectedSlots } = useSelector(state => state.booking);
  const [tempPeopleCount, setTempPeopleCount] = useState(1);
  const [step, setStep] = useState('selectPeople');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const handleSlotChange = (slotId) => {
    const slot = slots.find(s => s.id === slotId);
  
    if (!slot) return;
  
    // Nếu slot hết chỗ, không cho phép chọn và hiển thị thông báo lỗi
    if ((!slot.isAvailable && selectedArea.type !== "group") || (selectedArea.type === "group" && slot.remainingSeats <= 0)) {
      toast.error("Slot này đã hết chỗ, vui lòng chọn slot khác!");
      return;
    }
  
    if (!Array.isArray(selectedSlots)) {
      dispatch(setSelectedSlots([]));
      return;
    }
  
    const updatedSlots = selectedSlots.includes(slotId)
      ? selectedSlots.filter(id => id !== slotId)
      : [...selectedSlots, slotId];
  
    dispatch(setSelectedSlots(updatedSlots));
  };
  

  const getSlotStatus = (slot) => {
    if (selectedArea.type === "group") {
      return slot.remainingSeats > 0 ? `Còn seats cho ${slot.remainingSeats} ghế` : "Hết chỗ";
    }
    return slot.isAvailable ? "Còn chỗ" : "Hết chỗ";
  };

  const handleConfirmBooking = (e) => {
    const today = new Date().toISOString().split('T')[0];
    if (!selectedTime && selectedSlots.length === 0) {
      e.preventDefault();
      toast.error("Vui lòng chọn ngày và slot trước khi xác nhận!");
    } else if (!selectedTime) {
      e.preventDefault();
      toast.error("Vui lòng chọn ngày trước khi xác nhận!");
    }
    else if (selectedTime < today) {
      e.preventDefault();
      toast.error("Ngày đặt không hợp lệ! Vui lòng chọn lại ngày khác.");
    } else if (selectedSlots.length === 0) {
      e.preventDefault();
      toast.error("Vui lòng chọn ít nhất một slot trước khi xác nhận!");
    } else {
      dispatch(confirmBooking(selectedTime));
    }
  };

  const handleScheduleOpen = () => {
    console.log("Selected Time:", selectedTime);
    setIsScheduleOpen(true);
  };

  const isPastDate = selectedTime && selectedTime < new Date().toISOString().split('T')[0];


  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">DXLAB Co-working Space</h1>
      <p className="text-center mb-8">Chọn khu vực phù hợp với nhu cầu làm việc của bạn</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {areas.map((area) => (
          <div key={area.id} className="p-6 border rounded-lg shadow-lg transition-transform transform hover:scale-105">
            <img src={area.image} alt={area.name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{area.name}</h2>
            <p>{area.description}</p>
            <ul className="list-disc list-inside mt-2">
              {area.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              onClick={() => {
                dispatch(openModal(area));
                setTempPeopleCount(1);
                setStep('selectPeople');
              }}
            >
              Chọn
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-300 text-black p-6 rounded-lg shadow-lg lg:w-[600px] md:w=[600px] sm:w-[500px] w-xs relative">
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
                  <button className="px-4 py-2 bg-gray-500 rounded-lg" onClick={() => dispatch(closeModal())}>Hủy</button>
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
                  <CalendarDaysIcon
                    className="h-6 w-6 text-gray-600 cursor-pointer hover:text-orange-500"
                    onClick={handleScheduleOpen}
                  />
                </div>
                {isScheduleOpen && (
                  <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-300 text-black p-6 rounded-lg shadow-lg w-[600px] h-100 relative">
                      <button className="absolute top-2 right-2" onClick={() => setIsScheduleOpen(false)}>
                        <XIcon className="h-6 w-6 text-black" />
                      </button>

                      <h2 className="text-2xl font-bold mb-4 text-center">
                        Lịch đặt ngày {selectedTime ? new Date(selectedTime).toLocaleDateString('vi-VN') : "Chưa chọn ngày"}
                      </h2>

                      {/* Nếu chưa chọn ngày hoặc ngày đã qua, hiển thị thông báo */}
                      {(!selectedTime || isPastDate) ? (
                        <p className="text-center text-gray-500 mt-4">Không có thông tin lịch trình trong ngày này!</p>
                      ) : (
                        // Nếu có thông tin, hiển thị danh sách slot
                        <ul className="list-disc pl-4">
                          {slots.map((slot) => (
                            <li key={slot.id} className={`p-2 ${selectedSlots.includes(slot.id) ? 'bg-orange-200' : ''}`}>
                              {slot.name} ({getSlotStatus(slot)})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <label className="font-semibold">Chọn Ngày</label>
                </div>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg mb-4"
                  value={selectedTime || ""}
                  onChange={(e) => dispatch(setSelectedTime(e.target.value))}
                />

                <label className="block mb-2 font-semibold">Chọn Slot</label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {slots.map((slot) => (
                    <label key={slot.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Array.isArray(selectedSlots) && selectedSlots.includes(slot.id)}
                        onChange={() => handleSlotChange(slot.id)}
                      />
                      {slot.name}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  {selectedArea.type === "group" && (
                    <button className="px-4 py-2 bg-gray-500 rounded-lg" onClick={() => setStep('selectPeople')}>Quay lại</button>
                  )}
                  <Link
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    to={(selectedTime && selectedSlots.length > 0) ? '/confirm-payment' : '#'}
                    onClick={(e) => handleConfirmBooking(e)}
                  >
                    Xác nhận
                  </Link>
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
