import { ArmchairIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';
import { getRoomById, fetchRooms } from '../../redux/slices/Room';

// Dynamically map areas to group identifiers
const createAreaToGroupMap = (areas) => {
  const map = {};
  areas.forEach((area, index) => {
    const areaKey = `${area.areaName}-${area.areaTypeName}`.trim().toLowerCase();
    map[areaKey] = `group-area-${index}`;
  });
  return map;
};

// Function to parse the number of seats from areaTypeName
const parseNumberOfSeats = (areaTypeName) => {
  if (!areaTypeName) return 0;
  const match = areaTypeName.match(/Khu vực (\d+) người/);
  return match ? parseInt(match[1], 10) : 0;
};

// Dynamically generate seats and position mapping based on number of seats
const generateSeatsAndMapping = (numberOfSeats) => {
  const seatsPerTable = 6;
  const tables = [];
  const positionIdToSeatMap = {};

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
  const { bookingDetail, bookingLoading, selectedSlot, selectedDate } = useSelector((state) => state.booking);
  const { selectedRoom, loading: roomLoading, rooms } = useSelector((state) => state.rooms);

  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [hasFetchedRooms, setHasFetchedRooms] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Fetch the list of rooms if not already fetched
  useEffect(() => {
    if (!hasFetchedRooms && (!rooms || rooms.length === 0)) {
      dispatch(fetchRooms());
      setHasFetchedRooms(true);
    }
  }, [dispatch, rooms, hasFetchedRooms]);

  // Fetch booking details
  useEffect(() => {
    if (id && !hasFetchedDetail && (!bookingDetail || bookingDetail?.data?.bookingId !== Number(id))) {
      dispatch(fetchBookingHistoryDetail({ id }));
      setHasFetchedDetail(true);
    }
  }, [dispatch, id, bookingDetail, hasFetchedDetail]);

  // Fetch room data if necessary
  useEffect(() => {
    if (id && bookingDetail?.data) {
      const roomName = bookingDetail.data.details[0]?.roomName;

      if (roomName) {
        const room = rooms.find((r) => r.roomName === roomName);
        if (room && room.roomId) {
          if (!selectedRoom || selectedRoom.roomId !== room.roomId) {
            dispatch(getRoomById(room.roomId));
          }
        } else {
          console.warn(`Room with name ${roomName} not found in rooms list.`);
        }
      } else {
        console.warn('No roomName found in bookingDetail.data.details[0]');
      }
    }
  }, [dispatch, id, bookingDetail, rooms, selectedRoom]);

  // Extract available dates and slots from bookingDetail
  useEffect(() => {
    if (bookingDetail?.data?.details?.length > 0) {
      console.log('bookingDetail.data.details:', bookingDetail.data.details);

      // Extract unique dates
      const dates = [
        ...new Set(
          bookingDetail.data.details.map(detail => {
            const date = detail.checkinTime.split('T')[0];
            console.log('Extracted date:', date);
            return date;
          })
        ),
      ];
      console.log('Available dates:', dates);
      setAvailableDates(dates);

      // Set initial selected date to the first available date
      if (dates.length > 0 && (!selectedDate || !dates.includes(selectedDate))) {
        console.log('Setting selectedDate to:', dates[0]);
        dispatch(setSelectedDate(dates[0]));
      }

      // Update available slots based on selected date
      const currentDate = selectedDate || dates[0];
      if (currentDate) {
        const slots = bookingDetail.data.details
          .filter(detail => {
            const detailDate = detail.checkinTime.split('T')[0];
            console.log(`Comparing ${detailDate} with ${currentDate}`);
            return detailDate === currentDate;
          })
          .map(detail => {
            console.log('Extracted slot:', detail.slotNumber);
            return Number(detail.slotNumber);
          });
        const uniqueSlots = [...new Set(slots)];
        console.log('Available slots for date', currentDate, ':', uniqueSlots);
        setAvailableSlots(uniqueSlots);

        // Set initial selected slot to the first available slot for the selected date
        if (uniqueSlots.length > 0 && (!selectedSlot || !uniqueSlots.includes(selectedSlot))) {
          console.log('Setting selectedSlot to:', uniqueSlots[0]);
          dispatch(setSelectedSlot(uniqueSlots[0]));
        }
      }
    } else {
      console.log('No details found in bookingDetail');
      setAvailableDates([]);
      setAvailableSlots([]);
    }
  }, [bookingDetail, selectedDate, selectedSlot, dispatch]);

  // Get individual area
  const individualArea = useMemo(() => {
    if (!selectedRoom?.area_DTO) return null;
    return selectedRoom.area_DTO.find(area => area.areaTypeCategoryId === 1);
  }, [selectedRoom]);

  // Parse number of seats and generate seats and position mapping
  const { tables: individualTables, positionIdToSeatMap } = useMemo(() => {
    const numberOfSeats = parseNumberOfSeats(individualArea?.areaTypeName);
    return generateSeatsAndMapping(numberOfSeats);
  }, [individualArea]);

  // Create the areaToGroupMap dynamically based on selectedRoom areas
  const areaToGroupMap = useMemo(() => {
    if (!selectedRoom?.area_DTO) return {};
    const map = createAreaToGroupMap(selectedRoom.area_DTO.filter(area => area.areaTypeCategoryId === 2));
    console.log('areaToGroupMap:', map);
    return map;
  }, [selectedRoom]);

  // Filter group areas from selectedRoom
  const groupAreas = useMemo(() => {
    if (!selectedRoom?.area_DTO) return [];
    return selectedRoom.area_DTO.filter(area => area.areaTypeCategoryId === 2);
  }, [selectedRoom]);

  // Compute booked seats using bookingDetail
  const bookedSeats = useMemo(() => {
    if (bookingLoading || !selectedRoom) {
      console.log('Booking loading or no selectedRoom');
      return { individual: [], groups: [] };
    }

    const individual = [];
    const groups = [];
    const maxPositionId = parseNumberOfSeats(individualArea?.areaTypeName);

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      console.log('Filtering booked seats with selectedDate:', selectedDate, 'and selectedSlot:', selectedSlot);
      bookingDetail.data.details
        .filter(detail => {
          const detailDate = detail.checkinTime.split('T')[0];
          const matchesDate = detailDate === selectedDate;
          const matchesSlot = Number(detail.slotNumber) === selectedSlot;
          console.log(`Detail: ${detail.checkinTime}, Slot: ${detail.slotNumber}, Matches: ${matchesDate && matchesSlot}`);
          return matchesDate && matchesSlot;
        })
        .forEach(detail => {
          const positionId = detail.position;
          console.log('Processing position:', positionId);
          if (positionId > maxPositionId) return;

          const seatInfo = positionIdToSeatMap[positionId];
          if (seatInfo && seatInfo.area === 'individual') {
            console.log('Adding individual seat:', seatInfo.seat);
            individual.push(seatInfo.seat);
          }

          const areaKey = `${detail.areaName}-${detail.areaTypeName}`.trim().toLowerCase();
          console.log('Constructed areaKey:', areaKey);
          const groupArea = areaToGroupMap[areaKey];
          if (groupArea && !groups.includes(groupArea)) {
            console.log('Adding group area:', groupArea);
            groups.push(groupArea);
          }
        });

      console.log('bookedSeats from bookingDetail:', { individual, groups });
      return { individual, groups };
    }

    console.log('No bookingDetail data or ID mismatch');
    return { individual: [], groups: [] };
  }, [bookingLoading, bookingDetail, id, selectedDate, selectedSlot, areaToGroupMap, selectedRoom, individualArea, positionIdToSeatMap]);

  const hasAreas = selectedRoom?.area_DTO && selectedRoom.area_DTO.length > 0;

  return (
    <div className="p-6 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Bảng hiển thị vị trí ghế ngồi tại DXLAB</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div>
          <label className="mr-2 font-semibold">Chọn ngày:</label>
          <select
            value={selectedDate || ''}
            onChange={(e) => {
              const newDate = e.target.value;
              console.log('Selected date changed to:', newDate);
              dispatch(setSelectedDate(newDate));
              // Update available slots when date changes
              const slots = bookingDetail?.data?.details
                ?.filter(detail => detail.checkinTime.split('T')[0] === newDate)
                .map(detail => Number(detail.slotNumber)) || [];
              const uniqueSlots = [...new Set(slots)];
              console.log('New available slots:', uniqueSlots);
              setAvailableSlots(uniqueSlots);
              if (uniqueSlots.length > 0) {
                dispatch(setSelectedSlot(uniqueSlots[0]));
              }
            }}
            className="border rounded p-2 bg-gray-400"
          >
            {availableDates.length > 0 ? (
              availableDates.map(date => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))
            ) : (
              <option value="">Không có ngày</option>
            )}
          </select>
        </div>
        <div>
          <label className="mr-2 font-semibold">Chọn slot:</label>
          <select
            value={selectedSlot || ''}
            onChange={(e) => {
              const newSlot = Number(e.target.value);
              console.log('Selected slot changed to:', newSlot);
              dispatch(setSelectedSlot(newSlot));
            }}
            className="border rounded p-2 bg-gray-400"
          >
            {availableSlots.length > 0 ? (
              availableSlots.map(slot => (
                <option key={slot} value={slot}>
                  Slot {slot}
                </option>
              ))
            ) : (
              <option value="">Không có slot</option>
            )}
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
        <p className="text-center text-gray-500 inline">
          Phòng không tồn tại hoặc không thể tải thông tin phòng. Vui lòng kiểm tra lại lịch sử giao dịch.
        </p>
      )}

      {!roomLoading && !bookingLoading && selectedRoom && !hasAreas && (
        <p className="text-center text-gray-500 inline">Không có khu vực nào hiện tại trong phòng.</p>
      )}

      {!roomLoading && !bookingLoading && selectedRoom && hasAreas && (
        <div className="w-full max-w-5xl space-y-6 border rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
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

            {groupAreas.length > 0 && (
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-2xl font-bold mb-4">Khu vực Nhóm</h2>
                <div className="flex flex-col gap-6">
                  {groupAreas.map((area, index) => {
                    const areaKey = `${area.areaName}-${area.areaTypeName}`.trim().toLowerCase();
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