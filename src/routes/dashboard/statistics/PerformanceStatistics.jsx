import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import PropTypes from "prop-types";

const PerformanceStatistics = ({ performanceData, performanceMinY, performanceMaxY, performanceYTicks }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`card col-span-1 md:col-span-2 lg:col-span-4 ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="card-header">
        <p
          className={`card-title ${
            theme === "dark" ? "bg-black text-white" : "bg-white text-black"
          } p-5`}
        >
          Hiệu suất
        </p>
      </div>
      <div className="card-body p-0">
        <ResponsiveContainer width="100%" height={500}>
          <LineChart
            data={performanceData}
            margin={{ top: 30, right: 30, left: 50, bottom: 30 }}
          >
            <Tooltip
              cursor={false}
              formatter={(value) => `${value}%`}
              contentStyle={{
                backgroundColor: theme === "dark" ? "black" : "white",
                color: theme === "dark" ? "white" : "black",
                borderRadius: "8px",
                border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`,
              }}
            />
            <XAxis
              dataKey="name"
              strokeWidth={0}
              stroke={theme === "light" ? "#475569" : "#94a3b8"}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              dataKey="performance"
              strokeWidth={0}
              stroke={theme === "light" ? "#475569" : "#94a3b8"}
              tickFormatter={(value) => `${value}%`}
              tickMargin={40}
              domain={[performanceMinY, performanceMaxY]}
              ticks={performanceYTicks}
              width={100}
            />
            <Line type="monotone" dataKey="performance" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
PerformanceStatistics.propTypes = {
  performanceData: PropTypes.arrayOf(PropTypes.object).isRequired,
  performanceMinY: PropTypes.number.isRequired,
  performanceMaxY: PropTypes.number.isRequired,
  performanceYTicks: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default PerformanceStatistics;
