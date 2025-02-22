import { useDispatch, useSelector } from 'react-redux';
import { openModal, closeModal, setSelectedTime, setPeopleCount, setSelectedSlot, confirmBooking } from '../../redux/slices/Booking';
import { areas, slots } from "../../constants";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2Icon, XIcon } from 'lucide-react';

const ViewAreas = () => {
  const dispatch = useDispatch();
  const { isModalOpen, selectedArea, selectedTime, selectedSlot } = useSelector(state => state.booking);
  const [tempPeopleCount, setTempPeopleCount] = useState(1);
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [step, setStep] = useState('selectPeople');

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
          <div className="bg-neutral-300 text-black p-6 rounded-lg shadow-lg lg:w-[600px] md:w=[600px] sm:w-[500px] w-xs relative">
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
                      if (tempPeopleCount > 1) {
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
                <h2 className="text-xl font-bold mb-4">Chọn thời gian</h2>
                <p className="mb-4">Bạn đã chọn khu vực: <strong>{selectedArea.name}</strong></p>
                <label className="block mb-2 font-semibold">Chọn Slot</label>
                <select
                  className="w-full p-2 border rounded-lg mb-4"
                  value={selectedSlot}
                  onChange={(e) => dispatch(setSelectedSlot(Number(e.target.value)))}
                >
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>{slot.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={isSelectingDate}
                    onChange={() => setIsSelectingDate(true)}
                  />
                  <label className="font-semibold">Chọn Ngày</label>
                  {isSelectingDate && <CheckCircle2Icon className="h-6 w-6 text-green-500" />}
                </div>
                {isSelectingDate && (
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg mb-4"
                    value={selectedTime}
                    onChange={(e) => dispatch(setSelectedTime(e.target.value))}
                  />
                )}

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={!isSelectingDate}
                    onChange={() => setIsSelectingDate(false)}
                  />
                  <label className="font-semibold">Chọn khoảng thời gian</label>
                  {!isSelectingDate && <CheckCircle2Icon className="h-6 w-6 text-green-500" />}
                </div>
                {!isSelectingDate && (
                  <div className="flex sm:flex-row flex-col gap-2">
                    <input
                      type="month"
                      className="w-full p-2 border rounded-lg mb-4"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                    />
                    <input
                      type="month"
                      className="w-full p-2 border rounded-lg mb-4"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {selectedArea.type === "group" && (
                    <button className="px-4 py-2 bg-gray-500 rounded-lg" onClick={() => setStep('selectPeople')}>Quay lại</button>
                  )}
                  <Link
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    to={'/payment'}
                    onClick={() => {
                      dispatch(confirmBooking({ startMonth, endMonth }));
                    }}
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