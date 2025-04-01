import { ArmchairIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistory, fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';

const individualSeats = {
  table1: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
  table2: ['B1', 'B2', 'B3', 'B4'],
};

const groupSeats = {
  '4-seats': [['G1', 'G2', 'G3', 'G4']],
  '6-seats': [['H1', 'H2', 'H3', 'H4', 'H5', 'H6']],
  '8-seats': [['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8']],
  '6-seats-1': [['I1', 'I2', 'I3', 'I4', 'I5', 'I6']],
  '6-seats-2': [['I7', 'I8', 'I9', 'I10', 'I11', 'I12']],
};

const positionIdToSeatMap = {
  1: { seat: 'G1', area: 'group' }, // Previously position 3 (4-person area)
  2: { seat: 'G2', area: 'group' }, // Previously position 4
  3: { seat: 'G3', area: 'group' }, // Previously position 5
  4: { seat: 'G4', area: 'group' }, // Previously position 6
  5: { seat: 'A1', area: 'individual' }, // Previously position 9
  6: { seat: 'A2', area: 'individual' }, // Previously position 10
  7: { seat: 'A3', area: 'individual' }, // Previously position 11
  8: { seat: 'A4', area: 'individual' }, // Previously position 12
  9: { seat: 'A5', area: 'individual' }, // Previously position 13
  10: { seat: 'A6', area: 'individual' }, // Previously position 14
  11: { seat: 'B1', area: 'individual' }, // Previously position 15
  12: { seat: 'B2', area: 'individual' }, // Previously position 16
  13: { seat: 'B3', area: 'individual' }, // Previously position 17
  14: { seat: 'B4', area: 'individual' }, // Previously position 18
  15: { seat: 'G1', area: 'group' }, // Previously position 19
  16: { seat: 'G2', area: 'group' }, // Previously position 20
  17: { seat: 'G3', area: 'group' }, // Previously position 21
  18: { seat: 'G4', area: 'group' }, // Previously position 22
  19: { seat: 'H1', area: 'group' }, // Previously position 23
  20: { seat: 'H2', area: 'group' }, // Previously position 24
  21: { seat: 'H3', area: 'group' }, // Previously position 25
  22: { seat: 'H4', area: 'group' }, // Previously position 26
  23: { seat: 'H5', area: 'group' }, // Previously position 27
  24: { seat: 'H6', area: 'group' }, // Previously position 28
  25: { seat: 'J1', area: 'group' }, // Previously position 29
  26: { seat: 'J2', area: 'group' }, // Previously position 30
  27: { seat: 'J3', area: 'group' }, // Previously position 31
  28: { seat: 'J4', area: 'group' }, // Previously position 32
  29: { seat: 'J5', area: 'group' }, // Previously position 33
  30: { seat: 'J6', area: 'group' }, // Previously position 34
  31: { seat: 'J7', area: 'group' }, // Previously position 35
  32: { seat: 'J8', area: 'group' }, // Previously position 36
  33: { seat: 'I1', area: 'group' }, // Previously position 37
  34: { seat: 'I2', area: 'group' }, // Previously position 38
  35: { seat: 'I3', area: 'group' }, // Previously position 39
  36: { seat: 'I4', area: 'group' }, // Previously position 40
  37: { seat: 'I5', area: 'group' }, // Previously position 41
  38: { seat: 'I6', area: 'group' }, // Previously position 42
  39: { seat: 'I7', area: 'group' }, // Previously position 43
  40: { seat: 'I8', area: 'group' }, // Previously position 44
  41: { seat: 'I9', area: 'group' }, // Previously position 45
  42: { seat: 'I10', area: 'group' }, // Previously position 46
  43: { seat: 'I11', area: 'group' }, // Previously position 47
  44: { seat: 'I12', area: 'group' }, // Previously position 48
};

const ViewBookedSeats = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookings, bookingDetail, bookingDate, bookingLoading, bookingError, selectedSlot, selectedDate, historyDetailError } = useSelector((state) => state.booking);

  console.log('Bookings:', bookings);
  

  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  console.log('ID:', id);
  console.log('Booking Detail:', bookingDetail);
  console.log('History Detail Error:', historyDetailError);

  useEffect(() => {
    if (id && !hasFetchedDetail && (!bookingDetail || bookingDetail?.data?.bookingId !== Number(id))) {
      console.log('Fetching booking detail for ID:', id);
      dispatch(fetchBookingHistoryDetail({ id }));
      setHasFetchedDetail(true);
    } else if (!id && !hasFetchedHistory && (!bookings || !Array.isArray(bookings.data))) {
      console.log('Fetching booking history');
      dispatch(fetchBookingHistory());
      setHasFetchedHistory(true);
    }
  }, [dispatch, id, bookingDetail, bookings, hasFetchedDetail, hasFetchedHistory]);

  useEffect(() => {
    if (bookingDetail?.data) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      const slotNumber = bookingDetail.data.details[0]?.slotNumber || 1;
      console.log('Setting selected date and slot:', bookingDate, slotNumber);
      dispatch(setSelectedDate(bookingDate));
      dispatch(setSelectedSlot(Number(slotNumber)));
    } else if (bookingDate && !id) {
      console.log('Setting selected date from bookingDate:', bookingDate);
      dispatch(setSelectedDate(bookingDate));
    }
  }, [bookingDetail, bookingDate, dispatch]);

  const bookedSeats = useMemo(() => {
    if (bookingLoading) {
      console.log('Booking is loading, returning empty seats');
      return [];
    }

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      console.log('Booking Date:', bookingDate, 'Selected Date:', selectedDate);
      if (bookingDate !== selectedDate) {
        console.log('Date mismatch, returning empty seats');
        return [];
      }

      const seats = bookingDetail.data.details
        .filter((detail) => {
          console.log('Detail Slot Number:', detail.slotNumber, 'Selected Slot:', selectedSlot);
          return Number(detail.slotNumber) === selectedSlot;
        })
        .map((detail) => {
          console.log('Position:', detail.position, 'Mapped Seat:', positionIdToSeatMap[detail.position]);
          const seatInfo = positionIdToSeatMap[detail.position];
          return seatInfo ? seatInfo.seat : null;
        })
        .filter((seat) => seat !== null);
      console.log('Seats from bookingDetail:', seats);
      return seats;
    }

    if (!bookings || !Array.isArray(bookings.data)) {
      console.log('Bookings data is not an array, returning empty seats');
      return [];
    }
    const seats = bookings.data
      .filter((booking) => {
        if (!booking || !booking.bookingCreatedDate) return false;
        const bookingDate = booking.bookingCreatedDate.split('T')[0];
        console.log('Booking Date (bookings):', bookingDate, 'Selected Date:', selectedDate);
        return bookingDate === selectedDate;
      })
      .flatMap((booking) => {
        if (!booking || !Array.isArray(booking.details)) return [];
        return booking.details
          .filter((detail) => Number(detail.slotNumber) === selectedSlot)
          .map((detail) => {
            const seatInfo = positionIdToSeatMap[detail.position];
            return seatInfo ? seatInfo.seat : null;
          })
          .filter((seat) => seat !== null);
      });
    console.log('Seats from bookings.data:', seats);
    return seats;
  }, [bookingLoading, bookings, bookingDetail, id, selectedDate, selectedSlot]);

  console.log('Selected Date:', selectedDate, 'Selected Slot:', selectedSlot);
  console.log('Booking Loading:', bookingLoading);
  console.log('Booking Error:', bookingError);
  console.log('Booked Seats:', bookedSeats);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Bảng hiển thị vị trí ghế ngồi tại DXLAB</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="mr-2 font-semibold">Chọn ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => dispatch(setSelectedDate(e.target.value))}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="mr-2 font-semibold">Chọn slot:</label>
          <select
            value={selectedSlot}
            onChange={(e) => dispatch(setSelectedSlot(Number(e.target.value)))}
            className="border rounded p-2"
          >
            <option value={1}>Slot 1</option>
            <option value={2}>Slot 2</option>
            <option value={3}>Slot 3</option>
            <option value={4}>Slot 4</option>
          </select>
        </div>
      </div>

      {bookingLoading && (
        <p className="text-center text-orange-500">Đang tải dữ liệu ghế ngồi...</p>
      )}
      {bookingError && (
        <p className="text-center text-red-500">Lỗi: {bookingError}</p>
      )}

      {!bookingLoading && !bookingError && (
        <div className="w-full max-w-5xl space-y-6 border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Chỗ ngồi cá nhân</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <div
              className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md"
              style={{ width: '300px', height: '280px' }}
            >
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
                    className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded ${
                      bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <ArmchairIcon className="w-5 h-5" />
                  </span>
                );
              })}
            </div>

            <div
              className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md"
              style={{ width: '300px', height: '290px' }}
            >
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
                    className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded ${
                      bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    <ArmchairIcon className="w-5 h-5" />
                  </span>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4">Khu vực Nhóm</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(groupSeats).map(([groupType, seats]) => (
                <div
                  key={groupType}
                  className="border-4 border-gray-600 p-4 rounded-md text-center w-full max-w-xs mx-auto"
                >
                  <strong className="text-sm md:text-base block mb-2">{groupType}</strong>
                  <div
                    className="relative flex flex-wrap justify-center items-center"
                    style={{ width: '100%', height: '200px' }}
                  >
                    {groupType === '6-seats-1' || groupType === '6-seats-2' ? (
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
                          className={`absolute w-10 h-10 flex items-center justify-center p-1 rounded ${
                            bookedSeats.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}
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
      )}
    </div>
  );
};

export default ViewBookedSeats;