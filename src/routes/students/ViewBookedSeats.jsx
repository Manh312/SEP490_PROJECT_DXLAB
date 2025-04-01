import { ArmchairIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistory, fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';

const individualSeats = {
  table1: ['A1', 'A2', 'A3', 'A4'],
  table2: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
};

const groupSeats = {
  '8-seats': [['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8']],
  '6-seats-1': [['I1', 'I2', 'I3', 'I4', 'I5', 'I6']],
  '6-seats-2': [['I7', 'I8', 'I9', 'I10', 'I11', 'I12']],
};

const positionIdToSeatMap = { 
  1: { seat: 'A1', area: 'individual' }, 
  2: { seat: 'A2', area: 'individual' },
  3: { seat: 'A3', area: 'individual' },
  4: { seat: 'A4', area: 'individual' },
  5: { seat: 'B1', area: 'individual' },
  6: { seat: 'B2', area: 'individual' },
  7: { seat: 'B3', area: 'individual' },
  8: { seat: 'B4', area: 'individual' },
  9: { seat: 'B5', area: 'individual' },
  10: { seat: 'B6', area: 'individual' },
};

const ViewBookedSeats = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookings, bookingDetail, bookingDate, bookingLoading, bookingError, selectedSlot, selectedDate } = useSelector((state) => state.booking);

  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  useEffect(() => {
    if (id && !hasFetchedDetail && (!bookingDetail || bookingDetail?.data?.bookingId !== Number(id))) {
      dispatch(fetchBookingHistoryDetail({ id }));
      setHasFetchedDetail(true);
    } else if (!id && !hasFetchedHistory && (!bookings || !Array.isArray(bookings.data))) {
      dispatch(fetchBookingHistory());
      setHasFetchedHistory(true);
    }
  }, [dispatch, id, bookingDetail, bookings, hasFetchedDetail, hasFetchedHistory]);

  useEffect(() => {
    if (bookingDetail?.data) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      const slotNumber = bookingDetail.data.details[0]?.slotNumber || 1;
      dispatch(setSelectedDate(bookingDate));
      dispatch(setSelectedSlot(Number(slotNumber)));
    } else if (bookingDate && !id) {
      dispatch(setSelectedDate(bookingDate));
    }
  }, [bookingDetail, bookingDate, dispatch]);

  const bookedSeats = useMemo(() => {
    if (bookingLoading) return [];

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      if (bookingDate !== selectedDate) return [];

      const seats = bookingDetail.data.details
        .filter((detail) => Number(detail.slotNumber) === selectedSlot)
        .map((detail) => {
          const seatInfo = positionIdToSeatMap[detail.position];
          return seatInfo ? seatInfo.seat : null;
        })
        .filter((seat) => seat !== null);
      return seats;
    }

    if (!bookings || !Array.isArray(bookings.data)) return [];

    const seats = bookings.data
      .filter((booking) => {
        if (!booking || !booking.bookingCreatedDate) return false;
        const bookingDate = booking.bookingCreatedDate.split('T')[0];
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
    return seats;
  }, [bookingLoading, bookings, bookingDetail, id, selectedDate, selectedSlot]);

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
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
            {/* Individual Seats (Vertical) */}
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-bold mb-4">Chỗ ngồi cá nhân</h2>
              <div
                className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md w-full sm:w-[300px]"
                style={{ height: '300px' }}
              >
                <img
                  src={table_images}
                  alt="Table"
                  className="absolute w-28 h-28 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
                className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md w-full sm:w-[300px]"
                style={{ height: '300px' }}
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

            {/* Group Seats */}
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-bold mb-4">Khu vực Nhóm</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 8-seats in the middle */}
                <div
                  className={`border-4 border-gray-600 p-4 rounded-md text-center flex flex-col justify-center items-center w-full sm:w-[300px] mt-0 sm:mt-50 ${
                    groupSeats['8-seats'][0].some((seat) => bookedSeats.includes(seat))
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                  style={{ height: '300px' }}
                >
                  <strong className="text-sm md:text-base mt-4">8-seats</strong>
                </div>

                {/* 6-seats-1 and 6-seats-2 in a vertical column */}
                <div className="flex flex-col gap-6">
                  <div
                    className={`border-4 border-gray-600 p-4 rounded-md text-center flex justify-center items-center w-full sm:w-[300px] ${
                      groupSeats['6-seats-1'][0].some((seat) => bookedSeats.includes(seat))
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                    style={{ height: '300px' }}
                  >
                    <strong className="text-sm md:text-base">6-seats-1</strong>
                  </div>
                  <div
                    className={`border-4 border-gray-600 p-4 rounded-md text-center flex justify-center items-center w-full sm:w-[300px] ${
                      groupSeats['6-seats-2'][0].some((seat) => bookedSeats.includes(seat))
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                    style={{ height: '300px' }}
                  >
                    <strong className="text-sm md:text-base">6-seats-2</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBookedSeats;