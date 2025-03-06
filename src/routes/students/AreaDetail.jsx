import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedTime, setPeopleCount, setSelectedSlots, confirmBooking, setSelectedArea } from '../../redux/slices/Booking';
import { areas, slots } from '../../constants';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CalendarDaysIcon, XIcon } from 'lucide-react';

const AreaDetail = () => {
  const { typeName } = useParams();
  const dispatch = useDispatch();
  const { selectedTime, selectedSlots, peopleCount, selectedArea: area } = useSelector(state => state.booking);
  // const [area, setArea] = useState(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    const foundArea = areas.find(area => area.type === typeName);
    if (foundArea) {
      dispatch(setSelectedArea(foundArea));
      if (foundArea.type === "group" && peopleCount < 1) {
        dispatch(setPeopleCount(1));
      }
    } else {
      toast.error("Khu vực không tồn tại!");
    }
  }, [typeName, dispatch, peopleCount]);

  if (!area) return <p className="text-center mt-10 text-red-500">Không tìm thấy khu vực.</p>;

  const handleSlotChange = (slotId) => {
    const slot = slots.find(s => s.id === slotId);

    if (!slot) return;

    // Nếu slot hết chỗ, không cho phép chọn và hiển thị thông báo lỗi
    if ((!slot.isAvailable && area.type !== "group") || (area.type === "group" && slot.remainingSeats <= 0)) {
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
    if (area.type === "group") {
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

  const isPastDate = selectedTime && selectedTime < new Date().toISOString().split('T')[0];


  return (
    <div className="p-6 min-h-screen flex flex-col md:flex-row gap-6 mt-15">
      <div className="md:w-1/2 mr-10">
        <h1 className="text-3xl font-bold text-center mb-6">{area.name}</h1>
        <img src={area.image} alt={area.name} className="w-full h-64 object-cover rounded-md mb-6" />
        <p className="text-center mb-4">{area.description}</p>
      </div>

      <div className="md:w-1/2 p-6 rounded-lg border shadow-md mt-15 mb-60 ml-10">
        <div className='flex justify-between'>
          <h2 className="text-xl font-bold mb-4">Đăng ký đặt chỗ</h2>
          <CalendarDaysIcon className="h-6 w-6 text-gray-600 cursor-pointer hover:text-orange-500" onClick={() => setIsScheduleOpen(true)} />
        </div>
        <div className='mb-4'>
          <p className="break-words text-base">
            Bạn đã chọn khu vực: <strong>{area.name}</strong>
          </p>
        </div>
        <div className='mb-4'>
          {area.type === "group" && (
            <>
              <label className="block font-medium mb-2">Số lượng người</label>
              <input type="number" className="w-full p-2 border rounded-md mb-4" min="1" value={peopleCount} onChange={(e) => dispatch(setPeopleCount(Number(e.target.value)))} />
            </>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Ngày đặt chỗ</label>
          <input type="date" className="w-full p-2 border rounded-md" value={selectedTime || ""} onChange={(e) => dispatch(setSelectedTime(e.target.value))} />
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


        <div className="mb-4">
          <label className="block font-medium mb-2">Chọn Slot</label>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => (
              <label key={slot.id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedSlots.includes(slot.id)} onChange={() => handleSlotChange(slot.id)} />
                {slot.name}
              </label>
            ))}
          </div>
        </div>

        <Link to={(selectedTime && selectedSlots.length > 0) ? '/confirm-payment' : '#'} className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition" onClick={handleConfirmBooking}>
          <button className='w-40'>Xác nhận đặt chỗ</button>
        </Link>
      </div>
    </div>
  );
};

export default AreaDetail;
