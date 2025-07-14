import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, Clock, Users, CheckCircle, FileText, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";

const iconMap = {
  open: <FileText className="h-6 w-6 text-indigo-500" strokeWidth={2} />,
  closed: <CheckCircle className="h-6 w-6 text-green-500" strokeWidth={2} />,
  time: <Clock className="h-6 w-6 text-orange-500" strokeWidth={2} />,
  solved: <CheckCircle className="h-6 w-6 text-blue-500" strokeWidth={2} />,
  tenants: <Users className="h-6 w-6 text-rose-500" strokeWidth={2} />,
};

const accentMap = {
  open: "text-indigo-500",
  closed: "text-green-500",
  time: "text-orange-500",
  solved: "text-blue-500",
  tenants: "text-rose-500",
};

export function MetricCard({ 
  type, 
  value, 
  label, 
  trend = 0, 
  previousValue = 0,
  threshold = null,
  showBadge = false 
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Performance-based styling
  const getPerformanceColor = () => {
    if (threshold && value >= threshold) return "text-emerald-600";
    if (trend > 0) return "text-emerald-600";
    if (trend < 0) return "text-amber-600";
    return "text-gray-600";
  };

  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-amber-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Extract numeric value for CountUp
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 min-h-[200px] group cursor-pointer">
        
        {/* New Record Badge - Top Left Corner */}
        <AnimatePresence>
          {showBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-0 left-0 z-10"
            >
              <div className="bg-green-100 text-green-700 px-2 py-1 text-xs font-semibold rounded-br-lg border-r border-b border-green-200">
                New Record!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Row: Icon + Percent Change Chip */}
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            animate={{ 
              scale: isHovered ? 1.05 : 1,
              rotate: isHovered ? 2 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
              {iconMap[type]}
            </div>
          </motion.div>
          
          {/* Percent Change Chip - Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
              {getTrendIcon()}
              <span>{Math.abs(trend)}%</span>
            </div>
          </motion.div>
        </div>

        {/* Body: Metric Value */}
        <div className="mb-2">
          <motion.div 
            className="text-4xl font-bold text-gray-900"
            key={value} // Triggers re-animation when value changes
          >
            <CountUp
              end={numericValue}
              duration={1.5}
              separator=","
              decimals={type === 'time' ? 1 : 0}
              suffix={type === 'time' ? 'h' : ''}
            />
          </motion.div>
        </div>

        {/* Label */}
        <div className="mb-2">
          <span className="text-base font-medium text-gray-700">{label}</span>
        </div>

        {/* Secondary Line: Previous & Goal */}
        {type === 'time' && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-sm text-gray-500">
              Previous: {previousValue}h • Goal: 100h
            </div>
          </motion.div>
        )}

        {/* Progress Bar - Enhanced */}
        {type === 'time' && (
          <motion.div 
            className="mt-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <motion.div
                className="bg-orange-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((numericValue / 100) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {Math.round((numericValue / 100) * 100)}% of goal
            </div>
          </motion.div>
        )}

        {/* Drill-in Affordance - Right Aligned */}
        <motion.button
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`View details for ${label}`}
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </motion.button>
      </Card>
    </motion.div>
  );
} 