import { Medication, Reminder } from "@/types/healthcare";

export const sampleMedications: Medication[] = [
  {
    id: "1",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    times: ["08:00", "20:00"],
    maxDailyDoses: 2,
    minAge: 18,
    minHoursBetweenDoses: 8,
    instructions: "Take with food to reduce stomach upset.",
    sideEffects: "Nausea, diarrhea, stomach pain. Contact doctor if severe.",
    precautions: "Do not take if you have kidney problems. Avoid alcohol.",
    category: "Diabetes",
    color: "hsl(168, 55%, 38%)",
  },
  {
    id: "2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    times: ["09:00"],
    maxDailyDoses: 1,
    minAge: 16,
    minHoursBetweenDoses: 24,
    instructions: "Take at the same time each day. May be taken with or without food.",
    sideEffects: "Dizziness, headache, dry cough.",
    precautions: "Avoid potassium supplements. Not safe during pregnancy.",
    category: "Blood Pressure",
    color: "hsl(220, 60%, 50%)",
  },
  {
    id: "3",
    name: "Amoxicillin",
    dosage: "250mg",
    frequency: "Three times daily",
    times: ["08:00", "14:00", "20:00"],
    maxDailyDoses: 3,
    minAge: 2,
    minHoursBetweenDoses: 6,
    instructions: "Complete the full course even if you feel better.",
    sideEffects: "Rash, nausea, diarrhea.",
    precautions: "Inform doctor of any penicillin allergy.",
    category: "Antibiotic",
    color: "hsl(35, 90%, 55%)",
  },
  {
    id: "4",
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Once daily",
    times: ["10:00"],
    maxDailyDoses: 1,
    minAge: 0,
    minHoursBetweenDoses: 24,
    instructions: "Take with a meal containing fat for better absorption.",
    sideEffects: "Rarely causes issues at recommended doses.",
    precautions: "Do not exceed recommended dosage.",
    category: "Supplement",
    color: "hsl(145, 60%, 42%)",
  },
];

const today = new Date();
const formatTime = (h: number, m: number) => {
  const d = new Date(today);
  d.setHours(h, m, 0, 0);
  return d;
};

export const sampleReminders: Reminder[] = [
  {
    id: "r1",
    medicationId: "1",
    medicationName: "Metformin",
    dosage: "500mg",
    scheduledTime: formatTime(8, 0),
    status: "taken",
    takenAt: formatTime(8, 5),
  },
  {
    id: "r2",
    medicationId: "2",
    medicationName: "Lisinopril",
    dosage: "10mg",
    scheduledTime: formatTime(9, 0),
    status: "taken",
    takenAt: formatTime(9, 2),
  },
  {
    id: "r3",
    medicationId: "4",
    medicationName: "Vitamin D3",
    dosage: "1000 IU",
    scheduledTime: formatTime(10, 0),
    status: "missed",
  },
  {
    id: "r4",
    medicationId: "3",
    medicationName: "Amoxicillin",
    dosage: "250mg",
    scheduledTime: formatTime(14, 0),
    status: "pending",
  },
  {
    id: "r5",
    medicationId: "1",
    medicationName: "Metformin",
    dosage: "500mg",
    scheduledTime: formatTime(20, 0),
    status: "pending",
  },
  {
    id: "r6",
    medicationId: "3",
    medicationName: "Amoxicillin",
    dosage: "250mg",
    scheduledTime: formatTime(20, 0),
    status: "pending",
  },
];
