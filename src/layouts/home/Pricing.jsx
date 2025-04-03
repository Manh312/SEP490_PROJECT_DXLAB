import { CheckCircle2 } from 'lucide-react';
import { pricingOptions } from '../../constants';

const Pricing = () => {
  return (
    <div className='mb-20'>
      <h2 className='text-3xl sm:text-5xl lg:text-6xl text-center my-8 tracking-wide'>
        Các gói dịch vụ
      </h2>
      <div className='flex flex-wrap justify-center gap-30'>
        {pricingOptions.map((option, index) => (
          <div key={index} className='w-full sm:w-1/2 lg:w-1/3 p-2'>
            <div className='p-10 border border-neutral-700 rounded-xl'>
              <p className='text-2xl mb-8'>
                {option.title}
                {option.title === "Đặt chỗ cá nhân lần đầu" && (
                  <span className='bg-gradient-to-r from-orange-500 to-red-400 text-transparent bg-clip-text text-lg mb-4 ml-2'>
                    {/* (Phổ biến) */}
                  </span>
                )}
              </p>
              {/* Hiển thị danh sách các mức giá */}
              <ul className='mb-8'>
                {option.price.map((price, priceIndex) => (
                  <li key={priceIndex} className='text-xl mt-2'>
                    {price}
                  </li>
                ))}
              </ul>
              {/* Hiển thị danh sách tính năng */}
              <ul>
                {option.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className='mt-4 flex items-center'>
                    <CheckCircle2 className='w-5 h-5 text-green-500' />
                    <span className='ml-2'>{feature}</span>
                  </li>
                ))}
              </ul>
              {/* Nút Đăng ký */}
              <a
                href='#'
                className='inline-flex text-white justify-center items-center w-full h-12 p-5 mt-10 tracking-tight text-xl bg-orange-500 hover:bg-orange-600 border border-orange-900 rounded-lg transition duration-200'
              >
                Đăng ký
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;