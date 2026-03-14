import Dexie, { type EntityTable } from "dexie";

export interface DBProfile {
  id?: number;
  name: string;
  age: number;
  caregiverPhone: string;
  caregiverEmail: string;
  notifications: boolean;
  caregiverAlerts: boolean;
  createdAt: Date;
}

export interface DBReminder {
  id?: number;
  uniqueKey: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  status: "pending" | "taken" | "missed" | "snoozed";
  takenAt?: Date;
  snoozedUntil?: Date;
  snoozeCount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

class MedRemindDB extends Dexie {
  profiles!: EntityTable<DBProfile, "id">;
  reminders!: EntityTable<DBReminder, "id">;

  constructor() {
    super("MedRemindDB");
    this.version(1).stores({
      profiles: "++id",
      reminders: "++id, uniqueKey, medicationName, status, scheduledTime",
    });
  }
}

export const db = new MedRemindDB();
