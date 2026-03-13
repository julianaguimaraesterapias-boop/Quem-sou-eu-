import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Sparkles, Trophy } from "lucide-react";
import { journeyData, DayContent } from "./data/journey";
import DayCard from "./components/DayCard";
import DayDetail from "./components/DayDetail";

export default function App() {
  const [selectedDay, setSelectedDay] = useState<DayContent | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("journey-progress");
    if (saved) {
      try {
        setCompletedDays(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress", e);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem("journey-progress", JSON.stringify(completedDays));
  }, [completedDays]);

  const toggleComplete = (id: number) => {
    setCompletedDays(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedDays.length / journeyData.length) * 100);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Quem Sou Eu</h1>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-medium">Jornada de 21 Dias</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Seu Progresso</p>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-stone-800"
                  />
                </div>
                <span className="text-sm font-bold text-stone-800">{progress}%</span>
              </div>
            </div>
            <button
              id="reset-progress"
              onClick={() => {
                setCompletedDays([]);
              }}
              onDoubleClick={() => {
                setCompletedDays([]);
              }}
              className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Clique para reiniciar jornada"
            >
              <Trophy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <AnimatePresence mode="wait">
          {selectedDay ? (
            <div key="detail">
              <DayDetail
                day={selectedDay}
                isCompleted={completedDays.includes(selectedDay.id)}
                onBack={() => setSelectedDay(null)}
                onToggleComplete={() => toggleComplete(selectedDay.id)}
              />
            </div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-12 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full text-stone-600 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4 text-stone-400" />
                  Bem-vinda à sua transformação
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 font-serif">
                  Uma viagem interna para autodescoberta
                </h2>
                <p className="text-lg text-stone-500 leading-relaxed">
                  Explore as camadas da sua identidade, acolha suas sombras e manifeste seu Self Essencial em uma jornada estruturada de 21 dias.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {journeyData.map((day) => (
                  <div key={day.id}>
                    <DayCard
                      day={day}
                      isCompleted={completedDays.includes(day.id)}
                      isSelected={false}
                      onClick={() => setSelectedDay(day)}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Progress Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 p-4 z-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-stone-800"
            />
          </div>
          <span className="text-xs font-bold text-stone-800 whitespace-nowrap">
            {completedDays.length} / {journeyData.length} DIAS
          </span>
        </div>
      </div>
    </div>
  );
}
