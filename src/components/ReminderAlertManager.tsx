import { useEffect, useState, useCallback, useRef } from "react";
import { useReminders } from "@/context/RemindersContext";
import { useProfile } from "@/context/ProfileContext";
import FullScreenAlert from "@/components/FullScreenAlert";
import { Reminder } from "@/types/healthcare";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_SNOOZES = 4;
const SNOOZE_MINUTES = 10;
const CHECK_INTERVAL_MS = 3000; // Check every 3 seconds for precise timing

const AUTO_SNOOZE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

const ReminderAlertManager = () => {
  const { reminders, setReminders } = useReminders();
  const { profile } = useProfile();
  const [alertReminder, setAlertReminder] = useState<Reminder | null>(null);
  const alertedIdsRef = useRef<Set<string>>(new Set());
  const autoSnoozeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendCaregiverAlert = useCallback(async (reminder: Reminder) => {
    toast({
      title: "🚨 Caregiver Alert Sent",
      description: `${reminder.medicationName} was snoozed ${MAX_SNOOZES} times with no response. Alert sent to caregiver.`,
      variant: "destructive",
    });

    if (profile?.caregiverEmail && profile.caregiverAlerts) {
      try {
        await supabase.functions.invoke("send-caregiver-alert", {
          body: {
            caregiverEmail: profile.caregiverEmail,
            caregiverName: "Caregiver",
            patientName: profile.name,
            medicationName: reminder.medicationName,
            missedTime: reminder.scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            alertType: `Snoozed ${MAX_SNOOZES} times without response`,
          },
        });
      } catch (e) {
        console.error("Failed to send caregiver email:", e);
      }
    }

    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminder.id ? { ...r, status: "missed" as const } : r
      )
    );
  }, [setReminders, profile]);

  // Precise reminder checking - every 3 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();

      for (const reminder of reminders) {
        if (reminder.status === "taken" || reminder.status === "missed") continue;

        // Check date range
        if (reminder.startDate && now < new Date(reminder.startDate)) continue;
        if (reminder.endDate) {
          const endOfDay = new Date(reminder.endDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (now > endOfDay) continue;
        }

        // Handle snoozed reminders
        if (reminder.status === "snoozed" && reminder.snoozedUntil) {
          if (now >= new Date(reminder.snoozedUntil)) {
            if ((reminder.snoozeCount || 0) >= MAX_SNOOZES) {
              sendCaregiverAlert(reminder);
              continue;
            }
            if (!alertReminder) {
              setAlertReminder(reminder);
            }
          }
          continue;
        }

        // Handle pending - trigger EXACTLY at scheduled time
        if (reminder.status === "pending") {
          const scheduledTime = new Date(reminder.scheduledTime);
          const timeDiff = now.getTime() - scheduledTime.getTime();
          
          // Trigger if we're within 0-60 seconds of scheduled time, or up to 5 min after
          if (timeDiff >= 0 && timeDiff <= 5 * 60 * 1000) {
            if (!alertReminder && !alertedIdsRef.current.has(reminder.id)) {
              alertedIdsRef.current.add(reminder.id);
              setAlertReminder(reminder);
            }
          }
        }
      }
    };

    const interval = setInterval(checkReminders, CHECK_INTERVAL_MS);
    checkReminders();
    return () => clearInterval(interval);
  }, [reminders, alertReminder, sendCaregiverAlert]);

  const handleTake = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "taken" as const, takenAt: new Date() } : r
      )
    );
    alertedIdsRef.current.delete(id);
    setAlertReminder(null);
  };

  const handleSnooze = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newSnoozeCount = (r.snoozeCount || 0) + 1;

        if (newSnoozeCount >= MAX_SNOOZES) {
          return {
            ...r,
            status: "snoozed" as const,
            snoozedUntil: new Date(Date.now() + 1000),
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
    alertedIdsRef.current.delete(id);
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
