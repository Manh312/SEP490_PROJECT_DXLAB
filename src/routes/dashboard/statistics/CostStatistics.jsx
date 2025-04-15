import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import PropTypes from "prop-types";

const CostStatistics = ({ jobs, period, year, month }) => {
  const { theme } = useTheme();
  const EXPENSE_COLORS = ["#3b82f6", "#ef4444"]; // Blue for "Bàn" (faciCategory 1), red for "Ghế" (faciCategory 0)

  // Tính tổng chi phí cho note
  const calculateTotalExpenses = () => {
    if (!jobs || jobs.length === 0) return 0;

    return jobs.reduce((total, job) => {
      if (!job || !job.summaryDate || job.amount === undefined) return total;

      const date = new Date(job.summaryDate);
      if (isNaN(date.getTime())) return total;

      const jobYear = date.getFullYear();
      const jobMonth = date.getMonth();

      if (jobYear !== parseInt(year)) return total;

      if (period === "tháng" && month) {
        const selectedMonth = parseInt(month) - 1;
        if (jobMonth !== selectedMonth) return total;
      }

      return total + (job.amount || 0);
    }, 0);
  };

  // Tạo danh sách các tháng: nếu period là "tháng", chỉ hiển thị tháng được chọn
  const months = period === "tháng" && month
    ? [{ name: `Tháng ${month}`, table: 0, chair: 0, total: 0 }]
    : Array.from({ length: 12 }, (_, i) => ({
        name: `Tháng ${i + 1}`,
        table: 0, // Chi phí cho Bàn (faciCategory 1)
        chair: 0, // Chi phí cho Ghế (faciCategory 0)
        total: 0, // Tổng chi phí
      }));

  // Nhóm dữ liệu theo tháng và faciCategory
  const processDataByMonth = () => {
    if (!jobs || jobs.length === 0) {
      return months; // Trả về dữ liệu mặc định
    }

    jobs.forEach(job => {
      if (!job || !job.summaryDate) {
        return; // Bỏ qua job này
      }

      const date = new Date(job.summaryDate);
      if (isNaN(date.getTime())) {
        return; // Bỏ qua job nếu ngày không hợp lệ
      }

      const jobYear = date.getFullYear();
      const jobMonth = date.getMonth(); // getMonth() trả về 0-11

      if (jobYear !== parseInt(year)) {
        return; // Bỏ qua job nếu không thuộc năm được chọn
      }

      if (period === "tháng" && month) {
        const selectedMonth = parseInt(month) - 1;
        if (jobMonth !== selectedMonth) {
          return; // Bỏ qua job nếu không thuộc tháng được chọn
        }
      }

      const monthIndex = period === "tháng" ? 0 : jobMonth;
      const category = job.faciCategory === 1 ? "table" : "chair";
      const amount = job.amount || 0;

      // Cộng dồn chi phí
      months[monthIndex][category] += amount;
      months[monthIndex].total += amount;
    });

    return months;
  };

  // Tính toán dữ liệu cho Pie Chart
  const expenseData = () => {
    if (!jobs || jobs.length === 0) {
      return [
        { name: "Bàn", value: 0 },
        { name: "Ghế", value: 0 },
      ];
    }

    const categoryTotals = jobs.reduce(
      (acc, job) => {
        if (!job) return acc;
        const date = new Date(job.summaryDate);
        if (isNaN(date.getTime()) || date.getFullYear() !== parseInt(year)) {
          return acc;
        }
        if (period === "tháng" && month) {
          const selectedMonth = parseInt(month) - 1;
          if (date.getMonth() !== selectedMonth) {
            return acc;
          }
        }
        const category = job.faciCategory === 1 ? "table" : "chair";
        acc[category] += job.amount || 0;
        return acc;
      },
      { table: 0, chair: 0 }
    );

    return [
      { name: "Bàn", value: categoryTotals.table },
      { name: "Ghế", value: categoryTotals.chair },
    ];
  };

  // Tính toán Y-axis domain và ticks động dựa trên dữ liệu
  const calculateYAxisProps = (data) => {
    const maxValue = Math.max(
      ...data.map(item => item.total || 0),
      1000 // Đảm bảo giá trị tối thiểu cho visibility
    );
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    const roundedMax = Math.ceil(maxValue / magnitude) * magnitude;
    const step = roundedMax / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return {
      minY: 0,
      maxY: ticks[ticks.length - 1],
      ticks: ticks,
    };
  };

  // Custom Tooltip cho Area Chart
  const CustomTooltip = ({ active, payload, label }) => {
    CustomTooltip.propTypes = {
      active: PropTypes.bool,
      payload: PropTypes.array,
      label: PropTypes.string,
    };
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`p-4 rounded-lg shadow-lg border ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-900 border-gray-200"
          }`}
        >
          <p className="font-semibold mb-2">{label}</p>
          <p className="text-sm">
            Ghế: {data.chair.toLocaleString()} DXLAB Coin
          </p>
          <p className="text-sm">
            Bàn: {data.table.toLocaleString()} DXLAB Coin
          </p>
          <p className="text-sm font-medium mt-2">
            Tổng: {data.total.toLocaleString()} DXLAB Coin
          </p>
        </div>
      );
    }
    return null;
  };

  const pieData = expenseData();
  const areaData = processDataByMonth();
  const totalExpenses = calculateTotalExpenses();
  const { minY, maxY, ticks } = calculateYAxisProps(areaData);

  return (
    <div
      className={`card col-span-1 md:col-span-2 lg:col-span-4 rounded-xl shadow-lg transition-all duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Card Header */}
      <div className="card-header border-b border-gray-200 dark:border-gray-700">
        <p
          className={`card-title text-2xl font-semibold p-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Thống kê chi phí bỏ ra
        </p>
      </div>

      {/* Chart Container - Stacked Vertically */}
      <div className="card-body p-6 flex flex-col gap-8">
        {/* Pie Chart for Expense Distribution by faciCategory */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Phân bổ chi phí bỏ ra theo hạng mục - {period === "năm" ? `Năm ${year}` : `Tháng ${month}/${year}`}
          </h3>
          {pieData.every(item => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu chi phí</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${value.toLocaleString()} DXLAB Coin`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                      color: theme === "dark" ? "#ffffff" : "#1f2937",
                      borderRadius: "8px",
                      border: `1px solid ${theme === "dark" ? "#4b5563" : "#e5e7eb"}`,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      padding: "8px 12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Total Expenses Note */}
              <div
                className={`w-full mt-4 p-3 rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 text-gray-200"
                    : "bg-gray-100 border-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm font-semibold">
                  Tổng chi phí bỏ ra:{" "}
                  <span className="text-base font-bold">
                    {totalExpenses.toLocaleString()} DXLAB Coin
                  </span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Area Chart for Total Expenses */}
        {period === "năm" && (
          <div className="flex flex-col animate-fade-in">
            <h3
              className={`text-xl font-medium mb-4 ${
                theme === "dark" ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Biểu đồ thống kê chi phí bỏ ra (theo DXLAB Coin)
            </h3>
            {areaData.every(item => item.total === 0) ? (
              <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu chi phí</p>
            ) : (
              <ResponsiveContainer width="100%" height={500}>
                <AreaChart
                  data={areaData}
                  margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    cursor={{ stroke: theme === "dark" ? "#4b5563" : "#e5e7eb", strokeWidth: 1 }}
                    content={<CustomTooltip />}
                  />
                  <XAxis
                    dataKey="name"
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                  />
                  <YAxis
                    strokeWidth={0}
                    stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                    tickFormatter={(value) => `${value.toLocaleString()} DXLAB Coin`}
                    tickMargin={20}
                    domain={[minY, maxY]}
                    ticks={ticks}
                    width={100}
                    tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Tổng"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    activeDot={{ r: 6, fill: "#f97316", stroke: theme === "dark" ? "#1f2937" : "#ffffff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

CostStatistics.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      summaryExpenseId: PropTypes.number,
      summaryDate: PropTypes.string,
      amount: PropTypes.number,
      faciCategory: PropTypes.number,
    })
  ).isRequired,
  period: PropTypes.oneOf(["năm", "tháng"]).isRequired,
  year: PropTypes.string.isRequired,
  month: PropTypes.string,
};

export default CostStatistics;