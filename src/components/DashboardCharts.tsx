import type { Ticket } from "@/lib/tickets";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DashboardChartsProps {
  tickets: Ticket[];
}

const DashboardCharts = ({ tickets }: DashboardChartsProps) => {
  const open = tickets.filter((t) => t.request_status === "Open").length;
  const closed = tickets.filter((t) => t.request_status === "Closed").length;

  const statusData = [
    { name: "Open", value: open, color: "hsl(195, 100%, 50%)" },
    { name: "Closed", value: closed, color: "hsl(150, 70%, 45%)" },
  ];

  const priorityData = [
    { name: "High", value: tickets.filter((t) => t.priority === "High").length, color: "hsl(0, 80%, 55%)" },
    { name: "Medium", value: tickets.filter((t) => t.priority === "Medium").length, color: "hsl(40, 95%, 55%)" },
    { name: "Low", value: tickets.filter((t) => t.priority === "Low").length, color: "hsl(150, 70%, 45%)" },
  ];

  const tooltipStyle = {
    background: "hsl(230, 20%, 10%)",
    border: "1px solid hsl(230, 15%, 20%)",
    borderRadius: "12px",
    color: "hsl(220, 20%, 93%)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4 gradient-text">Ticket Status</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4} strokeWidth={0}>
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-4 gradient-text">Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 15%, 15%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {priorityData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
