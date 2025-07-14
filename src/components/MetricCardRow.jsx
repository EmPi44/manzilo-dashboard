import { MetricCard } from "./MetricCard";

const metrics = [
  { type: "open", value: 27, label: "Tickets Open" },
  { type: "closed", value: 134, label: "Tickets Closed" },
  { type: "time", value: "89h", label: "Time Saved" },
  { type: "solved", value: 161, label: "Tickets Solved" },
  { type: "tenants", value: 78, label: "Tenants Served" },
];

export default function MetricCardRow() {
  return (
    <div className="w-full flex flex-wrap gap-6 justify-between items-stretch mb-8
      sm:grid sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row">
      {metrics.map((m) => (
        <MetricCard key={m.label} {...m} />
      ))}
    </div>
  );
} 