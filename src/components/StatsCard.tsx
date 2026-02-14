import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant: "taken" | "missed" | "pending";
}

const variantStyles = {
  taken: "gradient-success text-success-foreground",
  missed: "gradient-alert text-missed-foreground",
  pending: "gradient-warning text-pending-foreground",
};

const StatsCard = ({ title, value, icon, variant }: StatsCardProps) => {
  return (
    <div
      className={`${variantStyles[variant]} rounded-2xl p-5 shadow-elevated animate-scale-in flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-90">{title}</span>
        <div className="opacity-80">{icon}</div>
      </div>
      <span className="text-4xl font-bold">{value}</span>
    </div>
  );
};

export default StatsCard;
