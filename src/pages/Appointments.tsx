import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, Stethoscope, MapPin, Trash2, FileText } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAppointments } from "@/context/AppointmentsContext";

const Appointments = () => {
  const { appointments, addAppointment, deleteAppointment } = useAppointments();
  const [showForm, setShowForm] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !date || !time) {
      toast({ title: "⚠️ Missing Info", description: "Please fill doctor name, date and time." });
      return;
    }

    await addAppointment({
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      location: location.trim(),
      appointmentDate: date,
      appointmentTime: time,
      notes: notes.trim(),
      status: "upcoming",
    });

    toast({ title: "✅ Appointment Added", description: `Dr. ${doctorName} on ${format(date, "PPP")} at ${time}` });
    setDoctorName("");
    setSpecialty("");
    setLocation("");
    setDate(undefined);
    setTime("");
    setNotes("");
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteAppointment(id);
    toast({ title: "🗑️ Appointment Deleted" });
  };

  const upcoming = appointments.filter((a) => a.status === "upcoming").sort(
    (a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
  );
  const past = appointments.filter((a) => a.status !== "upcoming");

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Appointments 🏥</h2>
        <p className="text-muted-foreground mt-1">Manage your doctor appointments</p>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full h-12 mb-6 gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl">
          <Plus className="w-5 h-5 mr-2" /> Add Appointment
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">New Appointment</h3>
          </div>

          <div>
            <Label>Doctor Name *</Label>
            <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Smith" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Specialty</Label>
            <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiologist" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hospital / Clinic name" className="rounded-xl mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl mt-1", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time *</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." className="rounded-xl mt-1" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> Save
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
          </div>
        </form>
      )}

      {/* Upcoming */}
      <div className="mb-4 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Upcoming</h3>
      </div>
      <div className="space-y-3 mb-6">
        {upcoming.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        ) : (
          upcoming.map((appt) => (
            <div key={appt.id} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{appt.doctorName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {appt.specialty && `${appt.specialty} · `}
                      {format(new Date(appt.appointmentDate), "PPP")} at {appt.appointmentTime}
                    </p>
                    {appt.location && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {appt.location}
                      </p>
                    )}
                    {appt.notes && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" /> {appt.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Button onClick={() => handleDelete(appt.id)} size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1.5 h-auto">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {past.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-foreground mb-3">Past</h3>
          <div className="space-y-3">
            {past.map((appt) => (
              <div key={appt.id} className="bg-muted/50 border border-border rounded-xl p-4 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{appt.doctorName}</h4>
                    <p className="text-sm text-muted-foreground">{format(new Date(appt.appointmentDate), "PPP")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Appointments;
