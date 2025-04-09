import { ArmchairIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistory, fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';
import { getRoomById } from '../../redux/slices/Room';

const individualSeats = {
  table1: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'], // 4 seats
  table2: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'], // 6 seats
};

// Dynamically map areas to group identifiers
const createAreaToGroupMap = (areas) => {
  const map = {};
  areas.forEach((area, index) => {
    const areaKey = `${area.areaName}-${area.areaTypeName}`;
    map[areaKey] = `group-area-${index}`; // Unique identifier for each group area
  });
  return map;
};

// Map position IDs to individual seats (kept static as per requirement)
const positionIdToSeatMap = {
  1: { seat: 'A1', area: 'individual' },
  2: { seat: 'A2', area: 'individual' },
  3: { seat: 'A3', area: 'individual' },
  4: { seat: 'A4', area: 'individual' },
  5: { seat: 'A5', area: 'individual' },
  6: { seat: 'A6', area: 'individual' },

  7: { seat: 'A7', area: 'individual' },
  8: { seat: 'A8', area: 'individual' },
  9: { seat: 'A9', area: 'individual' },
  10: { seat: 'A10', area: 'individual' },
  11: { seat: 'A11', area: 'individual' },
  12: { seat: 'A12', area: 'individual' },
};

const ViewBookedSeats = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookings, bookingDetail, bookingDate, bookingLoading, selectedSlot, selectedDate } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading } = useSelector((state) => state.rooms);

  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

  console.log(selectedRoom, 'selectedRoom');
  

  // Fetch room data if not already fetched and ID exists
  useEffect(() => {
    if (id && !selectedRoom) {
      dispatch(getRoomById(id));
    }
  }, [dispatch, id, selectedRoom]);

  // Fetch booking details or history
  useEffect(() => {
    if (id && !hasFetchedDetail && (!bookingDetail || bookingDetail?.data?.bookingId !== Number(id))) {
      dispatch(fetchBookingHistoryDetail({ id }));
      setHasFetchedDetail(true);
    } else if (!id && !hasFetchedHistory && (!bookings || !Array.isArray(bookings.data))) {
      dispatch(fetchBookingHistory());
      setHasFetchedHistory(true);
    }
  }, [dispatch, id, bookingDetail, bookings, hasFetchedDetail, hasFetchedHistory]);

  // Set selected date and slot based on booking detail
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

  // Get individual area and number of seats
  const individualArea = useMemo(() => {
    if (!selectedRoom?.area_DTO) return null;
    return selectedRoom.area_DTO.find(area => area.areaId === 1); // Find individual area
  }, [selectedRoom]);

  // Determine which tables to display based on numberOfSeats
  const tablesToDisplay = useMemo(() => {
    if (!individualArea || !individualArea.areaTypeName) return { showTable1: false, showTable2: false };

    const numberOfSeats = individualArea.areaTypeName;
    if (numberOfSeats === 'Khu vực 12 người') {
      return { showTable1: true, showTable2: true }; // Show table1 for 1-4 seats
    } 
  }, [individualArea]);

  // Debug logs to check data
  console.log('selectedRoom:', selectedRoom);
  console.log('individualArea:', individualArea);
  console.log('numberOfSeats:', individualArea?.areaTypeName);
  console.log('tablesToDisplay:', tablesToDisplay);
  console.log('roomLoading:', roomLoading);
  console.log('bookingLoading:', bookingLoading);

  // Create the areaToGroupMap dynamically based on selectedRoom areas
  const areaToGroupMap = useMemo(() => {
    if (!selectedRoom?.area_DTO) return {};
    return createAreaToGroupMap(selectedRoom.area_DTO.filter(area => area.areaId !== 1)); // Exclude individual areas
  }, [selectedRoom]);

  // Filter group areas from selectedRoom
  const groupAreas = useMemo(() => {
    if (!selectedRoom?.area_DTO) return [];
    return selectedRoom.area_DTO.filter(area => area.areaId !== 1); // Exclude individual areas
  }, [selectedRoom]);

  // Compute booked seats, ensuring only valid seats are included based on numberOfSeats
  const bookedSeats = useMemo(() => {
    if (bookingLoading || !selectedRoom) return { individual: [], groups: [] }; // Return empty if no room data

    const individual = [];
    const groups = [];
    const maxPositionId = individualArea?.areaTypeName || 0; // Maximum positionId based on numberOfSeats

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      if (bookingDate !== selectedDate) return { individual: [], groups: [] };

      bookingDetail.data.details
        .filter((detail) => Number(detail.slotNumber) === selectedSlot)
        .forEach((detail) => {
          // Handle individual seats
          const positionId = detail.position;
          if (positionId > maxPositionId) return; // Skip if positionId exceeds numberOfSeats

          const seatInfo = positionIdToSeatMap[positionId];
          if (seatInfo && seatInfo.area === 'individual') {
            individual.push(seatInfo.seat);
          }

          // Handle group areas
          const areaKey = `${detail.areaName}-${detail.areaTypeName}`;
          const groupArea = areaToGroupMap[areaKey];
          if (groupArea && !groups.includes(groupArea)) {
            groups.push(groupArea);
          }
        });

      return { individual, groups };
    }

    if (!bookings || !Array.isArray(bookings.data)) return { individual: [], groups: [] };

    bookings.data
      .filter((booking) => {
        if (!booking || !booking.bookingCreatedDate) return false;
        const bookingDate = booking.bookingCreatedDate.split('T')[0];
        return bookingDate === selectedDate;
      })
      .forEach((booking) => {
        if (!booking || !Array.isArray(booking.details)) return;

        booking.details
          .filter((detail) => Number(detail.slotNumber) === selectedSlot)
          .forEach((detail) => {
            // Handle individual seats
            const positionId = detail.position;
            if (positionId > maxPositionId) return; // Skip if positionId exceeds numberOfSeats

            const seatInfo = positionIdToSeatMap[positionId];
            if (seatInfo && seatInfo.area === 'individual') {
              individual.push(seatInfo.seat);
            }

            // Handle group areas
            const areaKey = `${detail.areaName}-${detail.areaTypeName}`;
            const groupArea = areaToGroupMap[areaKey];
            if (groupArea && !groups.includes(groupArea)) {
              groups.push(groupArea);
            }
          });
      });

    return { individual, groups };
  }, [bookingLoading, bookings, bookingDetail, id, selectedDate, selectedSlot, areaToGroupMap, selectedRoom, individualArea]);

  // Check if the room has any areas (including individual areas)
  const hasAreas = selectedRoom?.area_DTO && selectedRoom.area_DTO.length > 0;

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
            className="border rounded p-2 bg-gray-400"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div>
          <label className="mr-2 font-semibold">Chọn slot:</label>
          <select
            value={selectedSlot}
            onChange={(e) => dispatch(setSelectedSlot(Number(e.target.value)))}
            className="border rounded p-2 bg-gray-400"
          >
            <option value={1}>Slot 1</option>
            <option value={2}>Slot 2</option>
            <option value={3}>Slot 3</option>
            <option value={4}>Slot 4</option>
          </select>
        </div>
      </div>

      {roomLoading && (
        <p className="text-center text-orange-500">Đang tải thông tin phòng...</p>
      )}
      {bookingLoading && (
        <p className="text-center text-orange-500">Đang tải dữ liệu ghế ngồi...</p>
      )}

      {!roomLoading && !bookingLoading && !selectedRoom && (
        <p className="text-center text-gray-500 inline">Phòng không tồn tại.</p>
      )}

      {!roomLoading && !bookingLoading && selectedRoom && !hasAreas && (
        <p className="text-center text-gray-500 inline">Không có khu vực nào hiện tại trong phòng.</p>
      )}

      {!roomLoading && !bookingLoading && selectedRoom && hasAreas && (
        <div className="w-full max-w-5xl space-y-6 border rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
            {/* Individual Seats (Conditional Display) */}
            {(tablesToDisplay.showTable1 || tablesToDisplay.showTable2) && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold mb-4">Khu vực cá nhân</h2>
                {tablesToDisplay.showTable1 && (
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
                            bookedSeats.individual.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                          <ArmchairIcon className="w-5 h-5" />
                        </span>
                      );
                    })}
                  </div>
                )}
                {tablesToDisplay.showTable2 && (
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
                            bookedSeats.individual.includes(seat) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}
                          style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                          <ArmchairIcon className="w-5 h-5" />
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Group Areas (Dynamic) */}
            {groupAreas.length > 0 && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold mb-4">Khu vực Nhóm</h2>
                <div className="flex flex-col gap-6">
                  {groupAreas.map((area, index) => {
                    const areaKey = `${area.areaName}-${area.areaTypeName}`;
                    const groupAreaId = areaToGroupMap[areaKey];
                    return (
                      <div
                        key={index}
                        className={`border-4 border-gray-600 p-4 rounded-md text-center flex justify-center items-center w-full sm:w-[300px] ${
                          bookedSeats.groups.includes(groupAreaId) ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                        }`}
                        style={{ height: '300px' }}
                      >
                        <strong className="text-sm md:text-base">{area.areaName} ({area.areaTypeName})</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBookedSeats;