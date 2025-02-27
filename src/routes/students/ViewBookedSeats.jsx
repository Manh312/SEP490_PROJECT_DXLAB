import { useState } from 'react';
import { ArmchairIcon } from 'lucide-react';
import table_images from '../../assets/table.png';

const individualSeats = {
  table1: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'], // Bàn 6 ghế
  table2: ['B1', 'B2', 'B3', 'B4']
};

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
      <h1 className="text-3xl font-bold text-center mb-6">Bảng hiển thị vị trí ghế ngồi tại DXLAB</h1>

      {/* Sử dụng flexbox với 2 hàng */}
      <div className="w-full max-w-5xl space-y-6 border rounded-lg p-6">
        {/* Hàng đầu: Cá nhân */}
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
                onClick={() => toggleSeat(seat)}
                className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded cursor-pointer 
                  ${bookedSeats.includes(seat) ? 'bg-red-500 cursor-not-allowed text-white'
                    : selectedSeats.includes(seat) ? 'bg-green-500 text-white'
                      : 'bg-gray-500 hover:bg-gray-400 text-white'}`}
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
                onClick={() => toggleSeat(seat)}
                className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded cursor-pointer 
                  ${bookedSeats.includes(seat) ? 'bg-red-500 cursor-not-allowed text-white'
                    : selectedSeats.includes(seat) ? 'bg-green-500 text-white'
                      : 'bg-gray-500 hover:bg-gray-400 text-white'}`}
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <ArmchairIcon className="w-5 h-5" />
              </span>
            );
          })}
        </div>
      </div>


        {/* Hàng thứ 2: Nhóm */}
        <div className=" p-4 rounded-lg shadow-md">
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
    </div>
  );
};

export default ViewBookedSeats;
