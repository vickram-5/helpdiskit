import { useMemo } from "react";
import type { Ticket } from "@/lib/tickets";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import { TicketIcon, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users, Zap, Activity, Trophy } from "lucide-react";

interface AdminDashboardProps {
  tickets: Ticket[];
}

const AdminDashboard = ({ tickets }: AdminDashboardProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTickets = useMemo(() =>
    tickets.filter((t) => {
      const d = new Date(t.created_at || t.created_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }), [tickets, currentMonth, currentYear]);

  const total = monthTickets.length;
  const open = monthTickets.filter((t) => t.request_status === "Open").length;
  const inProgress = monthTickets.filter((t) => t.request_status === "In Progress").length;
  const resolved = monthTickets.filter((t) => t.request_status === "Closed" || t.request_status === "Resolved").length;

  const low = monthTickets.filter((t) => t.priority === "Low").length;
  const medium = monthTickets.filter((t) => t.priority === "Medium").length;
  const high = monthTickets.filter((t) => t.priority === "High").length;
  const critical = monthTickets.filter((t) => (t.priority as string) === "Critical").length;

  const donutData = [
    { name: "Open", value: open || 0, color: "hsl(195, 90%, 48%)" },
    { name: "Resolved", value: resolved || 0, color: "hsl(150, 65%, 42%)" },
    { name: "In Progress", value: inProgress || 0, color: "hsl(40, 90%, 50%)" },
  ].filter(d => d.value > 0);
  if (donutData.length === 0) donutData.push({ name: "Active", value: 0, color: "hsl(200, 30%, 80%)" });

  // Open tickets by priority chart data
  const openByPriority = [
    { name: "Low", value: monthTickets.filter(t => t.request_status === "Open" && t.priority === "Low").length, color: "hsl(150, 65%, 42%)" },
    { name: "Medium", value: monthTickets.filter(t => t.request_status === "Open" && t.priority === "Medium").length, color: "hsl(40, 90%, 50%)" },
    { name: "High", value: monthTickets.filter(t => t.request_status === "Open" && t.priority === "High").length, color: "hsl(0, 75%, 50%)" },
    { name: "Critical", value: monthTickets.filter(t => t.request_status === "Open" && (t.priority as string) === "Critical").length, color: "hsl(320, 75%, 50%)" },
  ];

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyData = weekdays.map((d, i) => ({
    name: d,
    tickets: monthTickets.filter((t) => {
      const td = new Date(t.created_at || t.created_date);
      return td.getDay() === (i + 1) % 7;
    }).length,
  }));

  // Technician performance leaderboard (resolved this month)
  const techResolvedMap = new Map<string, number>();
  monthTickets.forEach((t) => {
    if ((t.request_status === "Closed" || t.request_status === "Resolved") && t.technician_name) {
      techResolvedMap.set(t.technician_name, (techResolvedMap.get(t.technician_name) || 0) + 1);
    }
  });
  const leaderboard = Array.from(techResolvedMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const maxResolved = leaderboard.length > 0 ? leaderboard[0].count : 1;

  const techMap = new Map<string, number>();
  monthTickets.forEach((t) => {
    if (t.technician_name) techMap.set(t.technician_name, (techMap.get(t.technician_name) || 0) + 1);
  });

  const recentTickets = [...tickets].sort((a, b) =>
    new Date(b.created_at || b.created_date).getTime() - new Date(a.created_at || a.created_date).getTime()
  ).slice(0, 5);

  const tooltipStyle = {
    background: "hsla(200, 20%, 98%, 0.92)",
    border: "1px solid hsla(200, 60%, 75%, 0.3)",
    borderRadius: "12px",
    color: "hsl(210, 20%, 15%)",
    backdropFilter: "blur(20px)",
    fontSize: "12px",
  };

  const axisTickStyle = { fill: "hsl(210, 12%, 45%)", fontSize: 11 };

  const stats = [
    { label: "TOTAL TICKETS", value: total, icon: TicketIcon, color: "text-primary", iconBg: "bg-primary/10" },
    { label: "OPEN", value: open, icon: Clock, color: "text-status-open", iconBg: "bg-status-open/10" },
    { label: "IN PROGRESS", value: inProgress, icon: AlertTriangle, color: "text-priority-medium", iconBg: "bg-priority-medium/10" },
    { label: "RESOLVED", value: resolved, icon: CheckCircle2, color: "text-status-closed", iconBg: "bg-status-closed/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards - 2x2 on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="liquid-glass liquid-glass-hover rounded-2xl p-4 transition-all" role="status" aria-label={`${s.label}: ${s.value}`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold font-mono">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Donut + Open by Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="liquid-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-status-closed animate-pulse" />
            <h3 className="text-sm font-semibold">Ticket Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} strokeWidth={0}>
                {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> <strong className="text-foreground">{total}</strong> All</span>
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> <strong className="text-foreground">{open}</strong> Open</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> <strong className="text-foreground">{inProgress}</strong> Pending</span>
          </div>
        </div>

        <div className="lg:col-span-2 liquid-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-priority-high" />
            <h3 className="text-sm font-semibold">Open Tickets by Priority</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={openByPriority} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(200, 30%, 75%, 0.3)" />
              <XAxis type="number" tick={axisTickStyle} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={axisTickStyle} width={60} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {openByPriority.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Leaderboard + Weekly Trend + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technician Performance Leaderboard */}
        <div className="liquid-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-priority-medium" />
            <h3 className="text-sm font-semibold">Leaderboard (This Month)</h3>
          </div>
          <div className="space-y-3">
            {leaderboard.length > 0 ? leaderboard.slice(0, 8).map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-priority-medium" : i === 1 ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{t.name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(t.count / maxResolved) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-primary">{t.count}</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">No resolved tickets yet</p>
            )}
          </div>
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Weekly Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(200, 30%, 75%, 0.3)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(210, 12%, 45%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(210, 12%, 45%)", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="tickets" stroke="hsl(195, 90%, 48%)" strokeWidth={2} dot={{ r: 3, fill: "hsl(195, 90%, 48%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentTickets.length > 0 ? recentTickets.map((t) => (
              <div key={t.id} className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${t.request_status === "Open" ? "bg-status-open" : t.request_status === "Closed" ? "bg-status-closed" : "bg-priority-medium"}`} />
                <div>
                  <p className="text-xs font-medium">{t.request_id} — {t.issue_category}</p>
                  <p className="text-[10px] text-muted-foreground">{t.technician_name} · {new Date(t.created_at || t.created_date).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Priority Distribution */}
      <div className="liquid-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-priority-medium" />
          <h3 className="text-sm font-semibold">Priority Distribution</h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4">Live ticket priority spread</p>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Low", value: low, color: "bg-status-closed" },
            { label: "Medium", value: medium, color: "bg-priority-medium" },
            { label: "High", value: high, color: "bg-priority-high" },
            { label: "Critical", value: critical, color: "bg-accent" },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${p.color}`} />
              {p.label}: {p.value}
            </div>
          ))}
        </div>
        <div className="mt-3 h-3 rounded-full bg-secondary/60 overflow-hidden flex">
          {total > 0 && [
            { v: low, c: "bg-status-closed" },
            { v: medium, c: "bg-priority-medium" },
            { v: high, c: "bg-priority-high" },
            { v: critical, c: "bg-accent" },
          ].map((s, i) => s.v > 0 && (
            <div key={i} className={`${s.c} h-full transition-all`} style={{ width: `${(s.v / total) * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
