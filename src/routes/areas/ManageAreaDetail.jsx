// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { ArrowLeft, X, RefreshCw, Search, Plus, PlusIcon } from "lucide-react";
// import {
//   fetchFacilitiesByAreaId,
//   fetchAllFacilities,
//   addFacilityToArea,
//   removeFacilityFromArea,
// } from "../../redux/slices/Area";
// import { toast } from "react-toastify";

// const ManageAreaDetail = () => {
//   const { id } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const {
//     facilities,
//     facilitiesLoading,
//     facilitiesError,
//     allFacilities,
//     allFacilitiesLoading,
//     allFacilitiesError,
//     addFacilityLoading,
//   } = useSelector((state) => state.areas);

//   const [showModal, setShowModal] = useState(false);
//   const [selectedFacility, setSelectedFacility] = useState(null);
//   const [quantity, setQuantity] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const [deleteModal, setDeleteModal] = useState(false);
//   const [facilityToDelete, setFacilityToDelete] = useState(null);
//   const [deleteQuantity, setDeleteQuantity] = useState("");

//   // Khởi tạo facilityQuantities từ localStorage
//   const [facilityQuantities, setFacilityQuantities] = useState(() => {
//     const savedQuantities = localStorage.getItem(`facilityQuantities_area_${id}`);
//     return savedQuantities ? JSON.parse(savedQuantities) : {};
//   });

//   // Lưu facilityQuantities vào localStorage mỗi khi nó thay đổi
//   useEffect(() => {
//     localStorage.setItem(`facilityQuantities_area_${id}`, JSON.stringify(facilityQuantities));
//   }, [facilityQuantities, id]);

//   // Lấy danh sách thiết bị khi component được mount
//   useEffect(() => {
//     if (id) {
//       dispatch(fetchFacilitiesByAreaId(id));
//     }
//   }, [dispatch, id]);

//   // Đồng bộ facilityQuantities với facilities từ API
//   useEffect(() => {
//     const updatedQuantities = facilities.reduce((acc, item) => {
//       // Chỉ giữ lại số lượng của các thiết bị hiện có trong facilities
//       if (facilityQuantities[item.facilityId] !== undefined) {
//         acc[item.facilityId] = facilityQuantities[item.facilityId];
//       }
//       return acc;
//     }, {});
//     setFacilityQuantities(updatedQuantities);
//   }, [facilities]);

//   const openModal = () => {
//     dispatch(fetchAllFacilities());
//     setShowModal(true);
//   };

//   const handleAddFacility = async () => {
//     if (!selectedFacility || !quantity) {
//       toast.error("Vui lòng chọn thiết bị và nhập số lượng!");
//       return;
//     }

//     const quantityToAdd = parseInt(quantity);
//     if (quantityToAdd > selectedFacility.quantity) {
//       toast.error(`Số lượng vượt quá số lượng khả dụng (${selectedFacility.quantity})!`);
//       return;
//     }

//     const body = {
//       facilityId: selectedFacility.facilityId,
//       batchNumber: selectedFacility.batchNumber,
//       importDate: selectedFacility.importDate,
//       quantity: quantityToAdd,
//     };

//     try {
//       const res = await dispatch(addFacilityToArea({ id, data: body })).unwrap();
//       toast.success(res.message);
//       dispatch(fetchFacilitiesByAreaId(id));

//       // Cập nhật số lượng trong facilityQuantities
//       setFacilityQuantities((prev) => ({
//         ...prev,
//         [selectedFacility.facilityId]:
//           (prev[selectedFacility.facilityId] || 0) + quantityToAdd,
//       }));

