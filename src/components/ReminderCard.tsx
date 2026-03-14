import { Reminder } from "@/types/healthcare";
import { Check, X, Clock, Bell, AlarmClock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReminderCardProps {
  reminder: Reminder;
  onTake: (id: string) => void;
  onSnooze: (id: string) => void;
  onViewAlert: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  taken: {
    bg: "bg-taken/10 border-taken/20",
    badge: "bg-taken text-taken-foreground",
    label: "Taken",
    icon: <Check className="w-3.5 h-3.5" />,
  },
  missed: {
    bg: "bg-missed/10 border-missed/20",
    badge: "bg-missed text-missed-foreground",
    label: "Missed",
    icon: <X className="w-3.5 h-3.5" />,
  },
  pending: {
    bg: "bg-pending/10 border-pending/20",
    badge: "bg-pending text-pending-foreground",
    label: "Pending",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  snoozed: {
    bg: "bg-accent border-accent",
    badge: "bg-primary text-primary-foreground",
    label: "Snoozed",
    icon: <AlarmClock className="w-3.5 h-3.5" />,
  },
};

const ReminderCard = ({ reminder, onTake, onSnooze, onViewAlert, onDelete }: ReminderCardProps) => {
  const config = statusConfig[reminder.status];
  const time = reminder.scheduledTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`${config.bg} border rounded-xl p-4 animate-slide-up transition-all hover:shadow-card`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">{reminder.medicationName}</h3>
            <p className="text-muted-foreground text-sm">
              {reminder.dosage} • {time}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`${config.badge} text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1`}
          >
            {config.icon}
            {config.label}
          </span>
          {onDelete && (
            <Button
              onClick={() => onDelete(reminder.id)}
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1.5 h-auto"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {(reminder.status === "pending" || reminder.status === "snoozed") && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            onClick={() => onTake(reminder.id)}
            size="sm"
            className="flex-1 gradient-success border-0 text-success-foreground hover:opacity-90"
          >
            <Check className="w-4 h-4 mr-1" /> Mark as Taken
          </Button>
          <Button
            onClick={() => onSnooze(reminder.id)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <AlarmClock className="w-4 h-4 mr-1" /> Snooze
          </Button>
          <Button
            onClick={() => onViewAlert(reminder.id)}
            size="sm"
            variant="outline"
            className="px-3"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReminderCard;
