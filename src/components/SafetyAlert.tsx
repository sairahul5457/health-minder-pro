import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, ShieldAlert, Baby } from "lucide-react";

interface SafetyAlertProps {
  open: boolean;
  onClose: () => void;
  type: "overdose" | "age" | "caregiver";
  medicineName: string;
  details: string;
}

const alertConfig = {
  overdose: {
    icon: <ShieldAlert className="w-8 h-8" />,
    title: "⚠️ Dosage Limit Exceeded",
    bgClass: "gradient-alert",
  },
  age: {
    icon: <Baby className="w-8 h-8" />,
    title: "👶 Age Suitability Warning",
    bgClass: "gradient-warning",
  },
  caregiver: {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: "📞 Caregiver Alert Sent",
    bgClass: "gradient-primary",
  },
};

const SafetyAlert = ({ open, onClose, type, medicineName, details }: SafetyAlertProps) => {
  const config = alertConfig[type];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-0 rounded-2xl overflow-hidden p-0">
        <div className={`${config.bgClass} p-6 text-primary-foreground text-center`}>
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 animate-shake">
            {config.icon}
          </div>
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-xl">{config.title}</DialogTitle>
          </DialogHeader>
        </div>
        <div className="p-6 text-center">
          <p className="font-semibold text-lg text-foreground mb-2">{medicineName}</p>
          <p className="text-muted-foreground leading-relaxed">{details}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SafetyAlert;
