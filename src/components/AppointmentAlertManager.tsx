import { useEffect, useState } from "react";
import { useAppointments } from "@/context/AppointmentsContext";
import { Appointment } from "@/types/healthcare";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stethoscope, Check, MapPin, Volume2 } from "lucide-react";
import { format } from "date-fns";

const AppointmentAlertManager = () => {
  const { appointments, updateAppointment } = useAppointments();
  const [alertAppt, setAlertAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      for (const appt of appointments) {
        if (appt.status !== "upcoming" || appt.alertTriggered) continue;
        const apptDateTime = new Date(appt.appointmentDate);
        const [h, m] = appt.appointmentTime.split(":").map(Number);
        apptDateTime.setHours(h, m, 0, 0);

        const diff = apptDateTime.getTime() - now.getTime();
        // Alert 30 minutes before or at the time
        if (diff <= 30 * 60 * 1000 && diff >= -5 * 60 * 1000) {
          if (!alertAppt) {
            setAlertAppt(appt);
            updateAppointment(appt.id, { alertTriggered: true });
          }
          break;
        }
        // Mark past appointments
        if (diff < -5 * 60 * 1000) {
          updateAppointment(appt.id, { status: "completed" });
        }
      }
    };

    const interval = setInterval(check, 5000);
    check();
    return () => clearInterval(interval);
  }, [appointments, alertAppt, updateAppointment]);

  if (!alertAppt) return null;

  return (
    <Dialog open={!!alertAppt} onOpenChange={() => setAlertAppt(null)}>
      <DialogContent className="max-w-md p-0 border-0 overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Stethoscope className="w-10 h-10" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium opacity-90">APPOINTMENT REMINDER</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{alertAppt.doctorName}</h2>
          {alertAppt.specialty && <p className="text-lg opacity-90">{alertAppt.specialty}</p>}
          <p className="opacity-80 mt-2">
            {format(new Date(alertAppt.appointmentDate), "PPP")} at {alertAppt.appointmentTime}
          </p>
          {alertAppt.location && (
            <p className="opacity-80 mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4" /> {alertAppt.location}
            </p>
          )}
        </div>
        <div className="p-6">
          <Button
            onClick={() => setAlertAppt(null)}
            className="w-full h-14 text-lg gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl"
          >
            <Check className="w-5 h-5 mr-2" /> Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentAlertManager;
