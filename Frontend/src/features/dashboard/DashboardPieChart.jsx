import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";

function DashboardPieChart({data}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={200} fill="#8884d8" label />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default DashboardPieChart;