import { MetricCard } from "./MetricCard";
import { TicketPieChart } from "./TicketPieChart";
import { motion } from "framer-motion";

const getMetrics = (timeSaved, tenants) => [
  { 
    type: "time", 
    value: `${timeSaved}h`, 
    label: "Time Saved",
    trend: 12, // 12% increase
    previousValue: Math.round(timeSaved * 0.88), // Previous value for progress bar
    threshold: 100, // Goal threshold
    showBadge: timeSaved >= 75 // Show badge if significant achievement
  },
  { 
    type: "tenants", 
    value: tenants, 
    label: "Tenants Served",
    trend: 8, // 8% increase
    previousValue: Math.round(tenants * 0.92),
    threshold: 500, // Goal threshold
    showBadge: tenants >= 300 // Show badge if significant achievement
  },
];

export default function MetricCardRow({ ticketsOpen = 0, ticketsClosed = 0, ticketsSolved = 0, timeSaved = 0, tenants = 0 }) {
  return (
    <motion.div 
      className="w-full mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Ticket Pie Chart - Takes up 1/3 on large screens */}
        <div className="lg:col-span-1">
          <TicketPieChart 
            ticketsOpen={ticketsOpen}
            ticketsClosed={ticketsClosed}
            ticketsSolved={ticketsSolved}
          />
        </div>
        
        {/* Metric Cards - Take up 2/3 on large screens */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {getMetrics(timeSaved, tenants).map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </motion.div>
  );
} 