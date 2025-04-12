import { ArmchairIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistory, fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';
import { getRoomById } from '../../redux/slices/Room';

// Dynamically map areas to group identifiers
const createAreaToGroupMap = (areas) => {
  const map = {};
  areas.forEach((area, index) => {
    const areaKey = `${area.areaName}-${area.areaTypeName}`.trim().toLowerCase();
    map[areaKey] = `group-area-${index}`; // Unique identifier for each group area
  });
  return map;
};

// Function to parse the number of seats from areaTypeName (e.g., "Khu vực 12 người" → 12)
const parseNumberOfSeats = (areaTypeName) => {
  if (!areaTypeName) return 0;
  const match = areaTypeName.match(/Khu vực (\d+) người/);
  return match ? parseInt(match[1], 10) : 0;
};

// Dynamically generate seats and position mapping based on number of seats
const generateSeatsAndMapping = (numberOfSeats) => {
  const seatsPerTable = 6; // Maximum seats per table
  const tables = [];
  const positionIdToSeatMap = {};

  // Generate seats (e.g., A1, A2, ..., A12 for 12 seats)
  let seatIndex = 1;
  for (let i = 0; i < numberOfSeats; i += seatsPerTable) {
    const tableSeats = [];
    for (let j = 0; j < seatsPerTable && seatIndex <= numberOfSeats; j++) {
      const seatLabel = `A${seatIndex}`;
      tableSeats.push(seatLabel);
      positionIdToSeatMap[seatIndex] = { seat: seatLabel, area: 'individual' };
      seatIndex++;
    }
    tables.push(tableSeats);
  }

  return { tables, positionIdToSeatMap };
};

const ViewBookedSeats = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { bookings, bookingDetail, bookingDate, bookingLoading, selectedSlot, selectedDate } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading, rooms } = useSelector((state) => state.rooms);

  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);

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

  // Fetch room data if necessary
  useEffect(() => {
    if (id && bookingDetail?.data) {
      const roomName = bookingDetail.data.details[0]?.roomName;
      if (roomName) {
        const room = rooms.find((r) => r.roomName === roomName);
        if (room && room.roomId) {
          // If selectedRoom is not set or doesn't match the roomId, fetch the room
          if (!selectedRoom || selectedRoom.roomId !== room.roomId) {
            dispatch(getRoomById(room.roomId));
          }
        } else {
          console.warn(`Room with name ${roomName} not found in rooms list.`);
        }
      }
    }
  }, [dispatch, id, bookingDetail, rooms, selectedRoom]);

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

  // Get individual area
  const individualArea = useMemo(() => {
    if (!selectedRoom?.area_DTO) return null;
    return selectedRoom.area_DTO.find(area => area.areaTypeId === 1); // Find individual area
  }, [selectedRoom]);

  // Parse number of seats and generate seats and position mapping
  const { tables: individualTables, positionIdToSeatMap } = useMemo(() => {
    const numberOfSeats = parseNumberOfSeats(individualArea?.areaTypeName);
    return generateSeatsAndMapping(numberOfSeats);
  }, [individualArea]);

  // Create the areaToGroupMap dynamically based on selectedRoom areas
  const areaToGroupMap = useMemo(() => {
    if (!selectedRoom?.area_DTO) return {};
    const map = createAreaToGroupMap(selectedRoom.area_DTO.filter(area => area.areaTypeId !== 1)); // Exclude individual areas
    console.log('areaToGroupMap:', map); // Debug log
    return map;
  }, [selectedRoom]);

  // Filter group areas from selectedRoom
  const groupAreas = useMemo(() => {
    if (!selectedRoom?.area_DTO) return [];
    return selectedRoom.area_DTO.filter(area => area.areaTypeId !== 1); // Exclude individual areas
  }, [selectedRoom]);

  // Compute booked seats
  const bookedSeats = useMemo(() => {
    if (bookingLoading || !selectedRoom) return { individual: [], groups: [] }; // Return empty if no room data

    const individual = [];
    const groups = [];
    const maxPositionId = parseNumberOfSeats(individualArea?.areaTypeName); // Maximum positionId based on numberOfSeats

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      const bookingDate = bookingDetail.data.bookingCreatedDate.split('T')[0];
      if (bookingDate !== selectedDate) return { individual: [], groups: [] };

      console.log('Processing bookingDetail:', bookingDetail.data.details); // Debug log
      console.log('selectedDate:', selectedDate, 'selectedSlot:', selectedSlot); // Debug log

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
          const areaKey = `${detail.areaName}-${detail.areaTypeName}`.trim().toLowerCase();
          console.log('Constructed areaKey:', areaKey); // Debug log
          const groupArea = areaToGroupMap[areaKey];
          if (groupArea && !groups.includes(groupArea)) {
            groups.push(groupArea);
          }
        });

      console.log('bookedSeats from bookingDetail:', { individual, groups }); // Debug log
      return { individual, groups };
    }

    if (!bookings || !Array.isArray(bookings.data)) return { individual: [], groups: [] };

    console.log('Processing bookings:', bookings.data); // Debug log
    console.log('selectedDate:', selectedDate, 'selectedSlot:', selectedSlot); // Debug log

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
            const areaKey = `${detail.areaName}-${detail.areaTypeName}`.trim().toLowerCase();
            console.log('Constructed areaKey:', areaKey); // Debug log
            const groupArea = areaToGroupMap[areaKey];
            if (groupArea && !groups.includes(groupArea)) {
              groups.push(groupArea);
            }
          });
      });

    console.log('bookedSeats from bookings:', { individual, groups }); // Debug log
    return { individual, groups };
  }, [bookingLoading, bookings, bookingDetail, id, selectedDate, selectedSlot, areaToGroupMap, selectedRoom, individualArea, positionIdToSeatMap]);

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
            {/* Individual Seats (Dynamic Display) */}
            {individualArea && individualTables.length > 0 && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold mb-4">Khu vực cá nhân</h2>
                {individualTables.map((tableSeats, tableIndex) => (
                  <div
                    key={`table-${tableIndex}`}
                    className="relative flex justify-center items-center border-4 border-gray-600 p-6 rounded-lg shadow-md w-full sm:w-[300px]"
                    style={{ height: '300px' }}
                  >
                    <img
                      src={table_images}
                      alt="Table"
                      className="absolute w-28 h-28 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                    {tableSeats.map((seat, index) => {
                      const angle = (360 / tableSeats.length) * index;
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
                ))}
              </div>
            )}

            {/* Group Areas (Dynamic) */}
            {groupAreas.length > 0 && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold mb-4">Khu vực Nhóm</h2>
                <div className="flex flex-col gap-6">
                  {groupAreas.map((area, index) => {
                    const areaKey = `${area.areaName}-${area.areaTypeName}`.trim().toLowerCase();
                    const groupAreaId = areaToGroupMap[areaKey];
                    console.log(`Rendering group area: ${areaKey}, groupAreaId: ${groupAreaId}, isBooked: ${bookedSeats.groups.includes(groupAreaId)}`); // Debug log
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