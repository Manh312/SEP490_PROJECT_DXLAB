import { useState } from 'react';
import { ArmchairIcon } from 'lucide-react';
import table_images from '../../assets/table.png';

const individualSeats = [
  ['A1', 'A2', 'A3', 'A4', 'A5'],
  ['B1', 'B2', 'B3', 'B4', 'B5'],
];

const groupSeats = {
  "4-seats": [['G1', 'G2', 'G3', 'G4']],
  "6-seats": [['H1', 'H2', 'H3', 'H4', 'H5', 'H6']],
  "8-seats": [['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8']],
  "6-seats-1": [['I1', 'I2', 'I3', 'I4', 'I5', 'I6']],
  "6-seats-2": [['I7', 'I8', 'I9', 'I10', 'I11', 'I12']]
};

const bookedSeats = ['A2', 'B4', 'C3', 'G2', 'H5', 'I8', 'J6'];

const ViewBookedSeats = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev => prev.includes(seat)
      ? prev.filter(s => s !== seat)
      : [...prev, seat]);
  };

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Chọn Chỗ Ngồi</h1>

      {/* Sử dụng flexbox với 2 hàng */}
      <div className="w-full max-w-5xl space-y-6">
        {/* Hàng đầu: Cá nhân */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">Khu vực Cá Nhân</h2>
          <div className="border-4 border-gray-600 p-4 rounded-md flex flex-wrap justify-center gap-2">
            {individualSeats.flat().map((seat, index) => (
              <span
                key={index}
                className={`inline-flex w-10 h-10 items-center justify-center m-1 p-2 rounded cursor-pointer 
                  ${bookedSeats.includes(seat) ? 'bg-red-500 cursor-not-allowed text-white'
                    : selectedSeats.includes(seat) ? 'bg-green-500 text-white'
                      : 'bg-gray-500 hover:bg-gray-400 text-white'}`}
                onClick={() => toggleSeat(seat)}
              >
                <ArmchairIcon className="w-5 h-5" />
              </span>
            ))}
          </div>
        </div>

        {/* Hàng thứ 2: Nhóm */}
        <div className="bg-gray-200 p-4 rounded-lg shadow-md">
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
                        key={index}
                        onClick={() => toggleSeat(seat)}
                        className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded cursor-pointer 
                          ${bookedSeats.includes(seat) ? 'bg-red-500 cursor-not-allowed text-white'
                            : selectedSeats.includes(seat) ? 'bg-green-500 text-white'
                              : 'bg-gray-500 hover:bg-gray-400 text-white'}`}
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

      {/* Ghế đã chọn */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Ghế đã chọn:</h2>
        <div className="mt-2 text-lg">
          {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn'}
        </div>
      </div>
    </div>
  );
};

export default ViewBookedSeats;
