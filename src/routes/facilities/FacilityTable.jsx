import { useTable, useSortBy } from "react-table";
import { Link } from "react-router-dom";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const FacilityTable = ({ facilities, loading, totalFiltered, navigate, onDelete }) => {
  const columns = useMemo(
    () => [
      { Header: "#", accessor: (_, index) => index + 1, disableSortBy: true },
      {
        Header: "Số lô",
        accessor: "batchNumber",
        Cell: ({ value, row }) => (
          <Link
            to={`/dashboard/facilities/${row.original.facilityId}`}
            className="hover:text-gray-400 transition-colors"
          >
            {value}
          </Link>
        ),
      },
      { Header: "Mô tả", accessor: "facilityDescription" },
      { Header: "Giá", accessor: "cost" },
      {
        Header: "Ngày nhập",
        accessor: "importDate",
        Cell: ({ value }) => format(new Date(value), "dd/MM/yyyy"),
      },
      { Header: "Số lượng", accessor: "quantity" },
      {
        Header: "Ngày hết hạn",
        accessor: "expiredTime",
        Cell: ({ value }) => format(new Date(value), "dd/MM/yyyy"),
      },
      {
        Header: "Hành động",
        accessor: "id",
        disableSortBy: true,
        Cell: ({ value }) => (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onDelete(value)}
              className="bg-red-100 text-red-700 hover:bg-red-400 p-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <Link
              to={`/dashboard/facilities/update/${value}`}
              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-400 p-2 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </Link>
          </div>
        ),
      },
    ],
    [navigate, onDelete]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    { columns, data: facilities },
    useSortBy
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  if (facilities.length === 0) {
    return <p className="text-center text-gray-500 py-4">Không có dữ liệu để hiển thị</p>;
  }

  return (
    <>
      <p className="text-lg font-semibold text-gray-500 mb-4">
        Tổng số: {totalFiltered} mục (Hiển thị {facilities.length} mục)
      </p>
      <div className="overflow-x-auto border rounded-lg">
        <table {...getTableProps()} className="w-full text-left">
          <thead className="bg-gray-500 sticky top-0">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-3 font-semibold text-lg uppercase tracking-wide text-center"
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? " ↓" : " ↑") : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="border-t hover:bg-gray-100 transition-colors"
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-4 text-center"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FacilityTable;