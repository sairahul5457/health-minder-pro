import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlarmClock, Volume2 } from "lucide-react";
import { Reminder } from "@/types/healthcare";
import { useEffect, useRef } from "react";

interface FullScreenAlertProps {
  reminder: Reminder | null;
  open: boolean;
  onClose: () => void;
  onTake: (id: string) => void;
  onSnooze: (id: string) => void;
}

const FullScreenAlert = ({ reminder, open, onClose, onTake, onSnooze }: FullScreenAlertProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) {
      // Create a simple beep using Web Audio API
      try {
        const ctx = new AudioContext();
        const playBeep = () => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 800;
          gain.gain.value = 0.3;
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.stop(ctx.currentTime + 0.5);
        };
        playBeep();
        const interval = setInterval(playBeep, 2000);
        return () => {
          clearInterval(interval);
          ctx.close();
        };
      } catch (e) {
        console.log("Audio not supported");
      }
    }
  }, [open]);

  if (!reminder) return null;

  const time = reminder.scheduledTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 border-0 overflow-hidden rounded-3xl">
        <div className="gradient-alert p-8 text-center text-primary-foreground">
          <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 animate-pulse-gentle">
            <Bell className="w-10 h-10" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Volume2 className="w-5 h-5 animate-pulse-gentle" />
            <span className="text-sm font-medium opacity-90">MEDICATION ALERT</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">{reminder.medicationName}</h2>
          <p className="text-xl opacity-90">{reminder.dosage}</p>
          <p className="text-lg opacity-80 mt-2">Scheduled at {time}</p>
        </div>

        <div className="p-6 space-y-3">
          <Button
            onClick={() => {
              onTake(reminder.id);
              onClose();
            }}
            className="w-full h-14 text-lg gradient-success border-0 text-success-foreground hover:opacity-90 rounded-xl"
          >
            <Check className="w-5 h-5 mr-2" /> I've Taken It
          </Button>
          <Button
            onClick={() => {
              onSnooze(reminder.id);
              onClose();
            }}
            variant="outline"
            className="w-full h-14 text-lg rounded-xl"
          >
            <AlarmClock className="w-5 h-5 mr-2" /> Snooze 10 min
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullScreenAlert;
