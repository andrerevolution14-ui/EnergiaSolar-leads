"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "Como funcionam os Apoios do Estado e o Fundo Ambiental em 2026?",
      answer:
        "Os proprietários de moradias e edifícios em Portugal têm acesso a comparticipações estatais a fundo perdido para a instalação de painéis solares fotovoltaicos. As verbas são limitadas por dotação trimestral e atribuídas por ordem de candidatura. A nossa equipa valida a sua elegibilidade e trata de toda a submissão documental para garantir que não perde o subsídio.",
    },
    {
      question: "Como são selecionadas as melhores empresas instaladoras a nível nacional?",
      answer:
        "Trabalhamos exclusivamente com instaladores devidamente credenciados na Direção-Geral de Energia e Geologia (DGEG) e E-Redes, com um índice de satisfação comprovado superior a 4.8★. Ao solicitar o seu estudo, comparamos as 3 empresas de excelência com melhor capacidade técnica na sua área geográfica para lhe assegurar o preço mais vantajoso com a máxima segurança.",
    },
    {
      question: "A instalação no telhado pode causar infiltrações ou danificar as telhas?",
      answer:
        "Não. As equipas utilizam suportes estruturais específicos para telha cerâmica portuguesa que encaixam diretamente na estrutura sem partir nem furar telhas críticas. Todos os pontos de fixação recebem calafetagem e isolamento estanque com garantia civil de obra, mantendo o seu telhado 100% impermeável e seguro contra intempéries.",
    },
    {
      question: "Quanto tempo demora todo o processo e quando começo a ver poupança?",
      answer:
        "Começa a poupar no exato minuto em que os painéis são ligados! A montagem física no telhado da sua moradia demora normalmente apenas 1 dia. O compromisso da nossa rede nacional é de entrega chave-na-mão até 30 dias após a adjudicação, incluindo a ligação e parametrização da aplicação no seu telemóvel.",
    },
    {
      question: "Que garantias reais tenho nos equipamentos e na produção de energia?",
      answer:
        "Trabalhamos exclusivamente com marcas Tier-1 com garantia de produção linear de 25 anos (garantindo que os painéis continuam a produzir com alta eficiência após duas décadas e meia) e garantia de fabricante no inversor. Tem total segurança no seu investimento.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Respostas Claras para Decidir com Confiança
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Tudo o que precisa de saber sobre apoios estatais, prazos, instalação e retorno do investimento.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? "rotate-180 bg-blue-50 text-blue-600" : "text-slate-500"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-blue-50/80 rounded-3xl p-8 border border-blue-100">
          <p className="text-slate-900 font-extrabold text-base sm:text-lg mb-2">
            Ainda tem dúvidas sobre a orientação do seu telhado ou os apoios disponíveis?
          </p>
          <p className="text-slate-600 text-xs sm:text-sm mb-5">
            Os nossos engenheiros analisam a sua moradia por satélite e esclarecem tudo sem qualquer compromisso.
          </p>
          <a
            href="#formulario"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>Quero Instalar Painéis na Minha Moradia Este Mês</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  );
}
