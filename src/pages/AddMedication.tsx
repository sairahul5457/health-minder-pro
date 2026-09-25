import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { findGapViolations, sortTimes, formatTime12, formatHours } from "@/lib/scheduleValidation";
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
  const { addReminders, replaceGroup, reminders } = useReminders();
  const [searchParams] = useSearchParams();
  const editGroupId = searchParams.get("edit");
  const [hasRx, setHasRx] = useState<"no" | "yes">("no");
  const [rxDoctor, setRxDoctor] = useState("");
  const [rxRef, setRxRef] = useState("");
  const [rxDose, setRxDose] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");
  const [warning, setWarning] = useState<null | { kind: "limit" | "gap" | "rx"; title: string; body: string }>(null);
  const [pendingSave, setPendingSave] = useState<null | (() => void)>(null);
  const [loadedEdit, setLoadedEdit] = useState(false);
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

  useEffect(() => {
    if (!editGroupId || loadedEdit || reminders.length === 0) return;
    const group = reminders.filter((r) => r.groupId === editGroupId);
    if (group.length === 0) return;
    const first = group[0];
    setName(first.medicationName);
    const med = sampleMedications.find((m) => m.name.toLowerCase() === first.medicationName.toLowerCase());
    setMatchedMed(med || null);
    const times = group.map((r) => `${String(r.scheduledTime.getHours()).padStart(2, "0")}:${String(r.scheduledTime.getMinutes()).padStart(2, "0")}`);
    setTimesPerDay(String(times.length));
    setReminderTimes(sortTimes(times));
    setStartDate(first.startDate);
    setEndDate(first.endDate);
    if (first.hasPrescription) {
      setHasRx("yes");
      setRxDoctor(first.doctorName || "");
      setRxRef(first.prescriptionReference || "");
      setRxDose(first.prescribedDose || "");
      setRxInstructions(first.prescriptionInstructions || "");
    }
    setLoadedEdit(true);
  }, [editGroupId, reminders, loadedEdit]);

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

    if (hasRx === "yes" && (!rxDoctor.trim() || !rxDose.trim())) {
      toast({ title: "⚠️ Prescription details missing", description: "Please enter the doctor name and prescribed dose." });
      return;
    }

    const sorted = sortTimes(filledTimes.slice(0, times));
    if (new Set(sorted).size !== sorted.length) {
      setWarning({ kind: "gap", title: "⚠️ Minimum Time Gap Warning", body: "Two reminders are set at the same time. Please adjust the reminder time." });
      return;
    }

    const save = () => doSave(sorted, dbMed);

    if (dbMed) {
      // Minimum time gap — always enforced, every consecutive dose
      const violations = findGapViolations(sorted, dbMed.minHoursBetweenDoses);
      if (violations.length > 0) {
        const v = violations[0];
        setWarning({
          kind: "gap",
          title: "⚠️ Minimum Time Gap Warning",
          body: `The selected reminder times are too close together.\n\nRequired minimum gap: ${formatHours(dbMed.minHoursBetweenDoses)}\nSelected gap: ${formatHours(v.gapHours)} (${formatTime12(v.from)} → ${formatTime12(v.to)})\n\nPlease adjust the reminder time.`,
        });
        return;
      }

      // Daily dosage limit
      if (times > dbMed.maxDailyDoses) {
        if (hasRx === "no") {
          setWarning({
            kind: "limit",
            title: "⚠️ Daily Dosage Limit Exceeded",
            body: `The planned medication schedule (${times} doses/day) exceeds the configured daily dosage limit of ${dbMed.maxDailyDoses} for ${dbMed.name}. Please adjust the dosage or provide a valid doctor prescription.`,
          });
          return;
        }
        setPendingSave(() => save);
        setWarning({
          kind: "rx",
          title: "⚠️ Prescription Dosage Notice",
          body: `The prescribed schedule (${times} doses/day) differs from the standard medication information in the system (max ${dbMed.maxDailyDoses}/day).\n\nPlease carefully verify that the prescription details have been entered correctly. This app does not medically validate prescriptions.`,
        });
        return;
      }
    }

    save();
  };

  const doSave = (sorted: string[], dbMed?: typeof sampleMedications[0]) => {
    const times = sorted.length;
    const groupId = editGroupId || `r-${Date.now()}`;
    const rx = hasRx === "yes";
    const today = new Date();
    const newReminders = sorted.map((timeStr, i) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      return {
        id: `${groupId}-${i}`,
        groupId,
        hasPrescription: rx,
        doctorName: rx ? rxDoctor.trim() : undefined,
        prescriptionReference: rx ? rxRef.trim() || undefined : undefined,
        prescribedDose: rx ? rxDose.trim() : undefined,
        prescribedFrequency: rx ? times : undefined,
        prescribedTimes: rx ? sorted : undefined,
        prescriptionStartDate: rx ? startDate || today : undefined,
        prescriptionEndDate: rx ? endDate : undefined,
        prescriptionInstructions: rx ? rxInstructions.trim() || undefined : undefined,
        medicationId: dbMed?.id || `custom-${Date.now()}`,
        medicationName: name,
        dosage: rx && rxDose.trim() ? rxDose.trim() : dbMed?.dosage || "As prescribed",
        scheduledTime,
        status: "pending" as const,
        snoozeCount: 0,
        startDate: startDate || today,
        endDate: endDate,
      };
    });

    if (editGroupId) replaceGroup(editGroupId, newReminders);
    else addReminders(newReminders);

    toast({
      title: editGroupId ? "✅ Reminder Updated" : "✅ Reminder Added",
      description: `${name} — ${times} time(s) per day.`,
    });
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">{editGroupId ? "Edit Reminder ✏️" : "Add Reminder 💊"}</h2>
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

          {/* Doctor prescription */}
          <div className="border border-border rounded-xl p-4 space-y-3">
            <Label>Does this medication have a doctor prescription?</Label>
            <RadioGroup value={hasRx} onValueChange={(v) => setHasRx(v as "no" | "yes")} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="rx-no" />
                <Label htmlFor="rx-no" className="font-normal">No</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="rx-yes" />
                <Label htmlFor="rx-yes" className="font-normal">Yes</Label>
              </div>
            </RadioGroup>
            {hasRx === "yes" && (
              <div className="space-y-3 pt-1">
                <div>
                  <Label htmlFor="rx-doctor">Doctor Name</Label>
                  <Input id="rx-doctor" value={rxDoctor} onChange={(e) => setRxDoctor(e.target.value)} placeholder="e.g. Dr. Sharma" className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label htmlFor="rx-ref">Prescription / Reference Number (optional)</Label>
                  <Input id="rx-ref" value={rxRef} onChange={(e) => setRxRef(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label htmlFor="rx-dose">Prescribed Dose</Label>
                  <Input id="rx-dose" value={rxDose} onChange={(e) => setRxDose(e.target.value)} placeholder="e.g. 1 tablet" className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label htmlFor="rx-notes">Additional Instructions (optional)</Label>
                  <Textarea id="rx-notes" value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} placeholder="e.g. After food" className="rounded-xl mt-1" />
                </div>
                <p className="text-xs text-muted-foreground">Enter the prescribed frequency, times and dates below. This app only stores and reminds — it does not medically validate prescriptions.</p>
              </div>
            )}
          </div>

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
          <Plus className="w-5 h-5 mr-2" /> {editGroupId ? "Save Changes" : "Add Reminder"}
        </Button>
      </form>

      <AlertDialog open={!!warning} onOpenChange={(o) => { if (!o) { setWarning(null); setPendingSave(null); } }}>
        <AlertDialogContent className={cn("border-2", warning?.kind === "rx" ? "border-warning" : "border-destructive")}>
          <AlertDialogHeader>
            <AlertDialogTitle className={warning?.kind === "rx" ? "text-warning" : "text-destructive"}>{warning?.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line text-base">{warning?.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { if (warning?.kind !== "rx") navigate(-1); }}>Cancel</AlertDialogCancel>
            {warning?.kind === "rx" ? (
              <AlertDialogAction onClick={() => { pendingSave?.(); setPendingSave(null); }}>Verify & Continue</AlertDialogAction>
            ) : (
              <AlertDialogAction>{warning?.kind === "gap" ? "Change Time" : "Adjust Dosage"}</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
