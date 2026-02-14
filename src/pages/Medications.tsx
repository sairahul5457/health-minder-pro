import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import MedicineCard from "@/components/MedicineCard";
import SafetyAlert from "@/components/SafetyAlert";
import { sampleMedications } from "@/data/sampleData";
import { Medication } from "@/types/healthcare";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pill, Clock, AlertTriangle, ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Medications = () => {
  const [medications] = useState<Medication[]>(sampleMedications);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [safetyAlert, setSafetyAlert] = useState<{
    open: boolean;
    type: "overdose" | "age" | "caregiver";
    name: string;
    details: string;
  }>({ open: false, type: "overdose", name: "", details: "" });
  const [search, setSearch] = useState("");

  const filtered = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleClick = (id: string) => {
    const med = medications.find((m) => m.id === id);
    if (med) setSelectedMed(med);
  };

  const checkAgeSafety = (med: Medication) => {
    // Demo: simulate age check for a child user
    setSafetyAlert({
      open: true,
      type: "age",
      name: med.name,
      details: `This medicine is recommended for ages ${med.minAge}+. Please consult a doctor before administering to younger patients.`,
    });
  };

  return (
    <AppLayout>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">My Medicines 💊</h2>
        <p className="text-muted-foreground mt-1">View information and safety details</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl h-11"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((med) => (
          <MedicineCard key={med.id} medication={med} onClick={handleClick} />
        ))}
      </div>

      {/* Medicine Detail Dialog */}
      <Dialog open={!!selectedMed} onOpenChange={() => setSelectedMed(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {selectedMed && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: selectedMed.color + "20", color: selectedMed.color }}
                  >
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedMed.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selectedMed.dosage} • {selectedMed.category}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <InfoSection icon={<Clock className="w-4 h-4 text-primary" />} title="Schedule" text={`${selectedMed.frequency} — ${selectedMed.times.join(", ")}`} />
                <InfoSection icon={<Pill className="w-4 h-4 text-primary" />} title="Instructions" text={selectedMed.instructions} />
                <InfoSection icon={<AlertTriangle className="w-4 h-4 text-warning" />} title="Side Effects" text={selectedMed.sideEffects} />
                <InfoSection icon={<ShieldCheck className="w-4 h-4 text-success" />} title="Precautions" text={selectedMed.precautions} />

                <div className="flex gap-3 pt-2">
                  <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Max Daily</p>
                    <p className="text-lg font-bold text-foreground">{selectedMed.maxDailyDoses}</p>
                  </div>
                  <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Min Age</p>
                    <p className="text-lg font-bold text-foreground">{selectedMed.minAge}+</p>
                  </div>
                </div>

                <button
                  onClick={() => checkAgeSafety(selectedMed)}
                  className="w-full py-2.5 text-sm font-medium text-warning border border-warning/30 rounded-xl hover:bg-warning/10 transition-colors"
                >
                  🛡️ Check Age Suitability
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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

const InfoSection = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
    <p className="text-sm text-muted-foreground pl-6">{text}</p>
  </div>
);

export default Medications;
