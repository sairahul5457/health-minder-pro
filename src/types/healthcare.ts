export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  maxDailyDoses: number;
  minHoursBetweenDoses: number;
  minAge: number;
  instructions: string;
  sideEffects: string;
  precautions: string;
  category: string;
  color: string;
}

export interface Reminder {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  status: "pending" | "taken" | "missed" | "snoozed";
  takenAt?: Date;
  snoozedUntil?: Date;
  snoozeCount?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  location: string;
  appointmentDate: Date;
  appointmentTime: string;
  notes: string;
  status: "upcoming" | "completed" | "cancelled";
  alertTriggered: boolean;
}

export interface UserProfile {
  name: string;
  age: number;
  caregiverPhone?: string;
  caregiverEmail?: string;
}
