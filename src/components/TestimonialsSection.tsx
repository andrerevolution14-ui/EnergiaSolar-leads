"use client";

import React from "react";
import { Star, Quote, CheckCircle, ShieldCheck, ArrowRight, MapPin } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Carlos & Ana Mendes",
      role: "Moradia Unifamiliar",
      location: "Cascais / Sintra",
      rating: 5,
      billBefore: "195€/mês",
      billAfter: "42€/mês",
      annualSavings: "1.836€/ano",
      quote:
        "Fiquei surpreendido com a rapidez e seriedade. Trataram de tudo com a DGEG e a submissão ao Fundo Ambiental foi aprovada sem atrasos. A instalação demorou apenas 1 dia e na primeira fatura poupámos logo mais de 150€!",
      verified: "Instalação Certificada DGEG",
    },
    {
      name: "Eng.º Marco Silva",
      role: "Diretor Fabril (PME)",
      location: "Zona Industrial de Leiria",
      rating: 5,
      billBefore: "2.350€/mês",
      billAfter: "710€/mês",
      annualSavings: "19.680€/ano",
      quote:
        "Para a nossa empresa a decisão foi matemática: com a volatilidade do mercado elétrico e a dedução fiscal em IRC, o investimento amortiza-se em cerca de 3 anos. O apoio técnico dos engenheiros credenciados foi irrepreensível.",
      verified: "Instalação Comercial 50kW",
    },
    {
      name: "Manuel & Teresa Ribeiro",
      role: "Casa de Família",
      location: "Vila Nova de Famalicão / Braga",
      rating: 5,
      billBefore: "240€/mês",
      billAfter: "38€/mês",
      annualSavings: "2.424€/ano",
      quote:
        "Queríamos autonomia total para não ficarmos reféns das subidas da luz. A aplicação no telemóvel é espetacular: vejo ao minuto quanto estamos a poupar. Recomendo a 100%!",
      verified: "Instalação Residencial + Apoios",
    },
    {
      name: "Dra. Filipa Vasconcelos",
      role: "Moradia Geminada",
      location: "Coimbra",
      rating: 5,
      billBefore: "165€/mês",
      billAfter: "34€/mês",
      annualSavings: "1.572€/ano",
      quote:
        "O receio que tinha era com as obras no telhado e infiltrações. Os técnicos foram impecáveis, limpos e pontuais. Nem parece que houve obras, só se nota quando chega a conta da luz no final do mês.",
      verified: "Instalação Residencial Concluída",
    },
    {
      name: "Pedro Alentejano",
      role: "Moradia Térrea",
      location: "Faro / Algarve",
      rating: 5,
      billBefore: "210€/mês",
      billAfter: "45€/mês",
      annualSavings: "1.980€/ano",
      quote:
        "Aqui no Algarve com tanto sol era quase um crime continuar a pagar faturas astronómicas por causa do ar condicionado no verão. Foi a melhor decisão financeira que tomei nos últimos anos.",
      verified: "Apoios do Estado Recebidos",
    },
    {
      name: "Joaquim & Laura Esteves",
      role: "Habitação Própria",
      location: "Azeitão / Setúbal",
      rating: 5,
      billBefore: "185€/mês",
      billAfter: "40€/mês",
      annualSavings: "1.740€/ano",
      quote:
        "Recebemos 3 propostas de empresas certificadas da nossa zona e escolhemos a mais vantajosa. Em menos de um mês estava tudo montado e certificado pela E-Redes.",
      verified: "Instalação Certificada DGEG",
    },
  ];

  return (
    <section id="testemunhos" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Avaliações Reais & Verificadas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-4">
            Mais de 1.400 Famílias e PMEs a Poupar em Portugal
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Veja a experiência real de proprietários que já instalaram painéis solares através das melhores empresas certificadas do país.
          </p>
        </div>

        {/* 6 Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 rounded-3xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">Verificado</span>
                </div>

                {/* Savings Pill */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 font-bold line-through">
                    {item.billBefore}
                  </span>
                  <span className="text-slate-400 font-bold">&rarr;</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black">
                    {item.billAfter}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 ml-auto">
                    (Poupança: {item.annualSavings})
                  </span>
                </div>

                {/* Testimonial Quote */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{item.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{item.location}</span>
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"
                  title={item.verified}
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* National Stats Strip */}
        <div className="mt-14 max-w-4xl mx-auto p-6 bg-slate-50 rounded-3xl border border-slate-200/80 flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-slate-950">4.9 / 5.0</div>
            <div className="text-xs text-slate-500 font-medium">Classificação Média Google</div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200" />
          <div>
            <div className="text-3xl font-black text-blue-600">100%</div>
            <div className="text-xs text-slate-500 font-medium">Registado na DGEG & E-Redes</div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200" />
          <div>
            <div className="text-3xl font-black text-slate-950">30 Dias</div>
            <div className="text-xs text-slate-500 font-medium">Prazo Médio de Instalação</div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-200" />
          <div>
            <div className="text-3xl font-black text-emerald-600">25 Anos</div>
            <div className="text-xs text-slate-500 font-medium">Garantia Linear de Rendimento</div>
          </div>
        </div>

        {/* CTA to lead form */}
        <div className="mt-10 text-center">
          <a
            href="#formulario"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Simular Minha Poupança com as Melhores Empresas &rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
