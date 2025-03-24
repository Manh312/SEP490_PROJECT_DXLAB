// UpdateFacilities.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFacilityById, updateFacility } from "../../redux/slices/Facilities";
import { toast } from "react-toastify";

const UpdateFacilities = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { facility, loading } = useSelector((state) => state.facilities);
  const [formData, setFormData] = useState({ name: "", quantity: "" });

  useEffect(() => {
    dispatch(fetchFacilityById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (facility) {
      setFormData({ name: facility.name, quantity: facility.quantity });
    }
  }, [facility]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateFacility({ id, data: formData })).unwrap();
      toast.success("Cập nhật thành công!");
      navigate("/dashboard/facilities");
    } catch (error) {
      toast.error("Lỗi khi cập nhật!");
    }
  };

  return (
    <div className="p-6 shadow-xl rounded-lg bg-white max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">✏️ Cập Nhật Cơ Sở Vật Chất</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium">Tên Sản Phẩm</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="mb-4">
            <label className="block font-medium">Số Lượng</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Lưu</button>
        </form>
      )}
    </div>
  );
};
export default UpdateFacilities;