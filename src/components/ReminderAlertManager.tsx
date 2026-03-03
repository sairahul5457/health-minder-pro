import { useEffect, useState, useCallback } from "react";
import { useReminders } from "@/context/RemindersContext";
import FullScreenAlert from "@/components/FullScreenAlert";
import { Reminder } from "@/types/healthcare";
import { toast } from "@/hooks/use-toast";

const MAX_SNOOZES = 4;
const SNOOZE_MINUTES = 10;

const ReminderAlertManager = () => {
  const { reminders, setReminders } = useReminders();
  const [alertReminder, setAlertReminder] = useState<Reminder | null>(null);

  const sendCaregiverAlert = useCallback((reminder: Reminder) => {
    toast({
      title: "🚨 Caregiver Alert Sent",
      description: `${reminder.medicationName} was snoozed ${MAX_SNOOZES} times with no response. Alert sent to caregiver.`,
      variant: "destructive",
    });
    // Mark as missed
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, status: "missed" as const } : r
      )
    );
  }, [setReminders]);

  // Check reminders every 15 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      for (const reminder of reminders) {
        // Skip non-actionable reminders
        if (reminder.status === "taken" || reminder.status === "missed") continue;

        // Check date range validity
        if (reminder.startDate && now < reminder.startDate) continue;
        if (reminder.endDate) {
          const endOfDay = new Date(reminder.endDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (now > endOfDay) continue;
        }

        // For snoozed reminders, check if snooze period is over
        if (reminder.status === "snoozed" && reminder.snoozedUntil) {
          if (now >= reminder.snoozedUntil) {
            // Check if max snoozes reached
            if ((reminder.snoozeCount || 0) >= MAX_SNOOZES) {
              sendCaregiverAlert(reminder);
              continue;
            }
            // Show alert again
            if (!alertReminder) {
              setAlertReminder(reminder);
            }
          }
          continue;
        }

        // For pending reminders, check if it's time
        if (reminder.status === "pending") {
          const timeDiff = now.getTime() - reminder.scheduledTime.getTime();
          // Trigger if within 60 seconds of scheduled time (or past due up to 5 min)
          if (timeDiff >= 0 && timeDiff <= 5 * 60 * 1000) {
            if (!alertReminder) {
              setAlertReminder(reminder);
            }
          }
        }
      }
    };

    const interval = setInterval(checkReminders, 15000);
    checkReminders(); // Run immediately
    return () => clearInterval(interval);
  }, [reminders, alertReminder, sendCaregiverAlert]);

  const handleTake = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "taken" as const, takenAt: new Date() } : r
      )
    );
    setAlertReminder(null);
  };

  const handleSnooze = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newSnoozeCount = (r.snoozeCount || 0) + 1;

        if (newSnoozeCount >= MAX_SNOOZES) {
          // Will trigger caregiver alert on next check
          return {
            ...r,
            status: "snoozed" as const,
            snoozedUntil: new Date(Date.now() + 1000), // Expire immediately
            snoozeCount: newSnoozeCount,
          };
        }

        return {
          ...r,
          status: "snoozed" as const,
          snoozedUntil: new Date(Date.now() + SNOOZE_MINUTES * 60000),
          snoozeCount: newSnoozeCount,
        };
      })
    );
    setAlertReminder(null);

    const reminder = reminders.find((r) => r.id === id);
    const currentCount = (reminder?.snoozeCount || 0) + 1;
    const remaining = MAX_SNOOZES - currentCount;

    if (remaining > 0) {
      toast({
        title: `⏰ Snoozed (${currentCount}/${MAX_SNOOZES})`,
        description: `${reminder?.medicationName} snoozed for ${SNOOZE_MINUTES} min. ${remaining} snooze(s) left before caregiver is alerted.`,
      });
    }
  };

  return (
    <FullScreenAlert
      reminder={alertReminder}
      open={!!alertReminder}
      onClose={() => setAlertReminder(null)}
      onTake={handleTake}
      onSnooze={handleSnooze}
    />
  );
};

export default ReminderAlertManager;
