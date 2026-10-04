"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Sparkles, Building2, Home, Star, MapPin, Award } from "lucide-react";

export default function HeroSection() {
  const [activeSegment, setActiveSegment] = useState<"residencial" | "empresas">("residencial");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white pt-6 pb-14 lg:pt-12 lg:pb-20">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Audience Segment Switcher Tabs */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSegment("residencial")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSegment === "residencial"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Para Moradias & Casas Familiares</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSegment("empresas")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeSegment === "empresas"
                  ? "bg-white text-blue-700 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Para Empresas & Pavilhões</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copywriting & Urgency & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Urgency Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs sm:text-sm font-semibold mb-4 shadow-sm">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Fundo Ambiental 2026: Verbas Limitadas por Concelho</span>
            </div>

            {/* H1 Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.14] mb-4">
              {activeSegment === "residencial" ? (
                <>
                  Poupe até <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">75% na Fatura da Luz</span> com as Melhores Empresas de Energia Solar em Portugal.
                </>
              ) : (
                <>
                  Corte até <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">70% nos Custos de Energia</span> com os Melhores Instaladores Nacionais.
                </>
              )}
            </h1>

            {/* H2 Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-7">
              {activeSegment === "residencial" ? (
                <>
                  Comparamos gratuitamente os <strong>instaladores certificados DGEG mais bem avaliados</strong> da sua região. Garantimos o melhor preço, candidatura aprovada aos apoios do Estado a fundo perdido e instalação em 30 dias na sua moradia.
                </>
              ) : (
                <>
                  Estudo de viabilidade técnica e financeira por engenheiros seniores. Redução direta de custos de exploração, dedução integral em IRC e financiamento 100% pago pela própria poupança gerada.
                </>
              )}
            </p>

            {/* Above-the-fold High-Intent CTAs */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-6">
              <a
                href="#formulario"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-extrabold text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 active:scale-[0.98] shadow-xl shadow-blue-600/30 transition-all group"
              >
                <span>Garantir Apoio do Estado & Estudo Grátis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#simulador"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Simular Poupança em 60s</span>
              </a>
            </div>

            {/* Micro-trust & National Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Vistoria Técnica 100% Gratuita</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Instaladores Nacionais DGEG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>25 Anos de Garantia Real</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Card with Relatable Home Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-slate-900 group">
              <div className="relative aspect-[4/3] w-full">
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
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Instalação Real em Portugal</span>
              </div>

              {/* Floating Stat Badge: Guarantee */}
              <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Garantia 25 Anos</span>
              </div>

              {/* Floating Verified Customer Review Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    ✓ Apoio do Estado Concedido
                  </span>
                </div>
                <p className="text-xs text-slate-700 italic font-medium leading-snug">
                  {activeSegment === "residencial"
                    ? "«A conta de luz desceu de 190€ para 42€ logo no 1º mês na nossa moradia. Todo o processo com o Fundo Ambiental foi tratado pela equipa.»"
                    : "«Excelente retorno do investimento para a nossa fábrica. Redução drástica dos custos elétricos operacionais diurnos.»"}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800">
                    {activeSegment === "residencial" ? "Rui & Maria V. — Sintra" : "Indústria Metalúrgica — Leiria"}
                  </span>
                  <span>Instalado há 4 meses</span>
                </div>
              </div>
            </div>

            {/* Social proof bar under image */}
            <div className="mt-3 flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900">Google Avaliações:</span>
                <span className="text-amber-500 font-bold">★ 4.9/5.0</span>
              </div>
              <span className="text-slate-500 text-[11px]">Auditado por Entidades Oficiais</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
