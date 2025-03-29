import { ArmchairIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import table_images from '../../assets/table.png';
import { useState } from 'react'; // Thêm useState để quản lý slot và ngày

const individualSeats = {
  table1: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'], // Bàn 6 ghế
  table2: ['B1', 'B2', 'B3', 'B4'], // Bàn 4 ghế
};

const groupSeats = {
  "4-seats": [['G1', 'G2', 'G3', 'G4']],
  "6-seats": [['H1', 'H2', 'H3', 'H4', 'H5', 'H6']],
  "8-seats": [['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8']],
  "6-seats-1": [['I1', 'I2', 'I3', 'I4', 'I5', 'I6']],
  "6-seats-2": [['I7', 'I8', 'I9', 'I10', 'I11', 'I12']],
};

// Bảng ánh xạ positionId với mã ghế
const positionIdToSeatMap = {
  9: { seat: 'A1', area: 'individual' },
  10: { seat: 'A2', area: 'individual' },
  11: { seat: 'A3', area: 'individual' },
  12: { seat: 'A4', area: 'individual' },
  13: { seat: 'A5', area: 'individual' },
  14: { seat: 'A6', area: 'individual' },
  15: { seat: 'B1', area: 'individual' },
  16: { seat: 'B2', area: 'individual' },
  17: { seat: 'B3', area: 'individual' },
  18: { seat: 'B4', area: 'individual' },
  19: { seat: 'G1', area: 'group' },
  20: { seat: 'G2', area: 'group' },
  21: { seat: 'G3', area: 'group' },
  22: { seat: 'G4', area: 'group' },
  23: { seat: 'H1', area: 'group' },
  24: { seat: 'H2', area: 'group' },
  25: { seat: 'H3', area: 'group' },
  26: { seat: 'H4', area: 'group' },
  27: { seat: 'H5', area: 'group' },
  28: { seat: 'H6', area: 'group' },
  29: { seat: 'J1', area: 'group' },
  30: { seat: 'J2', area: 'group' },
  31: { seat: 'J3', area: 'group' },
  32: { seat: 'J4', area: 'group' },
  33: { seat: 'J5', area: 'group' },
  34: { seat: 'J6', area: 'group' },
  35: { seat: 'J7', area: 'group' },
  36: { seat: 'J8', area: 'group' },
  37: { seat: 'I1', area: 'group' },
  38: { seat: 'I2', area: 'group' },
  39: { seat: 'I3', area: 'group' },
  40: { seat: 'I4', area: 'group' },
  41: { seat: 'I5', area: 'group' },
  42: { seat: 'I6', area: 'group' },
  43: { seat: 'I7', area: 'group' },
  44: { seat: 'I8', area: 'group' },
  45: { seat: 'I9', area: 'group' },
  46: { seat: 'I10', area: 'group' },
  47: { seat: 'I11', area: 'group' },
  48: { seat: 'I12', area: 'group' },
};

const ViewBookedSeats = () => {
  const { bookings } = useSelector((state) => state.booking);

  // State để quản lý slot và ngày được chọn
  const [selectedSlot, setSelectedSlot] = useState(1); // Mặc định slot 1
  const [selectedDate, setSelectedDate] = useState('2025-03-29'); // Mặc định ngày 2025-03-29

  console.log("Bookings:", bookings);

  // Lấy danh sách ghế đã đặt, lọc theo slot và ngày
  const bookedSeats = bookings
    .map(booking =>
      booking.data.details
        .filter(detail => {
          // Lấy ngày từ checkInTime (bỏ phần thời gian)
          const bookingDate = detail.checkinTime.split('T')[0];
          // Lọc theo slot và ngày
          return detail.slotId === selectedSlot && bookingDate === selectedDate;
        })
        .map(detail => {
          const position = positionIdToSeatMap[detail.positionId];
          return position ? position.seat : null;
        })
        .filter(seat => seat !== null)
    )
    .flat();

  console.log("Booked Seats for slot", selectedSlot, "and date", selectedDate, ":", bookedSeats);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Bảng hiển thị vị trí ghế ngồi tại DXLAB</h1>

      {/* Giao diện chọn slot và ngày */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="mr-2 font-semibold">Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="mr-2 font-semibold">Chọn slot:</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(Number(e.target.value))}
            className="border rounded p-2"
          >
            <option value={1}>Slot 1</option>
            <option value={2}>Slot 2</option>
            <option value={3}>Slot 3</option>
            <option value={4}>Slot 4</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-5xl space-y-6 border rounded-lg p-6">
        {/* Chỗ ngồi cá nhân */}
        <h2 className="text-2xl font-bold text-center mb-4">Chỗ ngồi cá nhân</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {/* Bàn 6 ghế */}
          <div className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md" style={{ width: '300px', height: '280px' }}>
            <img
              src={table_images}
              alt="Table"
              className="absolute w-32 h-32 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
            {individualSeats.table1.map((seat, index) => {
              const angle = (360 / individualSeats.table1.length) * index;
              const radius = 120;
              const x = Math.cos(angle * (Math.PI / 180)) * radius;
              const y = Math.sin(angle * (Math.PI / 180)) * radius;
              return (
                <span
                  key={seat}
                  className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded
                    ${bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <ArmchairIcon className="w-5 h-5" />
                </span>
              );
            })}
          </div>

          {/* Bàn 4 ghế */}
          <div className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md" style={{ width: '300px', height: '290px' }}>
            <img
              src={table_images}
              alt="Table"
              className="absolute w-28 h-28 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
            {individualSeats.table2.map((seat, index) => {
              const angle = (360 / individualSeats.table2.length) * index;
              const radius = 100;
              const x = Math.cos(angle * (Math.PI / 180)) * radius;
              const y = Math.sin(angle * (Math.PI / 180)) * radius;
              return (
                <span
                  key={seat}
                  className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded
                    ${bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                >
                  <ArmchairIcon className="w-5 h-5" />
                </span>
              );
            })}
          </div>
        </div>

        {/* Khu vực nhóm */}
        <div className="p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">Khu vực Nhóm</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {Object.entries(groupSeats).map(([groupType, seats]) => (
              <div key={groupType} className="border-4 border-gray-600 p-4 rounded-md text-center w-full max-w-xs mx-auto">
                <strong className="text-sm md:text-base block mb-2">{groupType}</strong>
                <div
                  className="relative flex flex-wrap justify-center items-center"
                  style={{ width: '100%', height: '200px' }}
                >
                  {groupType === "6-seats-1" || groupType === "6-seats-2" ? (
                    <img
                      src={table_images}
                      alt="Table"
                      className="absolute w-16 h-16 sm:w-20 sm:h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  ) : (
                    <img
                      src={table_images}
                      alt="Table"
                      className="absolute w-20 h-20 sm:w-24 sm:h-24 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  )}
                  {seats[0].map((seat, index) => {
                    const angle = (360 / seats[0].length) * index;
                    const radius = 80;
                    const x = Math.cos(angle * (Math.PI / 180)) * radius;
                    const y = Math.sin(angle * (Math.PI / 180)) * radius;
                    return (
                      <span
                        key={seat}
                        className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded
                          ${bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                      >
                        <ArmchairIcon className="w-4 h-4" />
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookedSeats;