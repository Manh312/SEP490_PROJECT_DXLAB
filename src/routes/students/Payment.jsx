import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createBooking, confirmBooking, resetBookingStatus } from '../../redux/slices/Booking';
import { addNotification } from '../../redux/slices/Notification';
import { useEffect, useState } from 'react';
import { useAddress, useContract, useContractWrite, useContractRead, useBalance } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const address = useAddress();
  console.log('User Address:', address);

  // Kết nối với hợp đồng ERC20
  const { contract } = useContract(import.meta.env.VITE_DXLABCOINT_CONTRACT);
  const { mutateAsync: transfer, isLoading } = useContractWrite(contract, 'transfer');
  const { data: decimals } = useContractRead(contract, 'decimals');
  const { data: tokenBalance } = useContractRead(contract, 'balanceOf', [address]);

  // Kiểm tra số dư Sepolia ETH
  const { data: ethBalance } = useBalance();

  const { selectedArea, selectedTime = [] } = useSelector((state) => {
    console.log('Redux state.booking:', state.booking);
    return state.booking || {};
  });
  const { selectedRoom, loading: roomsLoading } = useSelector((state) => state.rooms);

  useEffect(() => {
    dispatch(resetBookingStatus());
  }, [dispatch]);

  const fetchedSlots = selectedArea?.fetchedSlots || {};

  const calculateTotalPrice = () => {
    let total = 0;
    if (!Array.isArray(selectedTime) || selectedTime.length === 0) {
      console.log('No selectedTime available:', selectedTime);
      return total;
    }

    const pricePerSlot = selectedArea?.value?.[0]?.price || 10;
    selectedTime.forEach((booking) => {
      if (!booking || !Array.isArray(booking.slots) || booking.slots.length === 0) {
        console.log('Invalid booking entry:', booking);
        return;
      }
      console.log(`Processing date: ${booking.date}, slots: ${booking.slots}`);
      total += booking.slots.length * pricePerSlot;
    });
    return total;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getSlotNames = (slots, date) => {
    if (!Array.isArray(slots) || slots.length === 0) return 'Chưa chọn';
    const slotsForDate = fetchedSlots[date] || [];
    return slots
      .map(({ slotNumber }) => {
        const slot = slotsForDate.find((s) => s.slotNumber === slotNumber);
        console.log(slot);
        return slot ? `Slot ${slot.slotNumber}` : `Slot ${slotNumber}`;
      })
      .join(', ');
  };

  const handleConfirmPayment = async () => {
    setIsModalOpen(false);

    if (!address) {
      toast.error('Vui lòng kết nối ví trước khi thanh toán!');
      return;
    }

    console.log('Before booking - selectedRoom:', selectedRoom, 'selectedArea:', selectedArea, 'selectedTime:', selectedTime);

    if (!selectedRoom || !selectedRoom.roomId) {
      toast.error('Thông tin phòng không hợp lệ!');
      return;
    }

    const areaTypeId = selectedArea?.value?.[0]?.areaTypeId || selectedArea?.areaTypeId;
    if (!areaTypeId) {
      toast.error('Thông tin khu vực không hợp lệ!');
      return;
    }

    if (!Array.isArray(selectedTime) || selectedTime.length === 0) {
      toast.error('Vui lòng chọn thời gian và slot trước khi thanh toán!');
      return;
    }

    // Bước 1: Gọi API createBooking trước
    const bookingData = {
      roomID: selectedRoom.roomId,
      areaTypeId: areaTypeId,
      bookingTimes: selectedTime.map((booking) => ({
        bookingDate: new Date(booking.date).toISOString(),
        slotId: Array.isArray(booking.slots)
          ? booking.slots.map((slot) => slot.slotId)
          : [],
      })),
    };

    let bookingId;
    try {
      const result = await dispatch(createBooking(bookingData)).unwrap();
      console.log('createBooking result:', result);
      bookingId = result.data?.bookingId;
      if (!bookingId) {
        throw new Error('Không tìm thấy bookingId trong kết quả');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo đặt chỗ! Vui lòng thử lại.');
      return; // Dừng lại nếu API createBooking thất bại
    }

    // Bước 2: Nếu createBooking thành công, tiến hành kiểm tra và trừ tiền
    const totalPrice = calculateTotalPrice();
    const recipientAddress = import.meta.env.VITE_RECIPIENT_ADDRESS;

    // Validate recipientAddress
    if (!recipientAddress || !ethers.utils.isAddress(recipientAddress)) {
      toast.error('Địa chỉ nhận không hợp lệ! Vui lòng kiểm tra cấu hình.');
      return;
    }

    // Ensure decimals are loaded
    if (!decimals) {
      toast.error('Không thể tải thông tin hợp đồng (decimals)! Vui lòng thử lại.');
      return;
    }

    const amount = ethers.utils.parseUnits(totalPrice.toString(), decimals);

    try {
      // Check Sepolia ETH balance for gas fees
      const minEthRequired = ethers.utils.parseEther('0.01'); // Rough estimate: 0.01 ETH for gas
      if (!ethBalance || ethBalance.value.lt(minEthRequired)) {
        toast.error('Không đủ Sepolia ETH để trả phí gas! Vui lòng nạp thêm ETH.');
        return;
      }

      // Check DXL token balance
      if (!tokenBalance) {
        toast.error('Không thể kiểm tra số dư DXL! Vui lòng thử lại.');
        return;
      }
      if (tokenBalance.lt(amount)) {
        toast.error('Số dư DXL không đủ để thực hiện thanh toán!');
        return;
      }

      // Perform the transaction
      const tx = await transfer({
        args: [recipientAddress, amount],
      });
      console.log('Transaction successful:', tx);

      // Fetch the updated balance after the transaction
      let updatedBalance;
      try {
        updatedBalance = await contract.call('balanceOf', [address]);
        console.log('Updated balance:', updatedBalance.toString());
      } catch (error) {
        console.error('Error fetching updated balance:', error);
        updatedBalance = tokenBalance; // Fallback to previous balance if fetch fails
      }

      // Format updated balance
      const formattedBalance = updatedBalance && decimals
        ? ethers.utils.formatUnits(updatedBalance, decimals)
        : 'N/A';

      // Dispatch notification with updated balance
      dispatch(addNotification({
        message: `Thanh toán thành công ${totalPrice} DXL cho đơn đặt chỗ DXL-${bookingId}. Số dư hiện tại của bạn là: ${parseFloat(formattedBalance).toFixed(2)} DXL.`,
        type: 'success',
      }));

      // Sau khi trừ tiền thành công, cập nhật trạng thái và chuyển hướng
      toast.success('Thanh toán thành công!');
      dispatch(confirmBooking([]));
      navigate(`/booked-seats/${bookingId}`);
    } catch (error) {
      console.error('Payment error:', error);
      if (error.code === 401) { // Người dùng từ chối ký
        toast.error('Bạn đã hủy giao dịch!');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Không đủ Sepolia ETH để trả phí gas! Vui lòng nạp thêm ETH.');
      } else {
        toast.error(error.message || 'Có lỗi xảy ra khi thanh toán! Vui lòng liên hệ hỗ trợ.');
      }
      // Lưu ý: Booking đã được tạo thành công, nhưng thanh toán thất bại
      toast.warn(`Đặt chỗ đã được tạo (ID: ${bookingId}), nhưng thanh toán chưa hoàn tất. Vui lòng kiểm tra lại.`);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (roomsLoading) {
    return <div className="p-6 text-center text-gray-600">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="mt-20 mb-20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Xác Nhận Thanh Toán</h1>
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-700">Thông Tin Đặt Chỗ</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Phòng:</span>
              <span className="text-gray-800">{selectedRoom?.roomName || 'Chưa chọn'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Dịch vụ:</span>
              <span className="text-gray-800">
                {selectedArea?.key?.categoryId === 2 ? 'Khu vực nhóm' : 'Khu vực cá nhân'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Kiểu khu vực:</span>
              <span className="text-gray-800">
                {selectedArea?.name || selectedArea?.value?.[0]?.areaTypeName || 'Chưa chọn'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-600 block mb-2">Thời gian & Slot:</span>
              {Array.isArray(selectedTime) && selectedTime.length > 0 ? (
                <ul className="list-disc pl-5 text-gray-800">
                  {selectedTime.map((item, index) => (
                    <li key={index}>
                      {formatDate(item.date)} - {getSlotNames(item.slots, item.date)}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-800">Chưa chọn</span>
              )}
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="font-medium text-gray-600">Tổng chi phí:</span>
              <span className="text-orange-500 font-semibold">{calculateTotalPrice()} DXL</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-8">
            <button
              onClick={handleOpenModal}
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
            </button>
            <Link
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 text-center font-semibold"
            >
              Quay Lại
            </Link>
          </div>
        </div>
      </div>

      {/* Modal for Payment Terms */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-400 rounded-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-4">Điều Khoản Thanh Toán</h2>
            <div className="max-h-96 overflow-y-auto space-y-4">
              <p>
                <strong>1. Đồng Ý Điều Khoản:</strong> Khi nhấn "Đồng Ý và Thanh Toán", bạn xác nhận đã đọc và đồng ý với các điều khoản được liệt kê dưới đây.
              </p>
              <p>
                <strong>2. Thông Tin Đặt Chỗ:</strong> Bạn có trách nhiệm đảm bảo tính chính xác của thông tin về phòng, khu vực và thời gian đặt chỗ.
              </p>
              <p>
                <strong>3. Quy Định Về Thời Gian Đặt Chỗ:</strong> Mỗi khung giờ (slot) chỉ được đặt một lần cho một ngày cụ thể. Ví dụ, nếu bạn đã đặt slot 1 ngày 3/5, bạn không thể đặt lại slot 1 cho cùng ngày đó.
              </p>
              <p>
                <strong>4. Yêu Cầu Số Dư:</strong> Ví của bạn phải có đủ số dư DXL tương ứng với tổng chi phí dịch vụ để giao dịch thanh toán được thực hiện thành công.
              </p>
              <p>
                <strong>5. Thanh Toán:</strong> Tổng số tiền {calculateTotalPrice()} DXL sẽ được thanh toán ngay sau khi xác nhận. Mọi giao dịch đã hoàn tất không được hoàn tiền.
              </p>
              <p>
                <strong>6. Trách Nhiệm:</strong> Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng dịch vụ này.
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleConfirmPayment}
                disabled={isLoading}
                className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
              >
                {isLoading ? 'Đang xử lý...' : 'Đồng Ý và Thanh Toán'}
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;