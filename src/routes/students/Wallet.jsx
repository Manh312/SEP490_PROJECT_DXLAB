import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { setWalletAddress } from "../../redux/slices/Authentication";
import { toast } from "react-toastify";
import { FaAddressCard, FaMoneyBill } from "react-icons/fa";
import { Network } from "lucide-react";

const Wallet = () => {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.auth.walletAddress);

  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (walletAddress && window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balanceBigNumber = await provider.getBalance(walletAddress);
        const balanceInEth = ethers.utils.formatEther(balanceBigNumber);
        setBalance(balanceInEth);

        const networkData = await provider.getNetwork();
        setNetwork(networkData.name);
      }
    };

    fetchWalletData();
  }, [walletAddress]);

  const disconnectWallet = () => {
    dispatch(setWalletAddress(null));
    toast.success('Hủy kết nối thành công');
  };

  return (
    <div className="w-150 mx-auto p-6 shadow-lg border rounded-xl mt-20 mb-20">
      <h2 className="text-2xl font-bold mb-4 text-center">Thông tin ví</h2>

      {walletAddress ? (
        <div className="space-y-4">
          <p>
            <div className="flex flex-row gap-2">
              <FaAddressCard size={26} /> Địa chỉ ví: {walletAddress}
            </div>
          </p>
          <p>
            <div className="flex flex-row gap-2">
              <FaMoneyBill size={26} /> Số dư: {balance !== null ? `${balance} ETH` : "Đang tải..."}
            </div>
          </p>
          <p>
            <div className="flex flex-row gap-2">
              <Network size={26} /> Mạng: {network || "Đang tải..."}
            </div>
          </p>

          <button
            onClick={disconnectWallet}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Ngắt kết nối ví
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-500">Bạn chưa kết nối ví</p>
      )}
    </div>
  );
};

export default Wallet;
