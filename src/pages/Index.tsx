import { useState } from "react";
import { Check, X, Clock, Activity } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatsCard from "@/components/StatsCard";
import ReminderCard from "@/components/ReminderCard";
import FullScreenAlert from "@/components/FullScreenAlert";
import { AdherencePieChart, WeeklyBarChart } from "@/components/AdherenceCharts";
import { sampleReminders } from "@/data/sampleData";
import { Reminder } from "@/types/healthcare";

const Index = () => {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);
  const [alertReminder, setAlertReminder] = useState<Reminder | null>(null);

  const taken = reminders.filter((r) => r.status === "taken").length;
  const missed = reminders.filter((r) => r.status === "missed").length;
  const pending = reminders.filter((r) => r.status === "pending" || r.status === "snoozed").length;

  const handleTake = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "taken" as const, takenAt: new Date() } : r))
    );
  };

  const handleSnooze = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "snoozed" as const, snoozedUntil: new Date(Date.now() + 10 * 60000) }
          : r
      )
    );
  };

  const handleViewAlert = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) setAlertReminder(reminder);
  };

  return (
    <AppLayout>
      {/* Greeting */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Good {getGreeting()} 👋</h2>
        <p className="text-muted-foreground mt-1">
          You have <span className="font-semibold text-primary">{pending} reminders</span> pending today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatsCard title="Taken" value={taken} icon={<Check className="w-5 h-5" />} variant="taken" />
        <StatsCard title="Missed" value={missed} icon={<X className="w-5 h-5" />} variant="missed" />
        <StatsCard title="Pending" value={pending} icon={<Clock className="w-5 h-5" />} variant="pending" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AdherencePieChart taken={taken} missed={missed} pending={pending} />
        <WeeklyBarChart />
      </div>

      {/* Today's Reminders */}
      <div className="mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Today's Reminders</h3>
      </div>
      <div className="space-y-3">
        {reminders
          .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
          .map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onTake={handleTake}
              onSnooze={handleSnooze}
              onViewAlert={handleViewAlert}
            />
          ))}
      </div>

      {/* Full Screen Alert */}
      <FullScreenAlert
        reminder={alertReminder}
        open={!!alertReminder}
        onClose={() => setAlertReminder(null)}
        onTake={handleTake}
        onSnooze={handleSnooze}
      />
    </AppLayout>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default Index;
