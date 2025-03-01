import { useAddress } from "@thirdweb-dev/react";
import { Link } from "react-router-dom";

const HeroSection = () => {

  return (
    <div className="flex flex-col items-center mt-6 lg:mt-20">
      <h1 className="text-4xl sm:text-6xl lg:text-7xl text-center tracking-wide">
        Hãy chọn phòng và đặt cơ sở vật chất
        <span className='bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text'>
          {" "}
          bạn mong muốn
        </span>
      </h1>
      <p className='mt-10 text-lg text-center text-neutral-500 max-w-4xl'>
        Hệ thống Booking DXLab là một nền tảng trực tuyến giúp người dùng dễ dàng đặt phòng làm việc chung (co-working space) tại FPT University.
      </p>
      <div className="flex justify-center my-10">
        {useAddress() ? (<Link to="/rooms" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md text-white">
          Trải nghiệm dịch vụ ngay
        </Link>
        ) : (
          <Link to="/not-authenticate" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md text-white">
            Trải nghiệm dịch vụ ngay
          </Link>
        )}
      </div>
    </div>
  );
}

export default HeroSection;
