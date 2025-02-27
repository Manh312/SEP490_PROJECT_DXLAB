import { Link } from "react-router-dom";
import { rooms } from "../../constants";

const ViewRoom = () => {
  return (
    <div className="p-6 flex flex-col items-center text-center mt-20 mb-20">
      <h2 className="text-3xl font-bold mb-6">Danh sách phòng trên hệ thống DXLAB Co-Working Space</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {rooms.map((room) => (
          <div key={room.id} className="border rounded-lg p-6 shadow-lg">
            <img src={room.images} alt={room.name} className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
            <p className="">{room.description}</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md mt-4">
              <Link to={'/areas'}>Xem chi tiết</Link>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewRoom;
