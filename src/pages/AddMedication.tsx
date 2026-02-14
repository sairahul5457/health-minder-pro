import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import SafetyAlert from "@/components/SafetyAlert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pill } from "lucide-react";

const AddMedication = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    times: "08:00",
    maxDailyDoses: "1",
    minAge: "0",
    instructions: "",
    precautions: "",
    category: "General",
  });

  const [safetyAlert, setSafetyAlert] = useState<{
    open: boolean;
    type: "overdose" | "age" | "caregiver";
    name: string;
    details: string;
  }>({ open: false, type: "overdose", name: "", details: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const maxDoses = parseInt(form.maxDailyDoses);
    if (maxDoses > 6) {
      setSafetyAlert({
        open: true,
        type: "overdose",
        name: form.name,
        details: `A daily dosage of ${maxDoses} exceeds the safe limit. Please verify with your healthcare provider before proceeding.`,
      });
      return;
    }
    toast({
      title: "✅ Medication Added",
      description: `${form.name} has been added to your reminders.`,
    });
    navigate("/medications");
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Add Medication ➕</h2>
        <p className="text-muted-foreground mt-1">Set up a new medicine reminder</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Medicine Details</h3>
          </div>

          <div>
            <Label htmlFor="name">Medicine Name</Label>
            <Input id="name" required placeholder="e.g. Metformin" value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" required placeholder="e.g. 500mg" value={form.dosage} onChange={(e) => update("dosage", e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["General", "Diabetes", "Blood Pressure", "Antibiotic", "Supplement", "Pain Relief"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => update("frequency", v)}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Once daily", "Twice daily", "Three times daily", "As needed"].map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="times">Reminder Time</Label>
              <Input id="times" type="time" value={form.times} onChange={(e) => update("times", e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="maxDoses">Max Daily Doses</Label>
              <Input id="maxDoses" type="number" min="1" max="20" value={form.maxDailyDoses} onChange={(e) => update("maxDailyDoses", e.target.value)} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label htmlFor="minAge">Min Age</Label>
              <Input id="minAge" type="number" min="0" value={form.minAge} onChange={(e) => update("minAge", e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
          <h3 className="font-semibold text-foreground">Additional Info</h3>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea id="instructions" placeholder="How to take this medicine..." value={form.instructions} onChange={(e) => update("instructions", e.target.value)} className="rounded-xl mt-1" rows={2} />
          </div>
          <div>
            <Label htmlFor="precautions">Precautions</Label>
            <Textarea id="precautions" placeholder="Any safety precautions..." value={form.precautions} onChange={(e) => update("precautions", e.target.value)} className="rounded-xl mt-1" rows={2} />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base gradient-primary border-0 text-primary-foreground hover:opacity-90 rounded-xl">
          <Plus className="w-5 h-5 mr-2" /> Add Medication
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
