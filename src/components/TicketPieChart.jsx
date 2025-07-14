import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download } from "lucide-react";

const getServiceRequestData = (open, closed, solved) => [
  { name: "Open", value: open, color: "#f59e0b" }, // orange-500 - semantic for pending
  { name: "Closed", value: closed, color: "#22c55e" }, // green-500 - semantic for completed
  { name: "Solved", value: solved, color: "#3b82f6" }, // blue-500 - semantic for resolved
];

const CustomTooltip = ({ active, payload, serviceRequestData }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = serviceRequestData.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      >
        <p className="font-bold text-gray-900 text-base">{data.name} Requests</p>
        <p className="text-base text-gray-600">
          {data.value} ({percentage}%)
        </p>
      </motion.div>
    );
  }
  return null;
};

export function TicketPieChart({ ticketsOpen = 0, ticketsClosed = 0, ticketsSolved = 0 }) {
  const serviceRequestData = getServiceRequestData(ticketsOpen, ticketsClosed, ticketsSolved);
  const total = serviceRequestData.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6">
        {/* Header with aligned download button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Request Overview</h3>
            <p className="text-sm text-gray-500 mt-1">Total: {total} requests</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors text-sm font-medium flex items-center gap-2"
            aria-label="Download CSV report"
            title="Download CSV report"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </motion.button>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* True Circular Donut Chart - Centered */}
          <motion.div 
            className="flex-shrink-0 flex items-center justify-center"
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="w-48 h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceRequestData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    dataKey="value"
                    stroke="white"
                    strokeWidth={2}
                    paddingAngle={2}
                    style={{ cursor: 'pointer' }}
                  >
                    {serviceRequestData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={(props) => <CustomTooltip {...props} serviceRequestData={serviceRequestData} />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Clean Legend List - Below chart on mobile, right on desktop */}
          <div className="flex-1 w-full lg:w-auto">
            <div className="space-y-3">
              {serviceRequestData.map((item, index) => {
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {/* 12px colored dot */}
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    {/* Bold percentage */}
                    <span className="font-bold text-gray-900">{percentage}%</span>
                    {/* Count in gray */}
                    <span className="text-gray-700">{item.value} {item.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 