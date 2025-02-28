import { Link } from "react-router-dom";
import { rooms } from "../../constants";

const ViewRoom = () => {
  return (
    <div className="p-8 flex flex-col items-center text-center mt-16 mb-20">
      <h2 className="text-4xl font-bold mb-10 text-gray-900">
        Danh sách phòng tại <span className="text-orange-500">DXLAB Co-Working Space</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {rooms.map((room) => (
          <div 
            key={room.id} 
            className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
          >
            <img 
              src={room.images} 
              alt={room.name} 
              className="w-full h-56 object-cover transition-transform duration-300 hover:scale-110"
            />
            <div className="p-6 text-left">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{room.name}</h3>
              <p className="text-gray-600 text-sm">{room.description}</p>
              <Link to={`/room/${room.id}`}>
                <button className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-lg font-semibold transition duration-300">
                  Xem chi tiết
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRoom;