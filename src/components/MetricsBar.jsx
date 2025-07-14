import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MetricCardRow from "./MetricCardRow";

export default function MetricsBar({ selectedBuilding }) {
  const [metrics, setMetrics] = useState({
    ticketsOpen: 0,
    ticketsClosed: 0,
    ticketsSolved: 0,
    timeSaved: 0,
    tenants: 0
  });

  // Animate metrics when building changes
  useEffect(() => {
    if (selectedBuilding) {
      const newMetrics = selectedBuilding.metrics;
      
      // Animate the transition by updating values gradually
      const animateMetrics = () => {
        setMetrics(prevMetrics => {
          const step = 0.1;
          const updatedMetrics = {};
          
          Object.keys(newMetrics).forEach(key => {
            const target = newMetrics[key];
            const current = prevMetrics[key];
            const diff = target - current;
            
            if (Math.abs(diff) < 1) {
              updatedMetrics[key] = target;
            } else {
              updatedMetrics[key] = current + (diff * step);
            }
          });
          
          return updatedMetrics;
        });
      };

      const interval = setInterval(animateMetrics, 50);
      
      // Clean up interval when animation is complete
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setMetrics(newMetrics);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [selectedBuilding]);

  if (!selectedBuilding) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full p-8 text-center text-gray-500"
      >
        Select a building to view metrics
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full p-6 bg-gradient-to-br from-gray-50/50 to-white/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header with building info */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedBuilding.name}
        </h2>
        <p className="text-gray-600">
          Performance metrics and service request overview
        </p>
      </motion.div>

      {/* Metrics Cards */}
      <MetricCardRow
        ticketsOpen={Math.round(metrics.ticketsOpen)}
        ticketsClosed={Math.round(metrics.ticketsClosed)}
        ticketsSolved={Math.round(metrics.ticketsSolved)}
        timeSaved={Math.round(metrics.timeSaved)}
        tenants={Math.round(metrics.tenants)}
      />

      {/* Quick Actions */}
      <motion.div
        className="flex gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Export Report
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Details
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 