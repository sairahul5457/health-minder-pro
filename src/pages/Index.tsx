import { useState } from "react";
import { Check, X, Clock, Activity } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatsCard from "@/components/StatsCard";
import ReminderCard from "@/components/ReminderCard";
import FullScreenAlert from "@/components/FullScreenAlert";
import SafetyAlert from "@/components/SafetyAlert";
import { AdherencePieChart, WeeklyBarChart } from "@/components/AdherenceCharts";
import { sampleReminders, sampleMedications } from "@/data/sampleData";
import { Reminder } from "@/types/healthcare";

const USER_AGE = 65; // From profile

const Index = () => {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);
  const [alertReminder, setAlertReminder] = useState<Reminder | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<{
    open: boolean;
    type: "overdose" | "age" | "caregiver";
    name: string;
    details: string;
  }>({ open: false, type: "overdose", name: "", details: "" });

  const taken = reminders.filter((r) => r.status === "taken").length;
  const missed = reminders.filter((r) => r.status === "missed").length;
  const pending = reminders.filter((r) => r.status === "pending" || r.status === "snoozed").length;

  const handleTake = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    const med = sampleMedications.find((m) => m.id === reminder.medicationId);
    if (!med) return;

    // 1️⃣ Daily dosage limit check
    const takenToday = reminders.filter(
      (r) => r.medicationId === med.id && r.status === "taken"
    ).length;
    if (takenToday >= med.maxDailyDoses) {
      setSafetyAlert({
        open: true,
        type: "overdose",
        name: med.name,
        details: `You have already taken ${takenToday} dose(s) of ${med.name} today. The maximum allowed is ${med.maxDailyDoses} per day. Please consult your healthcare provider before taking more.`,
      });
      return;
    }

    // 2️⃣ Age suitability check
    if (USER_AGE < med.minAge) {
      setSafetyAlert({
        open: true,
        type: "age",
        name: med.name,
        details: `${med.name} is recommended for ages ${med.minAge}+. Your profile age (${USER_AGE}) does not meet the minimum requirement. Please consult a doctor before taking this medicine.`,
      });
      return;
    }

    // 3️⃣ Minimum time gap validation
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
          details: `You took ${med.name} ${Math.round(hoursSinceLast * 60)} minutes ago. The minimum gap between doses is ${med.minHoursBetweenDoses} hours. Please wait approximately ${remaining} more hour(s) before taking the next dose.`,
        });
        return;
      }
    }

    // All checks passed — mark as taken
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

      {/* Safety Alert */}
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
