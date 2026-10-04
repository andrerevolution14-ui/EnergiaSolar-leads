"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Calculator, ArrowRight, Sparkles, TrendingUp, Leaf, Euro, Check, Star } from "lucide-react";

export default function SavingsCalculator() {
  const [profile, setProfile] = useState<"residencial" | "empresas">("residencial");
  const [monthlyBill, setMonthlyBill] = useState<number>(150);

  // Calculation parameters
  const savingsRate = profile === "residencial" ? 0.68 : 0.72;
  const monthlySavings = Math.round(monthlyBill * savingsRate);
  const annualSavings = monthlySavings * 12;
  const twentyFiveYearSavings = annualSavings * 25;
  const co2TonsAnnual = ((annualSavings * 2.2) / 1000).toFixed(1);

  const presets =
    profile === "residencial"
      ? [80, 120, 160, 220, 300]
      : [350, 600, 1000, 1800, 3000];

  const handleApplyPreset = (value: number) => {
    setMonthlyBill(value);
  };

  const scrollToFormWithPreset = () => {
    const billSelector = document.getElementById("fatura-select") as HTMLSelectElement | null;
    if (billSelector) {
      if (monthlyBill < 100) billSelector.value = "Até 100€";
      else if (monthlyBill <= 250) billSelector.value = "100€ - 250€";
      else if (monthlyBill <= 500) billSelector.value = "250€ - 500€";
      else billSelector.value = "Mais de 500€";
    }

    const formElement = document.getElementById("formulario");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="simulador" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Simulador de Poupança Real
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Quanto Dinheiro Fica no Seu Bolso Todos os Meses?
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Ajuste o valor da sua fatura mensal atual e veja o cálculo de rentabilidade para a sua habitação ou empresa com base na média solar de Portugal.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Interactive Calculator Box */}
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl text-white border border-blue-800/40 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Profile Switcher */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 bg-slate-800/80 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setProfile("residencial");
                      setMonthlyBill(160);
                    }}
                    className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      profile === "residencial"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    🏠 Habitação Familiar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfile("empresas");
                      setMonthlyBill(800);
                    }}
                    className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                      profile === "empresas"
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    🏢 Empresa / Pavilhão
                  </button>
                </div>
              </div>

              {/* Slider & Presets */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Valor médio da sua fatura de eletricidade:
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">
                      {monthlyBill}€
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      / mês
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min={profile === "residencial" ? 50 : 200}
                    max={profile === "residencial" ? 400 : 4000}
                    step={profile === "residencial" ? 10 : 50}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Valores rápidos:</span>
                  {presets.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleApplyPreset(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        monthlyBill === val
                          ? "bg-blue-600 text-white border-blue-400 shadow-md"
                          : "bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {val}€
                    </button>
                  ))}
                </div>
              </div>

              {/* Savings Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 mb-6">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-slate-400 text-xs block mb-1">Poupança Mensal</span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    ~{monthlySavings}€
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">menos na conta/mês</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-slate-400 text-xs block mb-1">Poupança Anual</span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    ~{annualSavings}€
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">por cada ano</span>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
                  <span className="text-slate-400 text-xs block mb-1">Total em 25 Anos</span>
                  <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
                    {twentyFiveYearSavings.toLocaleString("pt-PT")}€
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1">garantia de rendimento</span>
                </div>
              </div>
            </div>

            {/* CTA inside calculator */}
            <div>
              <button
                type="button"
                onClick={scrollToFormWithPreset}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-extrabold text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Verificar Apoios Disponíveis para Poupar Este Valor</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulação 100% gratuita • Sem qualquer fidelização</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Case Study & Homeowner Experience */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50 rounded-3xl border border-slate-200/90 overflow-hidden shadow-md">
            <div className="relative aspect-[4/3] w-full bg-slate-900">
              <Image
                src="/images/solar-homem-app.jpg"
                alt="Proprietário português a verificar a poupança gerada no telemóvel junto ao inversor solar da sua habitação"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-white font-bold ml-1">5.0</span>
                </div>
                <div className="font-bold text-sm">António G. — Coimbra</div>
                <div className="text-[11px] text-slate-300">Moradia unifamiliar</div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <blockquote className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-4">
                &ldquo;Fiz a simulação com uma conta de 170€/mês. Três semanas depois os painéis estavam ligados. Hoje pago cerca de 35€ e controlo tudo pelo telemóvel. Foi o melhor investimento que fizemos cá em casa.&rdquo;
              </blockquote>

              <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Poupança Real Comprovada:</span>
                  <span className="font-extrabold text-emerald-600">~1.620€ / ano</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Apoio do Fundo Ambiental:</span>
                  <span className="font-bold text-blue-600">Comparticipado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
