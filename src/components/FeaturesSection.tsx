"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, ShieldCheck, ArrowRight, Award, FileCheck, Zap, Sparkles } from "lucide-react";

export default function FeaturesSection() {
  const offerItems = [
    {
      badge: "Avaliação Gratuita (Valor 150€)",
      title: "1. Auditoria Solar 3D do Seu Telhado",
      description:
        "Através de satélite e software de engenharia, calculamos a inclinação solar exata, horas de radiação e número ideal de painéis para zerar até 75% da sua fatura.",
      highlight: "Sem custos nem deslocações prévias",
    },
    {
      badge: "Rede Oficial DGEG",
      title: "2. Seleção das Melhores Empresas Nacionais",
      description:
        "Não arrisque com curiosos. Cruzamos as 3 empresas instaladoras certificadas com melhor reputação e histórico comprovado no seu concelho para obter o preço mais competitivo.",
      highlight: "Apenas instaladores auditados e certificados",
    },
    {
      badge: "Apoios a Fundo Perdido",
      title: "3. Candidatura aos Apoios do Estado Tratada por Nós",
      description:
        "Tratamos de todo o processo burocrático de licenciamento na DGEG, E-Redes e submissão aos incentivos do Fundo Ambiental. Zero burocracia ou dores de cabeça para si.",
      highlight: "Acompanhamento até à aprovação da verba",
    },
    {
      badge: "Segurança Absoluta",
      title: "4. Instalação Chave-na-Mão com Garantia de 25 Anos",
      description:
        "Instalação rápida e limpa em menos de 1 dia na sua moradia. Equipamentos com garantia de produção linear de 25 anos e suporte de engenharia contínuo.",
      highlight: "Compromisso de instalação até 30 dias",
    },
  ];

  return (
    <section id="vantagens" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Oferta Solaris Chave-na-Mão</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Tudo o que está incluído no seu Estudo Gratuito
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            A forma mais transparente, segura e vantajosa de instalar energia solar em Portugal. Nós tratamos de tudo para que a sua única preocupação seja ver a fatura descer.
          </p>
        </div>

        {/* Visual Showcase: 2 Images with Value Points */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-center">
          {/* Real Photo 1: Technician installing on Portuguese clay tiles */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group aspect-[16/10]">
            <Image
              src="/images/solar-telhado-montagem.jpg"
              alt="Técnico qualificado a fixar estrutura de painéis solares em telhado de telha cerâmica tradicional portuguesa"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-[11px] font-bold uppercase tracking-wider mb-2">
                Engenharia de Precisão
              </span>
              <h3 className="text-lg font-bold">Fixação em Telha Tradicional sem Danos nem Infiltrações</h3>
              <p className="text-xs text-slate-300 mt-1">
                Estruturas de alumínio anodizado e vedação com garantia estanque de impermeabilização.
              </p>
            </div>
          </div>

          {/* Real Photo 2: Certified engineer mounting panel */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group aspect-[16/10]">
            <Image
              src="/images/solar-engenheiro-montagem.jpg"
              alt="Engenheiro credenciado a instalar painéis fotovoltaicos em habitação portuguesa"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-[11px] font-bold uppercase tracking-wider mb-2">
                Instaladores Certificados
              </span>
              <h3 className="text-lg font-bold">Apenas as Melhores Empresas a Nível Nacional</h3>
              <p className="text-xs text-slate-300 mt-1">
                Técnicos registados na DGEG com seguro de responsabilidade civil e mais de 10 anos de experiência.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold mb-4 border border-blue-100">
                  {item.badge}
                </span>

                <h3 className="text-lg font-extrabold text-slate-950 mb-3 leading-snug">
                  {item.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item.highlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner to funnel directly to form */}
        <div className="mt-14 bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Pronto para saber quanto o seu telhado pode gerar?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Preencha 3 dados rápidos e receba a simulação detalhada sem qualquer compromisso.
            </p>
          </div>
          <a
            href="#formulario"
            className="shrink-0 px-8 py-4 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Pedir Estudo Gratuito em 60s</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </a>
        </div>
      </div>
    </section>
  );
}
