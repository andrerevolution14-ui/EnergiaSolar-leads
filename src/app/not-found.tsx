import Link from "next/link";
import { ArrowLeft, Home, Sun } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
          <Sun className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-black text-amber-400 font-mono">
            Erro 404 • Página Não Encontrada
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Esta página não existe
          </h1>
          <p className="text-sm text-slate-400">
            O endereço que tentou aceder pode ter sido movido, alterado ou não existir.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Voltar à Página Principal</span>
          </Link>
          <Link
            href="/crm"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold px-5 py-3 rounded-xl transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Aceder ao CRM</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
