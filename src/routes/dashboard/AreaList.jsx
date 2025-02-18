import { PencilLine, Star, Trash } from "lucide-react";
import { topProducts } from "../../constants";
import { useTheme } from "../../hooks/use-theme";

const AreaList = () => {
  const theme = useTheme();
  return (
    <div className={`card col-span-1 md:col-span-2 lg:col-span-3 mt-5 mb-10 ${theme === "dark" ? "bg-black text-white" : ""}`}>
        <div className="card-header">
          <p className="card-title">Top Orders</p>
        </div>
        <div className="card-body p-0">
          <div className="relative max-h-[500px] overflow-auto rounded-none">
            <table className="table min-w-full">
              <thead className="table-header">
                <tr className="table-row">
                  <th className="table-head sticky top-0 bg-gray-200">#</th>
                  <th className="table-head sticky top-0 bg-gray-200">Product</th>
                  <th className="table-head sticky top-0 bg-gray-200">Price</th>
                  <th className="table-head sticky top-0 bg-gray-200">Status</th>
                  <th className="table-head sticky top-0 bg-gray-200">Rating</th>
                  <th className="table-head sticky top-0 bg-gray-200">Action</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {topProducts.map((product) => (
                  <tr key={product.number} className="table-row">
                    <td className="table-cell">{product.number}</td>
                    <td className="table-cell">
                      <div className="flex w-max gap-4">
                        <img src={product.image} alt={product.name} className="size-14 rounded-lg object-cover" />
                        <div className="flex flex-col">
                          <p>{product.name}</p>
                          <p className="font-normal">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{product.price}</td>
                    <td className="table-cell">{product.status}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-2">
                        <Star size={18} className="fill-yellow-600 stroke-yellow-600"/>
                        {product.rating}
                      </div>
                    </td>
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

export default AreaList;
