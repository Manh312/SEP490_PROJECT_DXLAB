import PropTypes from "prop-types";
import { useTheme } from "../../../hooks/use-theme";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const DepreciationStatistics = ({ depreciationData, depreciationMinY, depreciationMaxY, depreciationYTicks }) => {
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
          Thống kê khấu hao
        </p>
      </div>
      <div className="card-body p-0">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={depreciationData}
            margin={{ top: 30, right: 30, left: 50, bottom: 30 }}
          >
            <Tooltip
              cursor={false}
              formatter={(value) => `${value} DXLAB Coin`}
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
              dataKey="depreciationValue"
              strokeWidth={0}
              stroke={theme === "light" ? "#475569" : "#94a3b8"}
              tickFormatter={(value) => `${value} DXLAB Coin`}
              tickMargin={40}
              domain={[depreciationMinY, depreciationMaxY]}
              ticks={depreciationYTicks}
              width={100}
            />
            <Bar dataKey="depreciationValue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
DepreciationStatistics.propTypes = {
  depreciationData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      depreciationValue: PropTypes.number.isRequired,
    })
  ).isRequired,
  depreciationMinY: PropTypes.number.isRequired,
  depreciationMaxY: PropTypes.number.isRequired,
  depreciationYTicks: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default DepreciationStatistics;