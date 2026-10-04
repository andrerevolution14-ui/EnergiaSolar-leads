"use client";

import React from "react";
import Image from "next/image";
import { Check, Star, ArrowRight, ShieldCheck, Zap, Award, Sparkles, Building2, Home } from "lucide-react";

export default function PackagesSection() {
  const solutions = [
    {
      name: "Solução Habitação Familiar",
      target: "Para Moradias & Casas Tradicionais",
      highlight: false,
      idealFor: "Faturas mensais entre 70€ e 200€",
      estimatedSavings: "Até 75% de Poupança Imediata",
      benefits: [
        "Dimensionamento 3D por satélite adaptado ao seu consumo familiar",
        "Redução imediata na fatura a partir do primeiro mês",
        "Comparativo de propostas das 3 melhores empresas locais",
        "Candidatura e submissão aos apoios do Estado a fundo perdido",
        "Instalação chave-na-mão sem obras invasivas (concluída em 1 dia)",
        "Garantia linear de 25 anos de produção energética",
      ],
      badge: "Mais Popular para Famílias",
      cta: "Instalar na Minha Moradia Este Mês",
    },
    {
      name: "Solução Autonomia & Máxima Eficiência",
      target: "Para Independência Energética Diurna e Noturna",
      highlight: true,
      idealFor: "Faturas mensais superiores a 150€",
      estimatedSavings: "Até 85% de Independência da Rede",
      benefits: [
        "Aproveitamento contínuo de energia 24 horas por dia",
        "Proteção inteligente contra quebras de rede e apagões",
        "Candidatura à comparticipação máxima do Fundo Ambiental",
        "Instalação por equipas seniores de engenharia credenciadas DGEG",
        "Aplicação no telemóvel com gestão inteligente de fluxos em tempo real",
        "Garantia total de 25 anos + Assistência e monitorização prioritária",
      ],
      badge: "Maior Apoio do Estado em 2026",
      cta: "Instalar com Apoio do Estado Este Mês",
    },
    {
      name: "Solução Empresas & Negócios",
      target: "Para PMEs, Unidades Fabris, Hotéis e Armazéns",
      highlight: false,
      idealFor: "Custos de energia acima de 500€/mês",
      estimatedSavings: "ROI Amortizado em 3 a 4 Anos",
      benefits: [
        "Estudo de viabilidade económica e engenharia de carga diurna",
        "Dedução fiscal integral de custos e benefícios em sede de IRC",
        "Soluções de autofinanciamento (a poupança paga a instalação)",
        "Engenheiro responsável pelo licenciamento na DGEG e E-Redes",
        "Venda automática do excedente energético à rede",
        "Relatório técnico de sustentabilidade e descarbonização ESG",
      ],
      badge: "Rentabilidade Máxima de Capital",
      cta: "Avançar com Instalação na Minha Empresa",
    },
  ];

  const handleSelectSolution = (solutionName: string) => {
    const formElement = document.getElementById("formulario");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="solucoes" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Rede Nacional de Excelência</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Projetos à Medida com as Melhores Empresas de Portugal
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Não vendemos pacotes fechados nem soluções genéricas de prateleira. O seu imóvel recebe uma proposta técnica sob medida, dimensionada pelos melhores instaladores certificados a nível nacional.
          </p>
        </div>

        {/* 3 Solutions Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          {solutions.map((item, idx) => {
            return (
              <div
                key={idx}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  item.highlight
                    ? "bg-slate-900 text-white shadow-2xl ring-2 ring-blue-500 lg:-translate-y-2"
                    : "bg-white text-slate-950 border border-slate-200/90 shadow-md hover:shadow-xl"
                }`}
              >
                {/* Popular Pill */}
                {item.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-extrabold py-1 px-4 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{item.badge}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className={`text-xl font-extrabold ${item.highlight ? "text-white" : "text-slate-950"}`}>
                      {item.name}
                    </h3>
                    {!item.highlight && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mb-6 ${item.highlight ? "text-slate-300" : "text-slate-500"}`}>
                    {item.target}
                  </p>

                  {/* Highlighted box with savings */}
                  <div
                    className={`p-4 rounded-2xl mb-6 ${
                      item.highlight ? "bg-slate-800/90 border border-slate-700" : "bg-blue-50/80 border border-blue-100"
                    }`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${item.highlight ? "text-blue-400" : "text-blue-700"}`}>
                      Expectativa de Poupança:
                    </div>
                    <div className={`text-xl font-black ${item.highlight ? "text-emerald-400" : "text-slate-900"}`}>
                      {item.estimatedSavings}
                    </div>
                    <div className={`text-xs mt-1 ${item.highlight ? "text-slate-300" : "text-slate-600"}`}>
                      Recomendado para: <strong>{item.idealFor}</strong>
                    </div>
                  </div>

                  {/* Value Benefits Checklist */}
                  <div className="space-y-3 mb-8">
                    <div className={`text-xs font-bold uppercase tracking-wider ${item.highlight ? "text-slate-400" : "text-slate-500"}`}>
                      O que está incluído no projeto:
                    </div>
                    {item.benefits.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            item.highlight ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                        <span className={item.highlight ? "text-slate-200" : "text-slate-700"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <button
                  type="button"
                  onClick={() => handleSelectSolution(item.name)}
                  className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    item.highlight
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
                      : "bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:scale-[1.01]"
                  }`}
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Real Relatable Street Image with Local Trust Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900">
            <Image
              src="/images/solar-moradia-geminada.jpg"
              alt="Bairro residencial português com moradias geminadas equipadas com energia solar"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
              <span className="font-bold">Bairros e Moradias Familiares em Portugal</span>
              <p className="text-[11px] text-slate-300">Instalações em conformidade estética e técnica</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantia de Não-Interferência na Estética ou Estrutura</span>
            </div>

            <h3 className="text-2xl font-black text-slate-950">
              A sua casa continua impecável — com a fatura muito mais leve.
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Trabalhamos apenas com instaladores que utilizam fixações de alta segurança que não perfuram telhas críticas e mantêm a impermeabilidade absoluta do seu telhado. Mais de 1.400 telhados portugueses protegidos e a gerar poupança diária.
            </p>

            <div className="pt-2">
              <a
                href="#formulario"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-700"
              >
                <span>Verificar se o meu telhado é elegível para instalação rápida &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
