import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "motion/react";
import { DayContent } from "../data/journey";

interface DayCardProps {
  day: DayContent;
  isCompleted: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function DayCard({ day, isCompleted, isSelected, onClick }: DayCardProps) {
  return (
    <motion.button
      id={`day-card-${day.id}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-6 rounded-3xl text-left transition-all border-2 ${
        isSelected 
          ? "bg-stone-800 text-white border-stone-800 shadow-lg" 
          : "bg-white text-stone-800 border-stone-100 hover:border-stone-200 shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-stone-400" : "text-stone-400"}`}>
          Dia {day.id}
        </span>
        {isCompleted ? (
          <CheckCircle2 className={`w-5 h-5 ${isSelected ? "text-emerald-400" : "text-emerald-500"}`} />
        ) : (
          <Circle className={`w-5 h-5 ${isSelected ? "text-stone-600" : "text-stone-200"}`} />
        )}
      </div>
      <h3 className="text-lg font-semibold leading-tight mb-1">{day.title}</h3>
      <p className={`text-sm ${isSelected ? "text-stone-400" : "text-stone-500"} line-clamp-2`}>
        {day.subtitle}
      </p>
    </motion.button>
  );
}
