import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { banners } from "../../constants";

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  return (
    <div className="relative w-full md:h-[50vh] lg:h-[70vh] sm:h-[50vh] h-[50vh] overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`, transition: "transform 0.5s ease-in-out" }}
      >
        {banners.map((banner, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img src={banner.image} alt={`Banner ${index + 1}`} className="w-full h-160 object-cover" />
          </div>
        ))}
      </div>
      <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full">
        <ChevronLeft size={24} color="white" />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full">
        <ChevronRight size={24} color="white" />
      </button>
    </div>
  );
}

export default Banner;
