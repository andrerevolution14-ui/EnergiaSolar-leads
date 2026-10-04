import React from "react";
import { TrendingDown, CalendarClock, Shield, Award } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      value: "40% - 75%",
      label: "Poupança Direta na Luz",
      subtext: "Corte logo no 1º mês",
      icon: TrendingDown,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      value: "30 Dias",
      label: "Instalação Chave-na-Mão",
      subtext: "Do projeto à ligação à rede",
      icon: CalendarClock,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
    },
    {
      value: "25 Anos",
      label: "Garantia de Produção",
      subtext: "Equipamentos Tier-1 mundiais",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      value: "+1.400",
      label: "Instalações Concluídas",
      subtext: "Melhores empresas em Portugal",
      icon: Award,
      color: "text-blue-700",
      bgColor: "bg-blue-100/60",
    },
  ];

  return (
    <section className="border-y border-slate-200/80 bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-2.5 sm:p-4 rounded-2xl transition-colors hover:bg-slate-50/80"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.bgColor} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                  <span className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="font-extrabold text-slate-900 text-xs sm:text-base leading-tight">
                  {stat.label}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
