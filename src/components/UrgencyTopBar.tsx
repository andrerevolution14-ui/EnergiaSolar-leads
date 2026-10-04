"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function UrgencyTopBar() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white text-xs sm:text-sm py-2.5 px-4 border-b border-blue-800/40 relative z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-extrabold text-amber-300">FUNDO AMBIENTAL & APOIOS 2026:</span>
          <span className="text-slate-200 hidden md:inline">
            Dotação orçamental limitada por distrito. Candidaturas avaliadas por ordem rigorosa de submissão.
          </span>
          <span className="text-slate-200 md:hidden">
            Verbas limitadas por região.
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-blue-900/60 px-2.5 py-1 rounded-lg border border-blue-700/50">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Lote atual expira em:</span>
            <span className="font-black text-amber-400">
              {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </span>
          </div>

          <a
            href="#formulario"
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors shadow-sm"
          >
            Verificar Elegibilidade &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
