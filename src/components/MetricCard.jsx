import { motion } from "framer-motion";
import { useState } from "react";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus, Clock, Users, CheckCircle, FileText, ChevronRight, Trophy } from "lucide-react";
import { Card } from "./ui/card";

const iconMap = {
  open: <FileText className="h-6 w-6 text-indigo-500" strokeWidth={2} />,
  closed: <CheckCircle className="h-6 w-6 text-green-500" strokeWidth={2} />,
  time: <Clock className="h-6 w-6 text-orange-500" strokeWidth={2} />,
  solved: <CheckCircle className="h-6 w-6 text-blue-500" strokeWidth={2} />,
  tenants: <Users className="h-6 w-6 text-rose-500" strokeWidth={2} />,
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
      <Card className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 min-h-[7.5rem] flex flex-col justify-between group cursor-pointer">
        {/* Top Row: Icon, Number, Trophy/% column */}
        <div className="flex items-start justify-between mb-1 w-full gap-2">
          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 mr-2 flex-shrink-0 shadow-sm">
            {iconMap[type]}
          </div>
          {/* Number and right column */}
          <div className="flex-1 flex items-center min-w-0 gap-2">
            <div className="flex items-center min-w-0">
              <span className="text-3xl font-bold text-gray-900 truncate">
                <CountUp
                  end={numericValue}
                  duration={1.5}
                  separator="," 
                  decimals={type === 'time' ? 1 : 0}
                  suffix={type === 'time' ? 'h' : ''}
                />
              </span>
            </div>
            {/* Trophy and % column */}
            <div className="flex flex-col items-end justify-center ml-2 min-w-[60px]">
              {showBadge && (
                <span className="flex items-center gap-1 text-yellow-600 text-xs font-semibold mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" fill="#facc15" stroke="#facc15" />
                  <span className="text-xs font-semibold text-yellow-700">New Record!</span>
                </span>
              )}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[11px] font-medium shadow">
                {getTrendIcon()}
                <span>{Math.abs(trend)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="mb-0 mt-1">
          <span className="text-sm font-medium text-gray-700 tracking-wide">{label}</span>
        </div>

        {/* Drill-in Affordance - Right Aligned */}
        <motion.button
          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100 shadow"
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