import { Card } from "./ui/card";
import {
  IconTicket,
  IconCheck,
  IconClock,
  IconCircleCheck,
  IconUsers,
} from "@tabler/icons-react";

const iconMap = {
  open: <IconTicket className="h-6 w-6 text-indigo-500" stroke={2} aria-hidden />,
  closed: <IconCheck className="h-6 w-6 text-green-500" stroke={2} aria-hidden />,
  time: <IconClock className="h-6 w-6 text-orange-500" stroke={2} aria-hidden />,
  solved: <IconCircleCheck className="h-6 w-6 text-blue-500" stroke={2} aria-hidden />,
  tenants: <IconUsers className="h-6 w-6 text-rose-500" stroke={2} aria-hidden />,
};

const accentMap = {
  open: "text-indigo-500",
  closed: "text-green-500",
  time: "text-orange-500",
  solved: "text-blue-500",
  tenants: "text-rose-500",
};

export function MetricCard({ type, value, label }) {
  return (
    <Card
      tabIndex={0}
      aria-label={label}
      className="flex-1 min-w-[180px] max-w-[240px] bg-white border border-gray-200 rounded-[12px] shadow-sm px-6 py-6 flex items-center gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-300 outline-none"
    >
      <div>{iconMap[type]}</div>
      <div>
        <div className={`text-2xl font-bold ${accentMap[type]}`}>{value}</div>
        <div className="text-base font-medium text-gray-600">{label}</div>
      </div>
    </Card>
  );
} 