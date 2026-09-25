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
  groupId?: string;
  hasPrescription?: boolean;
  doctorName?: string;
  prescriptionReference?: string;
  prescribedDose?: string;
  prescribedFrequency?: number;
  prescribedTimes?: string[];
  prescriptionStartDate?: Date;
  prescriptionEndDate?: Date;
  prescriptionInstructions?: string;
  createdAt: Date;
}

export interface DBAppointment {
  id?: number;
  doctorName: string;
  specialty: string;
  location: string;
  appointmentDate: Date;
  appointmentTime: string;
  notes: string;
  status: "upcoming" | "completed" | "cancelled";
  alertTriggered: boolean;
  createdAt: Date;
}

class MedRemindDB extends Dexie {
  profiles!: EntityTable<DBProfile, "id">;
  reminders!: EntityTable<DBReminder, "id">;
  appointments!: EntityTable<DBAppointment, "id">;

  constructor() {
    super("MedRemindDB");
    this.version(1).stores({
      profiles: "++id",
      reminders: "++id, uniqueKey, medicationName, status, scheduledTime",
    });
    this.version(2).stores({
      profiles: "++id",
      reminders: "++id, uniqueKey, medicationName, status, scheduledTime",
      appointments: "++id, doctorName, appointmentDate, status",
    });
  }
}

export const db = new MedRemindDB();
