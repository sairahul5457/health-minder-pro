import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Appointment } from "@/types/healthcare";
import { db } from "@/lib/db";

interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appt: Omit<Appointment, "id" | "alertTriggered">) => Promise<void>;
  deleteAppointment: (id: string) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  loading: boolean;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

const dbToAppointment = (r: any): Appointment => ({
  ...r,
  id: String(r.id),
  appointmentDate: new Date(r.appointmentDate),
});

export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.appointments.toArray().then((items) => {
      setAppointments(items.map(dbToAppointment));
      setLoading(false);
    });
  }, []);

  const addAppointment = useCallback(async (appt: Omit<Appointment, "id" | "alertTriggered">) => {
    const id = await db.appointments.add({
      ...appt,
      alertTriggered: false,
      createdAt: new Date(),
    });
    const saved = await db.appointments.get(id);
    if (saved) setAppointments((prev) => [...prev, dbToAppointment(saved)]);
  }, []);

  const deleteAppointment = useCallback(async (id: string) => {
    const numId = parseInt(id);
    if (!isNaN(numId)) await db.appointments.delete(numId);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>) => {
    const numId = parseInt(id);
    const { id: _id, ...dbData } = data;
    if (!isNaN(numId)) await db.appointments.update(numId, dbData);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
  }, []);

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, deleteAppointment, updateAppointment, loading }}>
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (!context) throw new Error("useAppointments must be used within AppointmentsProvider");
  return context;
};
