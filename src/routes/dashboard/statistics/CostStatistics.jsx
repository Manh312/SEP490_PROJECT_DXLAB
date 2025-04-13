import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import PropTypes from "prop-types";

const CostStatistics = ({ jobs }) => {
  const { theme } = useTheme();
  const EXPENSE_COLORS = ["#3b82f6", "#ef4444"]; // Blue for "Bàn" (faCategory 1), red for "Ghế" (faCategory 0)

  // Log the jobs data for debugging
  console.log("Jobs data in CostStatistics:", jobs);

  // Calculate expense distribution by faCategory (raw amounts) for both pie chart and area chart
  const expenseData = () => {
    if (!jobs || jobs.length === 0) {
      console.log("No jobs data, returning default data");
      return [
        { name: "Bàn", value: 0 },
        { name: "Ghế", value: 0 },
      ];
    }

    const categoryTotals = jobs.reduce(
      (acc, job) => {
        const category = job.faciCategory === 1 ? "table" : "chair";
        acc[category] += job.amout || 0;
        return acc;
      },
      { table: 0, chair: 0 }
    );

    console.log("Category totals:", categoryTotals);

    return [
      { name: "Bàn", value: categoryTotals.table },
      { name: "Ghế", value: categoryTotals.chair },
    ];
  };

  // Calculate Y-axis domain and ticks dynamically based on the data
  const calculateYAxisProps = (data) => {
    const maxValue = Math.max(...data.map(item => item.value), 1000); // Ensure a minimum max for visibility
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

  const pieData = expenseData();
  const areaData = expenseData(); // Same data format, reused for the area chart
  const { minY, maxY, ticks } = calculateYAxisProps(areaData);

  console.log("Pie data:", pieData);
  console.log("Area data:", areaData);
  console.log("Y-axis props:", { minY, maxY, ticks });

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
        {/* Pie Chart for Expense Distribution by faCategory */}
        <div className="flex flex-col items-center animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Phân bổ chi phí theo hạng mục
          </h3>
          {pieData.every(item => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu chi phí</p>
          ) : (
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
          )}
        </div>

        {/* Area Chart for "Bàn" and "Ghế" Expenses */}
        <div className="flex flex-col animate-fade-in">
          <h3
            className={`text-xl font-medium mb-4 ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Biểu đồ thống kê chi phí bỏ ra
          </h3>
          {areaData.every(item => item.value === 0) ? (
            <p className={`text-center text-gray-500 dark:text-gray-400`}>Không có dữ liệu chi phí</p>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <AreaChart
                data={areaData}
                margin={{ top: 20, right: 30, left: 40, bottom: 50 }}
              >
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={{ stroke: theme === "dark" ? "#4b5563" : "#e5e7eb", strokeWidth: 1 }}
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
                <XAxis
                  dataKey="name"
                  strokeWidth={0}
                  stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                  tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                />
                <YAxis
                  strokeWidth={0}
                  stroke={theme === "light" ? "#64748b" : "#94a3b8"}
                  tickFormatter={(value) => `${value} DXLAB Coin`}
                  tickMargin={20}
                  domain={[minY, maxY]}
                  ticks={ticks}
                  width={100}
                  tick={{ fontSize: 14, fill: theme === "dark" ? "#d1d5db" : "#6b7280" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  activeDot={{ r: 6, fill: "#10b981", stroke: theme === "dark" ? "#1f2937" : "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

CostStatistics.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      sumaryExpenseID: PropTypes.number,
      sumaryDate: PropTypes.string,
      amount: PropTypes.number,
      faCategory: PropTypes.number,
    })
  ).isRequired,
};

export default CostStatistics;