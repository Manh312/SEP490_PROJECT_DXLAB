import { PencilLine, Trash } from "lucide-react";
import { products } from "../../constants";
import { useTheme } from "../../hooks/use-theme";

const Facilities = () => {
  const theme = useTheme();
  return (
    <div className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="card-header">
          <p className="card-title">Product List</p>
        </div>
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded-none">
            <table className="table min-w-full">
              <thead className="table-header">
                <tr className="table-row">
                  <th className="table-head sticky top-0 bg-gray-200">#</th>
                  <th className="table-head sticky top-0 bg-gray-200">Tên Sản Phẩm</th>
                  <th className="table-head sticky top-0 bg-gray-200">Số Lượng</th>
                  <th className="table-head sticky top-0 bg-gray-200">Tình Trạng</th>
                  <th className="table-head sticky top-0 bg-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {products.map((product) => (
                  <tr key={product.id} className="table-row">
                    <td className="table-cell">{product.id}</td>
                    <td className="table-cell">{product.name}</td>
                    <td className="table-cell">{product.quantity}</td>
                    <td className="table-cell">{product.status}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        <button className="text-blue-500 dark:text-blue-600">
                          <PencilLine size={20}/>
                        </button>
                        <button className="text-red-500">
                          <Trash size={20}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

export default Facilities;
