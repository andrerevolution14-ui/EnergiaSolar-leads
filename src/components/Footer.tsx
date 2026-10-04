"use client";

import React from "react";
import { Sun, ShieldCheck, Mail, MapPin, Award, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs py-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Solaris<span className="text-blue-500">.</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma líder em Portugal que conecta proprietários às melhores empresas instaladoras certificadas a nível nacional. Mais poupança, zero burocracias e acesso total aos apoios do Estado.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Instaladores Registados e Certificados na DGEG</span>
            </div>
          </div>

          {/* Core Guarantees */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Garantias & Certificações</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>25 Anos de Garantia Linear de Produção</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Equipamentos Tier-1 Bloomberg</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Instalação Chave-na-Mão até 30 Dias</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Candidatura ao Fundo Ambiental Tratada</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Seguro de Responsabilidade Civil em Obra</span>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Soluções Nacionais</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#formulario" className="hover:text-white transition-colors">
                  Moradias e Casas Familiares
                </a>
              </li>
              <li>
                <a href="#formulario" className="hover:text-white transition-colors">
                  Sistemas com Autonomia & Apoios
                </a>
              </li>
              <li>
                <a href="#formulario" className="hover:text-white transition-colors">
                  PMEs, Armazéns e Indústria
                </a>
              </li>
              <li>
                <a href="#simulador" className="hover:text-white transition-colors">
                  Simulador de Poupança Imediata
                </a>
              </li>
              <li>
                <a href="#testemunhos" className="hover:text-white transition-colors">
                  Casos Reais & Testemunhos
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Lead Action & Coverage */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Cobertura Geográfica</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Rede de instaladores certificados em todos os distritos de Portugal Continental e Ilhas.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contacto@solaris-energia.pt</span>
              </div>
              <div className="pt-2">
                <a
                  href="#formulario"
                  className="inline-block w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center transition-colors shadow-md"
                >
                  Pedir Estudo Gratuito em 60s
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Solaris Portugal — Plataforma Certificada de Energia Solar. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300">
              Proteção de Dados & RGPD
            </span>
            <span className="hover:text-slate-300">
              Termos de Utilização
            </span>
            <a href="/crm" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold">
              <span>Área Comercial (CRM)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
