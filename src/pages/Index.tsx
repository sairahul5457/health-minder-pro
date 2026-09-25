import { useState } from "react";
import { Check, X, Clock, Activity } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatsCard from "@/components/StatsCard";
import ReminderCard from "@/components/ReminderCard";
import FullScreenAlert from "@/components/FullScreenAlert";
import SafetyAlert from "@/components/SafetyAlert";
import { AdherencePieChart, WeeklyBarChart } from "@/components/AdherenceCharts";
import { sampleMedications } from "@/data/sampleData";
import { Reminder } from "@/types/healthcare";
import { useReminders } from "@/context/RemindersContext";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { reminders, setReminders, deleteReminder } = useReminders();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [alertReminder, setAlertReminder] = useState<Reminder | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<{
    open: boolean;
    type: "overdose" | "age" | "caregiver";
    name: string;
    details: string;
  }>({ open: false, type: "overdose", name: "", details: "" });

  const userAge = profile?.age || 65;

  const taken = reminders.filter((r) => r.status === "taken").length;
  const missed = reminders.filter((r) => r.status === "missed").length;
  const pending = reminders.filter((r) => r.status === "pending" || r.status === "snoozed").length;

  const handleTake = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    const med = sampleMedications.find((m) => m.id === reminder.medicationId);
    if (med) {
      const takenToday = reminders.filter(
        (r) => r.medicationId === med.id && r.status === "taken"
      ).length;
      if (takenToday >= med.maxDailyDoses) {
        setSafetyAlert({
          open: true,
          type: "overdose",
          name: med.name,
          details: `You have already taken ${takenToday} dose(s) of ${med.name} today. The maximum allowed is ${med.maxDailyDoses} per day.`,
        });
        return;
      }

      if (userAge < med.minAge) {
        setSafetyAlert({
          open: true,
          type: "age",
          name: med.name,
          details: `${med.name} is recommended for ages ${med.minAge}+. Your profile age (${userAge}) does not meet the minimum requirement.`,
        });
        return;
      }

      const lastTaken = reminders
        .filter((r) => r.medicationId === med.id && r.status === "taken" && r.takenAt)
        .sort((a, b) => (b.takenAt!.getTime() - a.takenAt!.getTime()));

      if (lastTaken.length > 0) {
        const hoursSinceLast = (Date.now() - lastTaken[0].takenAt!.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < med.minHoursBetweenDoses) {
          const remaining = Math.ceil(med.minHoursBetweenDoses - hoursSinceLast);
          setSafetyAlert({
            open: true,
            type: "overdose",
            name: med.name,
            details: `You took ${med.name} ${Math.round(hoursSinceLast * 60)} minutes ago. Please wait ${remaining} more hour(s).`,
          });
          return;
        }
      }
    }

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

  const handleDelete = (id: string) => {
    deleteReminder(id);
    toast({ title: "🗑️ Reminder Deleted", description: "The reminder has been removed." });
  };

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Good {getGreeting()}, {profile?.name?.split(" ")[0]} 👋</h2>
        <p className="text-muted-foreground mt-1">
          You have <span className="font-semibold text-primary">{pending} reminders</span> pending today
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatsCard title="Taken" value={taken} icon={<Check className="w-5 h-5" />} variant="taken" />
        <StatsCard title="Missed" value={missed} icon={<X className="w-5 h-5" />} variant="missed" />
        <StatsCard title="Pending" value={pending} icon={<Clock className="w-5 h-5" />} variant="pending" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <AdherencePieChart taken={taken} missed={missed} pending={pending} />
        <WeeklyBarChart />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Today's Reminders</h3>
      </div>
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No reminders yet. Add your first medication!</p>
          </div>
        ) : (
          reminders
            .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
            .map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onTake={handleTake}
                onSnooze={handleSnooze}
                onViewAlert={handleViewAlert}
                onDelete={handleDelete}
                onEdit={(r) => navigate(`/add-medication?edit=${encodeURIComponent(r.groupId || r.id)}`)}
              />
            ))
        )}
      </div>

      <FullScreenAlert
        reminder={alertReminder}
        open={!!alertReminder}
        onClose={() => setAlertReminder(null)}
        onTake={handleTake}
        onSnooze={handleSnooze}
      />

      <SafetyAlert
        open={safetyAlert.open}
        onClose={() => setSafetyAlert((s) => ({ ...s, open: false }))}
        type={safetyAlert.type}
        medicineName={safetyAlert.name}
        details={safetyAlert.details}
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
