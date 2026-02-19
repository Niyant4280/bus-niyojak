import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface TimeDisplayProps {
  time: string;
  type: "departure" | "frequency";
  size?: "small" | "medium" | "large";
}

export default function TimeDisplay({ time, type, size = "medium" }: TimeDisplayProps) {
  const [isUrgent, setIsUrgent] = useState(false);

  // Check if time is urgent (less than 5 minutes)
  useEffect(() => {
    try {
      if (type === "departure" && time) {
        const timeValue = parseInt(time.replace(/\D/g, ""));
        const timeUnit = time.includes("min") ? "min" : time.includes("hour") ? "hour" : "";
        
        if (timeUnit === "min" && timeValue <= 5) {
          setIsUrgent(true);
        }
      }
    } catch (error) {
      console.log("TimeDisplay error:", error);
    }
  }, [time, type]);

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-2 text-sm";
      case "large":
        return "p-4 text-xl";
      default:
        return "p-3 text-lg";
    }
  };

  const getTimeStyles = () => {
    if (type === "departure") {
      if (isUrgent) {
        return "bg-gradient-to-r from-red-100 to-pink-100 border-red-300 text-red-700";
      }
      return "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-600";
    } else {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-600";
    }
  };

  const getBorderStyles = () => {
    if (type === "departure" && isUrgent) {
      return "border-2 border-red-400 animate-pulse";
    }
    return "border-2";
  };

  const getIcon = () => {
    if (type === "departure") {
      return isUrgent ? <AlertCircle className="h-4 w-4 animate-pulse" /> : <Clock className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  // Fallback display if there's an error
  if (!time) {
    return (
      <div className="bg-gray-100 rounded-xl p-3 text-center">
        <p className="text-sm text-gray-500">No time data</p>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-white to-gray-50 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 ${getTimeStyles()} ${getBorderStyles()}`}>
      <div className="flex items-center justify-center space-x-2 mb-1">
        {getIcon()}
        <span className="text-xs font-medium opacity-80">
          {type === "departure" ? "Next in" : "Every"}
        </span>
      </div>
      
      <div className="text-center">
        <p className={`font-bold ${size === "large" ? "text-2xl" : size === "small" ? "text-base" : "text-xl"}`}>
          {time}
        </p>
        
        <p className="text-xs font-medium opacity-70 mt-1">
          {type === "departure" ? "Estimated Time" : "Frequency"}
        </p>
        
        {isUrgent && type === "departure" && (
          <div className="mt-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg p-2 border border-red-300">
            <p className="text-xs font-bold text-red-700 animate-pulse flex items-center justify-center space-x-1">
              <span>⚠️</span>
              <span>Departing Soon!</span>
            </p>
            <p className="text-xs text-red-600 mt-1 font-medium">
              Hurry up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
