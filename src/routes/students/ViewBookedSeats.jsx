import { ArmchairIcon, DoorOpenIcon, Tv } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import table_images from '../../assets/table.png';
import { useEffect, useMemo, useState } from 'react';
import { fetchBookingHistoryDetail, setSelectedDate, setSelectedSlot } from '../../redux/slices/Booking';
import { useParams } from 'react-router-dom';
import { getRoomById, fetchRooms } from '../../redux/slices/Room';
import { motion, AnimatePresence } from 'framer-motion';

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
      const dates = [
        ...new Set(
          bookingDetail.data.details.map(detail => detail.checkinTime.split('T')[0])
        ),
      ];
      setAvailableDates(dates);

      if (dates.length > 0 && (!selectedDate || !dates.includes(selectedDate))) {
        dispatch(setSelectedDate(dates[0]));
      }

      const currentDate = selectedDate || dates[0];
      if (currentDate) {
        const slots = bookingDetail.data.details
          .filter(detail => detail.checkinTime.split('T')[0] === currentDate)
          .map(detail => Number(detail.slotNumber));
        const uniqueSlots = [...new Set(slots)];
        setAvailableSlots(uniqueSlots);

        if (uniqueSlots.length > 0 && (!selectedSlot || !uniqueSlots.includes(selectedSlot))) {
          dispatch(setSelectedSlot(uniqueSlots[0]));
        }
      }
    } else {
      setAvailableDates([]);
      setAvailableSlots([]);
    }
  }, [bookingDetail, selectedDate, selectedSlot, dispatch]);

  // Get individual area (active only: status === 1)
  const individualArea = useMemo(() => {
    if (!selectedRoom?.area_DTO) return null;
    return selectedRoom.area_DTO.find(area => area.areaTypeCategoryId === 1 && area.status === 1);
  }, [selectedRoom]);

  // Parse number of seats and generate seats and position mapping
  const { tables: individualTables, positionIdToSeatMap } = useMemo(() => {
    const numberOfSeats = parseNumberOfSeats(individualArea?.areaTypeName);
    return generateSeatsAndMapping(numberOfSeats);
  }, [individualArea]);

  // Create a reverse mapping from seat label to position
  const seatToPositionMap = useMemo(() => {
    const map = {};
    Object.entries(positionIdToSeatMap).forEach(([position, { seat }]) => {
      map[seat] = position;
    });
    return map;
  }, [positionIdToSeatMap]);

  // Create the areaToGroupMap dynamically based on selectedRoom areas (active only: status === 1)
  const areaToGroupMap = useMemo(() => {
    if (!selectedRoom?.area_DTO) return {};
    const activeGroupAreas = selectedRoom.area_DTO.filter(
      area => area.areaTypeCategoryId === 2 && area.status === 1
    );
    return createAreaToGroupMap(activeGroupAreas);
  }, [selectedRoom]);

  // Filter group areas from selectedRoom (active only: status === 1)
  const groupAreas = useMemo(() => {
    if (!selectedRoom?.area_DTO) return [];
    return selectedRoom.area_DTO.filter(area => area.areaTypeCategoryId === 2 && area.status === 1);
  }, [selectedRoom]);

  // Compute booked seats using bookingDetail
  const bookedSeats = useMemo(() => {
    if (bookingLoading || !selectedRoom) {
      return { individual: [], groups: [] };
    }

    const individual = [];
    const groups = [];
    const maxPositionId = parseNumberOfSeats(individualArea?.areaTypeName);

    if (id && bookingDetail?.data?.bookingId === Number(id) && Array.isArray(bookingDetail.data.details)) {
      bookingDetail.data.details
        .filter(detail => {
          const detailDate = detail.checkinTime.split('T')[0];
          return detailDate === selectedDate && Number(detail.slotNumber) === selectedSlot;
        })
        .forEach(detail => {
          const positionId = detail.position;
          if (positionId > maxPositionId) return;

          const seatInfo = positionIdToSeatMap[positionId];
          if (seatInfo && seatInfo.area === 'individual') {
            individual.push(seatInfo.seat);
          }

          const areaKey = `${detail.areaName}-${detail.areaTypeName}`.trim().toLowerCase();
          const groupArea = areaToGroupMap[areaKey];
          if (groupArea && !groups.includes(groupArea)) {
            groups.push(groupArea);
          }
        });

      return { individual, groups };
    }

    return { individual: [], groups: [] };
  }, [bookingLoading, bookingDetail, id, selectedDate, selectedSlot, areaToGroupMap, selectedRoom, individualArea, positionIdToSeatMap]);

  // Check if there are active areas to display
  const hasAreas = useMemo(() => {
    if (!selectedRoom?.area_DTO) return false;
    return selectedRoom.area_DTO.some(area => area.status === 1);
  }, [selectedRoom]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-bold text-center mb-12 tracking-tight">
          Bảng Hiển Thị Vị Trí Ghế Ngồi Tại DXLAB
        </h1>

        {/* Date and Slot Selection */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12 justify-center"
          variants={itemVariants}
        >
          <div className="flex flex-col w-full sm:w-64">
            <label className="text-sm font-semibold mb-2">Ngày đặt</label>
            <select
              value={selectedDate || ''}
              onChange={(e) => {
                const newDate = e.target.value;
                dispatch(setSelectedDate(newDate));
                const slots = bookingDetail?.data?.details
                  ?.filter(detail => detail.checkinTime.split('T')[0] === newDate)
                  .map(detail => Number(detail.slotNumber)) || [];
                const uniqueSlots = [...new Set(slots)];
                setAvailableSlots(uniqueSlots);
                if (uniqueSlots.length > 0) {
                  dispatch(setSelectedSlot(uniqueSlots[0]));
                }
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
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
          <div className="flex flex-col w-full sm:w-64">
            <label className="text-sm font-semibold mb-2">Slot đặt</label>
            <select
              value={selectedSlot || ''}
              onChange={(e) => {
                const newSlot = Number(e.target.value);
                dispatch(setSelectedSlot(newSlot));
              }}
              className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 ease-in-out"
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
        </motion.div>

        {/* Loading and Error States */}
        <AnimatePresence>
          {roomLoading && (
            <motion.p
              className="text-center text-orange-600 font-medium animate-pulse"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              Đang tải thông tin phòng...
            </motion.p>
          )}
          {bookingLoading && (
            <motion.p
              className="text-center text-orange-600 font-medium animate-pulse"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              Đang tải dữ liệu ghế ngồi...
            </motion.p>
          )}
          {!roomLoading && !bookingLoading && !selectedRoom && (
            <motion.p
              className="text-center text-gray-600 font-medium bg-gray-200 py-4 px-6 rounded-lg shadow-sm mx-auto"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              Phòng không tồn tại hoặc không thể tải thông tin phòng. Vui lòng kiểm tra lại lịch sử giao dịch.
            </motion.p>
          )}
          {!roomLoading && !bookingLoading && selectedRoom && !hasAreas && (
            <motion.p
              className="text-center text-gray-600 font-medium bg-gray-200 py-4 px-6 rounded-lg shadow-sm mx-auto"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              Không có khu vực hoạt động nào hiện tại trong phòng.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!roomLoading && !bookingLoading && selectedRoom && hasAreas && (
          <motion.div
            className="rounded-xl shadow-lg p-8 relative"
            variants={containerVariants}
          >
            {/* Door Indicator */}
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-2 bg-orange-100 text-orange-700 font-medium px-4 py-2 rounded-lg shadow-sm"
              variants={itemVariants}
            >
              <DoorOpenIcon className="w-5 h-5" />
              <span>Lối vào</span>
            </motion.div>

            {/* Room Name */}
            <motion.div
              className="w-full flex flex-col items-center gap-6 pl-16 -mt-10"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <Tv className="w-20 h-20 text-orange-500" />
              </div>
            </motion.div>

            <div className="flex flex-col gap-12 mt-15">
              {/* Group Area Section - 5-Dot Dice Pattern */}
              {groupAreas.length > 0 && (
                <motion.div
                  className="flex items-start gap-6 relative"
                  variants={containerVariants}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <h2
                      className="text-2xl font-semibold text-orange-500"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Khu vực Nhóm
                    </h2>
                  </div>
                  <div className="w-full flex flex-col items-center gap-6 pl-16">
                    <div
                      className={`grid gap-6 ${groupAreas.length === 1
                          ? 'grid-cols-1'
                          : groupAreas.length <= 3
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        } ${groupAreas.length >= 5 ? 'aspect-square' : ''} place-items-center`}
                      style={{
                        maxWidth: groupAreas.length >= 5 ? '600px' : '800px',
                      }}
                    >
                      {groupAreas.map((area, index) => {
                        const areaKey = `${area.areaName}-${area.areaTypeName}`.trim().toLowerCase();
                        const groupAreaId = areaToGroupMap[areaKey];
                        let gridPosition = '';
                        if (groupAreas.length >= 5) {
                          if (index === 0) gridPosition = 'col-start-2 row-start-2'; // Center
                          else if (index === 1) gridPosition = 'col-start-1 row-start-1'; // Top-left
                          else if (index === 2) gridPosition = 'col-start-3 row-start-1'; // Top-right
                          else if (index === 3) gridPosition = 'col-start-1 row-start-3'; // Bottom-left
                          else if (index === 4) gridPosition = 'col-start-3 row-start-3'; // Bottom-right
                        }
                        return (
                          <motion.div
                            key={index}
                            className={`aspect-square w-full max-w-[320px] bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center flex flex-col justify-center items-center shadow-md hover:shadow-lg transition-shadow duration-200 ${bookedSeats.groups.includes(groupAreaId)
                                ? 'bg-orange-500 text-white border-orange-600'
                                : 'bg-gray-50 text-gray-800'
                              } ${gridPosition}`}
                            variants={itemVariants}
                          >
                            <strong className="text-lg font-semibold">{area.areaName}</strong>
                            <span className="text-sm">{area.areaTypeName}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Individual Area Section - Original Circular Design */}
              {individualArea && individualTables.length > 0 && (
                <motion.div
                  className="flex items-start gap-6 relative"
                  variants={containerVariants}
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    <h2
                      className="text-2xl font-semibold text-orange-500"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                      Khu vực Cá Nhân
                    </h2>
                  </div>
                  <div className="w-full flex flex-col items-center gap-6 pl-16">
                    <h3 className="text-lg font-medium text-gray-700">{individualArea.areaName}</h3>
                    <div className="flex flex-row flex-wrap justify-center gap-6">
                      {individualTables.map((tableSeats, tableIndex) => (
                        <motion.div
                          key={`table-${tableIndex}`}
                          className="relative flex justify-center items-center border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 w-full sm:w-[320px]"
                          style={{ height: '320px' }}
                          variants={itemVariants}
                        >
                          <img
                            src={table_images}
                            alt="Table"
                            className="absolute w-32 h-32 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-80"
                          />
                          {tableSeats.map((seat, index) => {
                            const angle = (360 / tableSeats.length) * index;
                            const radius = 130;
                            const x = Math.cos(angle * (Math.PI / 180)) * radius;
                            const y = Math.sin(angle * (Math.PI / 180)) * radius;
                            const position = seatToPositionMap[seat];
                            return (
                              <span
                                key={seat}
                                className={`absolute w-12 h-12 flex flex-col items-center justify-center rounded-full shadow-sm transition-transform duration-200 hover:scale-110 ${bookedSeats.individual.includes(seat)
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                  }`}
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                              >
                                <ArmchairIcon className="w-5 h-5" />
                                <span className="text-xs font-semibold mt-0.5">{position}</span>
                              </span>
                            );
                          })}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewBookedSeats;