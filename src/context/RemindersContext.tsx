import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Reminder } from "@/types/healthcare";
import { db } from "@/lib/db";

interface RemindersContextType {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  addReminders: (newReminders: Reminder[]) => void;
  deleteReminder: (id: string) => void;
  loading: boolean;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

const dbToReminder = (r: any): Reminder => ({
  ...r,
  id: String(r.id),
  scheduledTime: new Date(r.scheduledTime),
  takenAt: r.takenAt ? new Date(r.takenAt) : undefined,
  snoozedUntil: r.snoozedUntil ? new Date(r.snoozedUntil) : undefined,
  startDate: r.startDate ? new Date(r.startDate) : undefined,
  endDate: r.endDate ? new Date(r.endDate) : undefined,
});

export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from IndexedDB on mount
  useEffect(() => {
    db.reminders.toArray().then((items) => {
      setReminders(items.map(dbToReminder));
      setLoading(false);
    });
  }, []);

  // Sync state changes back to IndexedDB
  useEffect(() => {
    if (loading) return;
    const syncToDB = async () => {
      for (const r of reminders) {
        const numId = parseInt(r.id);
        if (!isNaN(numId)) {
          await db.reminders.update(numId, {
            status: r.status,
            takenAt: r.takenAt,
            snoozedUntil: r.snoozedUntil,
            snoozeCount: r.snoozeCount || 0,
          });
        }
      }
    };
    syncToDB();
  }, [reminders, loading]);

  const addReminders = useCallback(async (newReminders: Reminder[]) => {
    const ids = await db.reminders.bulkAdd(
      newReminders.map((r) => ({
        uniqueKey: r.id,
        medicationId: r.medicationId,
        medicationName: r.medicationName,
        dosage: r.dosage,
        scheduledTime: r.scheduledTime,
        status: r.status,
        snoozeCount: r.snoozeCount || 0,
        startDate: r.startDate,
        endDate: r.endDate,
        createdAt: new Date(),
      })),
      { allKeys: true }
    );

    const savedItems = await db.reminders.bulkGet(ids);
    const mapped = savedItems.filter(Boolean).map(dbToReminder);
    setReminders((prev) => [...prev, ...mapped]);
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    const numId = parseInt(id);
    if (!isNaN(numId)) {
      await db.reminders.delete(numId);
    }
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <RemindersContext.Provider value={{ reminders, setReminders, addReminders, deleteReminder, loading }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) throw new Error("useReminders must be used within RemindersProvider");
  return context;
};
