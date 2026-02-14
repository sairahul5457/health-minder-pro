import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface AdherenceChartProps {
  taken: number;
  missed: number;
  pending: number;
}

const COLORS = {
  taken: "hsl(145, 60%, 42%)",
  missed: "hsl(0, 72%, 55%)",
  pending: "hsl(35, 90%, 55%)",
};

export const AdherencePieChart = ({ taken, missed, pending }: AdherenceChartProps) => {
  const data = [
    { name: "Taken", value: taken },
    { name: "Missed", value: missed },
    { name: "Pending", value: pending },
  ];

  const total = taken + missed + pending;
  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-scale-in">
      <h3 className="font-semibold text-foreground mb-1">Today's Adherence</h3>
      <p className="text-sm text-muted-foreground mb-4">How well you're following your schedule</p>
      <div className="relative w-full h-48">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={COLORS.taken} />
              <Cell fill={COLORS.missed} />
              <Cell fill={COLORS.pending} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold text-foreground">{adherenceRate}%</span>
            <p className="text-xs text-muted-foreground">Rate</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[entry.name.toLowerCase() as keyof typeof COLORS] }}
            />
            <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeeklyBarChart = () => {
  const data = [
    { day: "Mon", taken: 4, missed: 1 },
    { day: "Tue", taken: 5, missed: 0 },
    { day: "Wed", taken: 3, missed: 2 },
    { day: "Thu", taken: 5, missed: 0 },
    { day: "Fri", taken: 4, missed: 1 },
    { day: "Sat", taken: 2, missed: 3 },
    { day: "Sun", taken: 4, missed: 1 },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-scale-in">
      <h3 className="font-semibold text-foreground mb-1">Weekly Overview</h3>
      <p className="text-sm text-muted-foreground mb-4">Your medication adherence this week</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(168, 20%, 88%)" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(210, 10%, 45%)" }} />
          <YAxis tick={{ fontSize: 12, fill: "hsl(210, 10%, 45%)" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid hsl(168, 20%, 88%)",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="taken" fill={COLORS.taken} radius={[4, 4, 0, 0]} />
          <Bar dataKey="missed" fill={COLORS.missed} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