//       setShowModal(false);
//       setSelectedFacility(null);
//       setQuantity("");
//       setSearchTerm("");
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleDeleteFacility = async () => {
//     if (!facilityToDelete || !deleteQuantity) {
//       toast.error("Vui lòng nhập số lượng muốn xóa!");
//       return;
//     }

//     const quantityToDelete = parseInt(deleteQuantity);
//     const currentQuantity = facilityQuantities[facilityToDelete.facilityId] || 0;
//     if (quantityToDelete > currentQuantity) {
//       toast.error(`Số lượng xóa vượt quá số lượng hiện có (${currentQuantity})!`);
//       return;
//     }

//     const body = {
//       areaId: parseInt(id),
//       facilityId: facilityToDelete.facilityId,
//       quantity: quantityToDelete,
//       status: 2,
//     };

//     try {
//       const res = await dispatch(removeFacilityFromArea(body)).unwrap();
//       toast.success(res.message);
//       dispatch(fetchFacilitiesByAreaId(id));

//       // Cập nhật số lượng trong facilityQuantities
//       setFacilityQuantities((prev) => {
//         const newQuantity = (prev[facilityToDelete.facilityId] || 0) - quantityToDelete;
//         if (newQuantity <= 0) {
//           const { [facilityToDelete.facilityId]: _, ...rest } = prev;
//           return rest;
//         }
//         return {
//           ...prev,
//           [facilityToDelete.facilityId]: newQuantity,
//         };
//       });

//       setDeleteModal(false);
//       setFacilityToDelete(null);
//       setDeleteQuantity("");
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   const filteredFacilities = allFacilities.filter((faci) =>
//     faci.facilityName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="max-w-5xl mx-auto mt-10 mb-20 px-4">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-3xl font-bold text-orange-600">
//           Thiết Bị Trong Khu Vực #{id}
//         </h2>
//         <div className="flex gap-3">
//           <button
//             onClick={openModal}
//             className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
//           >
//             <PlusIcon className="w-5 h-5" /> Thêm Thiết Bị
//           </button>
//         </div>
//       </div>

//       {/* Danh sách thiết bị */}
//       {facilitiesLoading ? (
//         <div className="flex justify-center items-center h-40">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
//         </div>
//       ) : facilitiesError ? (
//         <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{facilitiesError}</p>
//       ) : facilities.length === 0 ? (
//         <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
//           Không có thiết bị nào trong khu vực này.
//         </p>
//       ) : (
//         <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Tên Thiết Bị
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Số Lượng
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Hành Động
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {facilities.map((item) => (
//                 <tr key={item.facilityId} className="hover:bg-gray-50 transition">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {item.facilityTitle}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {facilityQuantities[item.facilityId] || 0}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <button
//                       onClick={() => {
//                         setFacilityToDelete(item);
//                         setDeleteModal(true);
//                       }}
//                       className="text-red-600 hover:text-red-800 transition"
//                     >
//                       <X size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Nút quay lại */}
//       <div className="mt-6">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
//         >
//           <ArrowLeft size={20} /> Quay lại danh sách khu vực
//         </button>
//       </div>

//       {/* Modal xóa */}
//       {deleteModal && facilityToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-xl font-bold text-red-600">Xóa Thiết Bị</h2>
//               <button
//                 onClick={() => {
//                   setDeleteModal(false);
//                   setFacilityToDelete(null);
//                   setDeleteQuantity("");
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>
//             <p className="text-gray-700">
//               Thiết bị: <strong>{facilityToDelete.facilityTitle}</strong>
//             </p>
//             <p className="text-gray-700">
//               Số lượng hiện có: <strong>{facilityQuantities[facilityToDelete.facilityId] || 0}</strong>
//             </p>
//             <input
//               type="number"
//               min={1}
//               max={facilityQuantities[facilityToDelete.facilityId] || 0}
//               value={deleteQuantity}
//               onChange={(e) => setDeleteQuantity(e.target.value)}
//               placeholder="Nhập số lượng muốn xóa"
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => {
//                   setDeleteModal(false);
//                   setFacilityToDelete(null);
//                   setDeleteQuantity("");
//                 }}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={handleDeleteFacility}
//                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//               >
//                 Xóa
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal thêm */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold text-orange-600">Thêm Thiết Bị Vào Khu Vực</h2>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setSelectedFacility(null);
//                   setQuantity("");
//                   setSearchTerm("");
//                 }}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Thanh tìm kiếm */}
//             <div className="relative mb-4">
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Tìm kiếm thiết bị..."
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 pl-10"
//               />
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             </div>

//             {allFacilitiesLoading ? (
//               <div className="flex justify-center items-center h-40">
//                 <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
//               </div>
//             ) : allFacilitiesError ? (
//               <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{allFacilitiesError}</p>
//             ) : filteredFacilities.length === 0 ? (
//               <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">
//                 Không tìm thấy thiết bị nào.
//               </p>
//             ) : (
//               <div className="bg-white shadow-lg rounded-lg overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Tên Thiết Bị
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Lô
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Số Lượng Khả Dụng
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Ngày Nhập
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredFacilities.map((faci) => (
//                       <tr
//                         key={faci.facilityId}
//                         onClick={() => setSelectedFacility(faci)}
//                         className={`cursor-pointer hover:bg-orange-50 transition ${
//                           selectedFacility?.facilityId === faci.facilityId
//                             ? "bg-orange-100"
//                             : ""
//                         }`}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {faci.facilityName}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {faci.batchNumber}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {faci.quantity}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {new Date(faci.importDate).toLocaleDateString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {selectedFacility && (
//               <div className="mt-4">
//                 <label className="block mb-1 font-medium text-sm text-gray-700">
//                   Nhập số lượng muốn thêm (Tối đa: {selectedFacility.quantity}):
//                 </label>
//                 <input
//                   type="number"
//                   min={1}
//                   max={selectedFacility.quantity}
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value)}
//                   className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   placeholder="VD: 10"
//                 />
//               </div>
//             )}

//             <div className="flex justify-end gap-2 pt-6">
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setSelectedFacility(null);
//                   setQuantity("");
//                   setSearchTerm("");
//                 }}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
//               >
//                 Hủy
//               </button>
//               <button
//                 disabled={!selectedFacility || !quantity || addFacilityLoading}
//                 onClick={handleAddFacility}
//                 className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition"
//               >
//                 {addFacilityLoading ? "Đang thêm..." : "Thêm vào khu vực"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ManageAreaDetail;