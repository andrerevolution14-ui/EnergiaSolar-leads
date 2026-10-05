"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Building2, Home, Star, MapPin, Award } from "lucide-react";

export default function HeroSection() {
  const [activeSegment, setActiveSegment] = useState<"residencial" | "empresas">("residencial");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white pt-4 pb-10 sm:pt-6 sm:pb-12 lg:pt-8 lg:pb-16">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Audience Segment Switcher Tabs - Optimized for mobile and desktop */}
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className="inline-flex w-full sm:w-auto p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSegment("residencial")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeSegment === "residencial"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span>Moradias & Famílias</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSegment("empresas")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeSegment === "empresas"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span>Empresas & Pavilhões</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Copywriting, Purchase CTAs, and Guarantees */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs sm:text-sm font-bold mb-3 sm:mb-4 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>Apoios do Estado 2026: Verbas Limitadas no Seu Concelho</span>
            </div>

            {/* H1 Headline - Punchy, High Impact above the fold */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15] mb-3 sm:mb-4">
              {activeSegment === "residencial" ? (
                <>
                  Instale Painéis Solares na Sua Moradia e <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">Comece a Poupar até 75%</span> Já Este Mês.
                </>
              ) : (
                <>
                  Instale Energia Solar na Sua Empresa e <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">Reduza até 70% nos Custos</span> Já Este Mês.
                </>
              )}
            </h1>

            {/* H2 Subheadline */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mb-6">
              {activeSegment === "residencial" ? (
                <>
                  Comparamos os <strong>instaladores certificados DGEG mais bem avaliados</strong> do país. Garantimos o menor orçamento, candidatura a apoios a fundo perdido e <strong>instalação chave-na-mão em 30 dias</strong>.
                </>
              ) : (
                <>
                  Auditoria técnica por engenheiros credenciados. Redução direta de custos fixos diurnos, amortização acelerada em IRC e opções de autofinanciamento com a própria poupança.
                </>
              )}
            </p>

            {/* Above-the-fold High-Intent Purchase CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 sm:mb-6">
              <a
                href="#formulario"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-[0.98] shadow-xl shadow-blue-600/30 transition-all text-center group cursor-pointer"
              >
                <span>Quero Instalar os Meus Painéis Este Mês</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0" />
              </a>

              <a
                href="#simulador"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-extrabold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all text-center cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Começar a Poupar na Luz Este Mês</span>
              </a>
            </div>

            {/* Micro-trust & National Guarantees */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-slate-700 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Vistoria e Projeto 100% Grátis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Instaladores Oficiais DGEG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>25 Anos de Garantia Real</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Card with Relatable Home Image */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-slate-900 group">
              <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full">
                <Image
                  src={
                    activeSegment === "residencial"
                      ? "/images/solar-casa-comum.jpg"
                      : "/images/solar-industrial.jpg"
                  }
                  alt={
                    activeSegment === "residencial"
                      ? "Moradia típica portuguesa com painéis solares no telhado"
                      : "Instalação fotovoltaica em cobertura industrial"
                  }
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Tag: Real Portuguese Installation */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-slate-900/80 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Instalação Real em Portugal</span>
              </div>

              {/* Floating Stat Badge: Guarantee */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-emerald-600 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold text-white flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-3 h-3" />
                <span>Garantia 25 Anos</span>
              </div>

              {/* Floating Verified Customer Review Card */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl border border-white/60">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ✓ Apoio Fundo Ambiental Concedido
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-700 italic font-medium leading-snug">
                  {activeSegment === "residencial"
                    ? "«A conta de luz desceu de 190€ para 42€ logo no 1º mês na nossa moradia. Todo o processo com o Fundo Ambiental foi tratado pela equipa.»"
                    : "«Excelente retorno do investimento para a nossa fábrica. Redução drástica dos custos elétricos operacionais diurnos.»"}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 font-semibold">
                  <span className="font-bold text-slate-800">
                    {activeSegment === "residencial" ? "Rui & Maria V. — Sintra" : "Indústria Metalúrgica — Leiria"}
                  </span>
                  <span>Instalação Verificada</span>
                </div>
              </div>
            </div>

            {/* Social proof bar under image */}
            <div className="mt-2.5 flex items-center justify-between gap-3 px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-black text-slate-900">Google Avaliações:</span>
                <span className="text-amber-500 font-black">★ 4.9/5.0</span>
              </div>
              <span className="hidden sm:inline text-slate-500 text-[11px] text-right">Auditado por Entidades Oficiais</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
