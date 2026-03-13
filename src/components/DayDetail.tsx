import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { DayContent } from "../data/journey";
import AudioPlayer from "./AudioPlayer";

interface DayDetailProps {
  day: DayContent;
  isCompleted: boolean;
  onBack: () => void;
  onToggleComplete: () => void;
}

export default function DayDetail({ day, isCompleted, onBack, onToggleComplete }: DayDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto"
    >
      <button
        id="back-button"
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a jornada
      </button>

      <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 block">
              Dia {day.id}
            </span>
            <h1 className="text-4xl font-bold text-stone-900 mb-2">{day.title}</h1>
            <p className="text-xl text-stone-500 italic font-serif">{day.subtitle}</p>
          </div>
          <button
            id="toggle-complete"
            onClick={onToggleComplete}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-stone-800 text-white hover:bg-stone-700"
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Concluído
              </>
            ) : (
              "Marcar como concluído"
            )}
          </button>
        </div>

        <div className="mb-10">
          <AudioPlayer 
            prompt={`${day.instruction}. Dia ${day.id}: ${day.title}. ${day.subtitle}. Ensinamento: ${day.content}. Exercícios práticos: ${day.exercises.join(". ")}`} 
            dayId={day.id} 
          />
        </div>

        <div className="prose prose-stone max-w-none mb-12">
          <h2 className="text-2xl font-semibold text-stone-800 mb-4">O Ensinamento</h2>
          <p className="text-lg leading-relaxed text-stone-600 whitespace-pre-wrap">
            {day.content}
          </p>
        </div>

        <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100">
          <h2 className="text-2xl font-semibold text-stone-800 mb-6">Exercícios Práticos</h2>
          <ul className="space-y-6">
            {day.exercises.map((exercise, index) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <p className="text-stone-600 leading-relaxed pt-1">{exercise}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
