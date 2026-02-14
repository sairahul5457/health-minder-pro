import { Medication } from "@/types/healthcare";
import { Pill, Clock, AlertTriangle, Info, ChevronRight } from "lucide-react";

interface MedicineCardProps {
  medication: Medication;
  onClick: (id: string) => void;
}

const MedicineCard = ({ medication, onClick }: MedicineCardProps) => {
  return (
    <div
      onClick={() => onClick(medication.id)}
      className="bg-card border border-border rounded-xl p-4 shadow-card hover:shadow-elevated transition-all cursor-pointer animate-slide-up group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: medication.color + "20", color: medication.color }}
          >
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{medication.name}</h3>
            <p className="text-sm text-muted-foreground">{medication.dosage} • {medication.category}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> {medication.frequency}
        </span>
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5" /> Max {medication.maxDailyDoses}/day
        </span>
        {medication.minAge > 0 && (
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Age {medication.minAge}+
          </span>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
