"use client";

import React from "react";
import { ArrowRight, Clock, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function UrgencyBanner() {
  return (
    <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-blue-800/50 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold mb-6">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Fundo Ambiental 2026: Candidaturas por Ordem de Chegada</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-6 leading-tight">
          Não Deixe Esgotar os Apoios do Estado para a Sua Região.
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          As verbas públicas para eficiência energética e energia solar são atribuídas até ao limite da dotação orçamental. 
          Verifique em 60 segundos se a sua moradia cumpre todos os critérios antes do encerramento da fase atual.
        </p>

        {/* Benefits reminder */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-300 mb-8 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sem custos de candidatura</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Vistoria técnica gratuita</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Melhores instaladores DGEG</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#formulario"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-extrabold text-slate-950 bg-white hover:bg-slate-100 active:scale-[0.98] shadow-xl shadow-white/10 transition-all hover:scale-105"
          >
            <span>Verificar Elegibilidade aos Apoios Agora</span>
            <ArrowRight className="w-5 h-5 text-blue-600" />
          </a>
        </div>
      </div>
    </section>
  );
}
