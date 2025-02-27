import { CreditCard, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { useTheme } from "../../hooks/use-theme";
import { overviewData } from "../../constants";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Page = () => {
  const { theme } = useTheme(); 

  return (
    <div className="flex flex-col gap-y-4">
      <h1 className={`title ${theme === "dark" ? "text-white" : "text-black"}`}>Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {/* Card 1 */}
        <div className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}>
          <div className="card-header">
            <div className={`w-fit rounded-lg p-2 transition-colors ${theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-500/20 text-blue-500"}`}>
              <Package size={26} />
            </div>
            <p className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>Total Products</p>
          </div>
          <div className="card-body">
            <p className={`text-3xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>25,154</p>
            <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${theme === "dark" ? "border-blue-400 text-blue-400" : "border-blue-500 text-blue-500"}`}>
              <TrendingUp size={18} />
              25%
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}>
          <div className="card-header">
            <div className={`w-fit rounded-lg p-2 transition-colors ${theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-500/20 text-blue-500"}`}>
              <DollarSign size={26} />
            </div>
            <p className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>Total Paid Orders</p>
          </div>
          <div className="card-body">
            <p className={`text-3xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>25,154</p>
            <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${theme === "dark" ? "border-blue-400 text-blue-400" : "border-blue-500 text-blue-500"}`}>
              <TrendingUp size={18} />
              12%
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}>
          <div className="card-header">
            <div className={`w-fit rounded-lg p-2 transition-colors ${theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-500/20 text-blue-500"}`}>
              <Users size={26} />
            </div>
            <p className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>Total Customers</p>
          </div>
          <div className="card-body">
            <p className={`text-3xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>25,154</p>
            <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${theme === "dark" ? "border-blue-400 text-blue-400" : "border-blue-500 text-blue-500"}`}>
              <TrendingUp size={18} />
              15%
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className={`card ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"} transition-colors`}>
          <div className="card-header">
            <div className={`w-fit rounded-lg p-2 transition-colors ${theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-500/20 text-blue-500"}`}>
              <CreditCard size={26} />
            </div>
            <p className={`card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>Sales</p>
          </div>
          <div className="card-body">
            <p className={`text-3xl font-bold transition-colors ${theme === "dark" ? "text-white" : "text-black"}`}>25,154</p>
            <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium transition-colors ${theme === "dark" ? "border-blue-400 text-blue-400" : "border-blue-500 text-blue-500"}`}>
              <TrendingUp size={18} />
              19%
            </span>
          </div>
        </div>
      </div>
        <div className={`card mr-5 col-span-1 md:col-span-2 lg:col-span-4 ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
          <div className="card-header">
            <p className={` card-title ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>Overview</p>
          </div>
          <div className="card-body p-0">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={overviewData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
                    <stop offset={"5%"} stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset={"95%"} stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  cursor={false}
                  formatter={(value) => `$${value}`}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "black" : "white",
                    color: theme === "dark" ? "white" : "black",
                    borderRadius: "8px",
                    border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`
                  }}
                />
                <XAxis
                  dataKey={"name"}
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                />
                <YAxis
                  dataKey={"total"}
                  strokeWidth={0}
                  stroke={theme === "light" ? "#475569" : "#94a3b8"}
                  tickFormatter={(value) => `$${value}`}
                  tickMargin={6}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
  );
}

export default Page;
