import type { Ticket } from "@/lib/tickets";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DashboardChartsProps {
  tickets: Ticket[];
}

const DashboardCharts = ({ tickets }: DashboardChartsProps) => {
  const open = tickets.filter((t) => t.request_status === "Open").length;
  const closed = tickets.filter((t) => t.request_status === "Closed").length;

  const statusData = [
    { name: "Open", value: open, color: "hsl(187, 85%, 53%)" },
    { name: "Closed", value: closed, color: "hsl(142, 71%, 45%)" },
  ];

  const priorityData = [
    { name: "High", value: tickets.filter((t) => t.priority === "High").length, color: "hsl(0, 72%, 51%)" },
    { name: "Medium", value: tickets.filter((t) => t.priority === "Medium").length, color: "hsl(38, 92%, 50%)" },
    { name: "Low", value: tickets.filter((t) => t.priority === "Low").length, color: "hsl(142, 71%, 45%)" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4">Ticket Status</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(222, 44%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 92%)" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-sm font-semibold mb-4">Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(222, 44%, 9%)", border: "1px solid hsl(222, 30%, 18%)", borderRadius: "8px", color: "hsl(210, 40%, 92%)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
