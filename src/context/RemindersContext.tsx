import { createContext, useContext, useState, ReactNode } from "react";
import { Reminder } from "@/types/healthcare";
import { sampleReminders } from "@/data/sampleData";

interface RemindersContextType {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  addReminders: (newReminders: Reminder[]) => void;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>(sampleReminders);

  const addReminders = (newReminders: Reminder[]) => {
    setReminders((prev) => [...prev, ...newReminders]);
  };

  return (
    <RemindersContext.Provider value={{ reminders, setReminders, addReminders }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) throw new Error("useReminders must be used within RemindersProvider");
  return context;
};
