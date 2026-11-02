"use client";

import React from "react";
import { Sun, ArrowRight, ShieldCheck, Star } from "lucide-react";

export default function Navbar() {
  return (
    <header className="relative z-40 bg-white border-b border-slate-200/80 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          {/* Logo & National Accreditation */}
          <a href="#" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Sun className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-2xl font-black tracking-tight text-slate-950 leading-none">
                  Solaris<span className="text-blue-600">.</span>
                </span>
                <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-blue-100 text-blue-700 tracking-wide">
                  PT
                </span>
              </div>
              <span className="text-[9px] sm:text-[11px] font-semibold text-slate-500 tracking-wide mt-0.5 hidden xs:inline sm:inline">
                Melhores Empresas a Nível Nacional
              </span>
            </div>
          </a>

          {/* Center Trust Proof (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instaladores Oficiais Certificados DGEG</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/80">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-bold text-slate-900">4.9/5</span>
              <span className="text-slate-500">(+1.400 Clientes)</span>
            </div>
          </div>

          {/* Right Action Button - Buyer Intent */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="#formulario"
              className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm font-black text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 px-2 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span>Ver se compensa</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 hidden sm:inline" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
