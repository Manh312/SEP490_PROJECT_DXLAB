const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  const maxVisiblePages = 5;
  const half = Math.floor(maxVisiblePages / 2);
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex justify-center mt-6 flex-wrap gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        className="px-4 py-2 rounded-lg bg-gray-200 text-black disabled:opacity-50"
        disabled={currentPage === 1}
      >
        Trang trước
      </button>
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 rounded-lg bg-gray-200 text-black"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-3 py-1">...</span>}
        </>
      )}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 rounded-lg text-sm ${
            currentPage === page ? "bg-orange-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {page}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-3 py-1">...</span>}
          <button
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1 rounded-lg bg-gray-200 text-black"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        className="px-4 py-2 rounded-lg bg-gray-200 text-black disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        Trang sau
      </button>
    </div>
  );
};

export default Pagination;