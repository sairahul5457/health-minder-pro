import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SafetyAlert from "@/components/SafetyAlert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Pill, Search } from "lucide-react";
import { sampleMedications } from "@/data/sampleData";

const AddMedication = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("");
  const [matchedMed, setMatchedMed] = useState<typeof sampleMedications[0] | null>(null);
  const [searchResults, setSearchResults] = useState<typeof sampleMedications>([]);

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

    // Check against database limits
    const dbMed = sampleMedications.find(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );

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

    toast({
      title: "✅ Reminder Added",
      description: `${name} — ${times} time(s) per day.`,
    });
    navigate("/medications");
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
                {searchResults.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => selectMedicine(med)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.dosage} · {med.category}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                      Max {med.maxDailyDoses}/day
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Show matched medicine info */}
          {matchedMed && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">ℹ️ {matchedMed.name} — {matchedMed.dosage}</p>
              <p className="text-muted-foreground">Max {matchedMed.maxDailyDoses} doses/day · Min {matchedMed.minHoursBetweenDoses}h gap · Age {matchedMed.minAge}+</p>
              <p className="text-muted-foreground">{matchedMed.instructions}</p>
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
              onChange={(e) => setTimesPerDay(e.target.value)}
              className="rounded-xl mt-1"
            />
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
