import { Card } from "./ui/card";
import { FileText, CheckCircle, PieChart as PieIcon } from "lucide-react";

const ticketCategories = [
  {
    key: "open",
    label: "Open",
    color: "#f59e0b",
    icon: <PieIcon className="w-5 h-5 text-orange-500" />,
    bg: "bg-orange-100",
  },
  {
    key: "closed",
    label: "Closed",
    color: "#22c55e",
    icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    bg: "bg-green-100",
  },
  {
    key: "solved",
    label: "Solved",
    color: "#3b82f6",
    icon: <CheckCircle className="w-5 h-5 text-blue-500" />,
    bg: "bg-blue-100",
  },
];

export function TicketPieChart({ ticketsOpen = 0, ticketsClosed = 0, ticketsSolved = 0 }) {
  const total = ticketsOpen + ticketsClosed + ticketsSolved;
  const values = {
    open: ticketsOpen,
    closed: ticketsClosed,
    solved: ticketsSolved,
  };
  const percentages = {
    open: total ? ((ticketsOpen / total) * 100).toFixed(1) : 0,
    closed: total ? ((ticketsClosed / total) * 100).toFixed(1) : 0,
    solved: total ? ((ticketsSolved / total) * 100).toFixed(1) : 0,
  };

  return (
    <Card className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 min-h-[5.5rem] h-full flex flex-row items-center group cursor-pointer">
      {/* Icon on the left, smaller size */}
      <div className="flex items-center justify-center w-9 min-w-[2.25rem] h-9 rounded-md bg-orange-100 border border-orange-200 mr-4">
        <FileText className="w-5 h-5 text-orange-500" />
      </div>
      {/* Ticket KPIs horizontally aligned, flex-1, centered */}
      <div className="flex flex-row flex-1 items-center justify-between h-full">
        {ticketCategories.map((cat, idx) => (
          <div
            key={cat.key}
            className="flex flex-col items-center justify-center h-full px-3"
          >
            <div className={`mb-1 ${cat.bg} rounded-full p-1 flex items-center justify-center`}>{cat.icon}</div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-gray-900 leading-tight align-baseline">{values[cat.key]}</span>
              <span className="text-xs font-medium text-gray-500 leading-tight align-baseline">{cat.label}</span>
            </div>
            <span className="text-xs font-semibold mt-1" style={{ color: cat.color }}>{percentages[cat.key]}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
} 