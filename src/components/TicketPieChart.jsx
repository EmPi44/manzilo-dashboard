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
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 h-32 flex flex-row items-center gap-4">
      {/* Service Ticket Icon with orange-100 background */}
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100 border border-orange-200 mr-2 flex-shrink-0">
        <FileText className="w-7 h-7 text-orange-500" />
      </div>
      {/* Mini KPI Cards with dividers and hover states */}
      <div className="flex flex-row w-full h-full">
        {ticketCategories.map((cat, idx) => (
          <div
            key={cat.key}
            className={`flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100 py-2 px-2 min-w-[90px] transition-all duration-150 cursor-pointer hover:shadow hover:bg-white relative ${idx < ticketCategories.length - 1 ? 'mr-2' : ''}`}
            style={{ boxShadow: "0 1px 2px 0 rgba(16,30,54,0.04)" }}
          >
            <div className={`mb-1 ${cat.bg} rounded-full p-1 flex items-center justify-center`}>{cat.icon}</div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-gray-900">{values[cat.key]}</span>
              <span className="text-xs font-medium text-gray-500">{cat.label}</span>
            </div>
            <span className="text-xs font-semibold mt-1" style={{ color: cat.color }}>{percentages[cat.key]}%</span>
            {/* Vertical divider except after last card */}
            {idx < ticketCategories.length - 1 && (
              <div className="absolute right-0 top-2 bottom-2 w-px bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
} 