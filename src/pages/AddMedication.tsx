import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import SafetyAlert from "@/components/SafetyAlert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Pill, Search } from "lucide-react";
import { sampleMedications } from "@/data/sampleData";
import { useReminders } from "@/context/RemindersContext";
import { useProfile } from "@/context/ProfileContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const AddMedication = () => {
  const navigate = useNavigate();
  const { addReminders } = useReminders();
  const { profile } = useProfile();
  const [name, setName] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("");
  const [reminderTimes, setReminderTimes] = useState<string[]>([""]);
  const [matchedMed, setMatchedMed] = useState<typeof sampleMedications[0] | null>(null);
  const [searchResults, setSearchResults] = useState<typeof sampleMedications>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [safetyAlert, setSafetyAlert] = useState<{
    open: boolean;
    type: "overdose" | "age" | "caregiver";
    name: string;
    details: string;
  }>({ open: false, type: "overdose", name: "", details: "" });

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.length > 0) {
      const results = sampleMedications.filter((m) =>
        m.name.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
      setMatchedMed(null);
    }
  };

  const selectMedicine = (med: typeof sampleMedications[0]) => {
    setName(med.name);
    setMatchedMed(med);
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !timesPerDay.trim()) {
      toast({ title: "⚠️ Missing Info", description: "Please enter tablet name and reminder count." });
      return;
    }

    const times = parseInt(timesPerDay);
    if (isNaN(times) || times < 1) {
      toast({ title: "⚠️ Invalid", description: "Enter a valid number of reminders." });
      return;
    }

    const filledTimes = reminderTimes.filter((t) => t.trim() !== "");
    if (filledTimes.length < times) {
      toast({ title: "⚠️ Missing Times", description: "Please set all reminder times." });
      return;
    }

    const dbMed = sampleMedications.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );

    // Age validation — block if user is too young
    const userAge = profile?.age || 0;
    if (dbMed && userAge < dbMed.minAge) {
      setSafetyAlert({
        open: true,
        type: "age",
        name: dbMed.name,
        details: `${dbMed.name} is only recommended for ages ${dbMed.minAge}+. Your profile age is ${userAge}. This medication cannot be added. Please consult your healthcare provider.`,
      });
      return;
    }

    if (dbMed) {
      if (times > dbMed.maxDailyDoses) {
        setSafetyAlert({
          open: true,
          type: "overdose",
          name: dbMed.name,
          details: `${dbMed.name} has a maximum limit of ${dbMed.maxDailyDoses} doses per day. You entered ${times}. Please consult your healthcare provider.`,
        });
        return;
      }

      const minGapNeeded = 24 / times;
      if (minGapNeeded < dbMed.minHoursBetweenDoses) {
        setSafetyAlert({
          open: true,
          type: "overdose",
          name: dbMed.name,
          details: `Taking ${dbMed.name} ${times} times/day means a dose every ${minGapNeeded.toFixed(1)} hours, but the minimum safe gap is ${dbMed.minHoursBetweenDoses} hours.`,
        });
        return;
      }
    }

    const today = new Date();
    const newReminders = filledTimes.map((timeStr, i) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      return {
        id: `r-${Date.now()}-${i}`,
        medicationId: dbMed?.id || `custom-${Date.now()}`,
        medicationName: name,
        dosage: dbMed?.dosage || "As prescribed",
        scheduledTime,
        status: "pending" as const,
        snoozeCount: 0,
        startDate: startDate || today,
        endDate: endDate,
      };
    });

    addReminders(newReminders);

    toast({
      title: "✅ Reminder Added",
      description: `${name} — ${times} time(s) per day.`,
    });
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Add Reminder 💊</h2>
        <p className="text-muted-foreground mt-1">Enter tablet name & reminder count</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Medicine Reminder</h3>
          </div>

          {/* Age info badge */}
          {profile && (
            <div className="bg-secondary/50 rounded-lg px-3 py-2 text-sm text-secondary-foreground">
              👤 Profile age: <span className="font-semibold">{profile.age} years</span> — medicines will be validated for your age
            </div>
          )}

          {/* Tablet Name with search */}
          <div className="relative">
            <Label htmlFor="name">Tablet Name</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                required
                placeholder="Search tablet name e.g. Metformin"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="rounded-xl pl-9"
                autoComplete="off"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {searchResults.map((med) => {
                  const ageOk = (profile?.age || 0) >= med.minAge;
                  return (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => selectMedicine(med)}
                      className={cn(
                        "w-full text-left px-4 py-3 transition-colors flex items-center justify-between",
                        ageOk ? "hover:bg-muted/50" : "opacity-50 bg-destructive/5"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">{med.name}</p>
                        <p className="text-xs text-muted-foreground">{med.dosage} · {med.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!ageOk && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-lg">
                            Age {med.minAge}+
                          </span>
                        )}
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          Max {med.maxDailyDoses}/day
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Show matched medicine info */}
          {matchedMed && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">ℹ️ {matchedMed.name} — {matchedMed.dosage}</p>
              <p className="text-muted-foreground">Max {matchedMed.maxDailyDoses} doses/day · Min {matchedMed.minHoursBetweenDoses}h gap · Age {matchedMed.minAge}+</p>
              <p className="text-muted-foreground">{matchedMed.instructions}</p>
              {(profile?.age || 0) < matchedMed.minAge && (
                <p className="text-destructive font-medium">⚠️ Not suitable for your age ({profile?.age}). Minimum age: {matchedMed.minAge}</p>
              )}
            </div>
          )}

          {/* Times per day */}
          <div>
            <Label htmlFor="times">How many times per day?</Label>
            <Input
              id="times"
              type="number"
              required
              min="1"
              max="20"
              placeholder="e.g. 2"
              value={timesPerDay}
              onChange={(e) => {
                const val = e.target.value;
                setTimesPerDay(val);
                const count = parseInt(val);
                if (!isNaN(count) && count > 0 && count <= 20) {
                  setReminderTimes((prev) => {
                    const arr = [...prev];
                    while (arr.length < count) arr.push("");
                    return arr.slice(0, count);
                  });
                }
              }}
              className="rounded-xl mt-1"
            />
          </div>

          {/* Reminder times */}
          {reminderTimes.length > 0 && timesPerDay && parseInt(timesPerDay) > 0 && (
            <div>
              <Label>Reminder Time(s)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {reminderTimes.map((t, i) => (
                  <Input
                    key={i}
                    type="time"
                    required
                    value={t}
                    onChange={(e) => {
                      const updated = [...reminderTimes];
                      updated[i] = e.target.value;
                      setReminderTimes(updated);
                    }}
                    className="rounded-xl"
                    placeholder={`Time ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <Label>Reminder Date Range</Label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal rounded-xl", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Ongoing"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => startDate ? date < startDate : false} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leave end date empty for ongoing reminders</p>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl">
          <Plus className="w-5 h-5 mr-2" /> Add Reminder
        </Button>
      </form>

      <SafetyAlert
        open={safetyAlert.open}
        onClose={() => setSafetyAlert((s) => ({ ...s, open: false }))}
        type={safetyAlert.type}
        medicineName={safetyAlert.name}
        details={safetyAlert.details}
      />
    </AppLayout>
  );
};

export default AddMedication;
