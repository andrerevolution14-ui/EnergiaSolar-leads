import React from "react";
import { TrendingDown, CalendarClock, Shield, Award } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      value: "40% - 70%",
      label: "Poupança Direta na Fatura",
      subtext: "Impacto imediato no 1º mês",
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
      value: "+1.200",
      label: "Sistemas Instalados",
      subtext: "Residencial e Industrial",
      icon: Award,
      color: "text-blue-700",
      bgColor: "bg-blue-100/60",
    },
  ];

  return (
    <section className="border-y border-slate-200/80 bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 rounded-2xl transition-colors hover:bg-slate-50/80"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </span>
                </div>
                <div className="font-bold text-slate-800 text-sm sm:text-base">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
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
