"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  Calendar,
  Euro,
  Building2,
  Home,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  LogOut,
  RefreshCw,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  propertyType: "residencial" | "comercial" | "industrial";
  monthlyBill: string;
  plannedBudget?: string;
  timeline?: string;
  location?: string;
  status: "nova" | "contactada" | "fechada";
  notes?: string;
  estimatedSavingsAnnual?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  novas: number;
  contactadas: number;
  fechadas: number;
}

export default function CrmPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // CRM State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, novas: 0, contactadas: 0, fechadas: 0 });
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLeadNotes, setActiveLeadNotes] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Check initial session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/crm/auth");
      if (res.ok) {
        setIsAuthenticated(true);
        loadLeads("todas", "");
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/crm/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }

      setIsAuthenticated(true);
      loadLeads("todas", "");
    } catch (err: any) {
      setLoginError(err.message || "Erro no início de sessão");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/crm/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setUsernameInput("");
    setPasswordInput("");
  };

  const loadLeads = async (status = statusFilter, search = searchQuery) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "todas") params.append("status", status);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);

        // Prepopulate notes state
        const notesMap: { [id: string]: string } = {};
        (data.leads || []).forEach((lead: Lead) => {
          notesMap[lead.id] = lead.notes || "";
        });
        setActiveLeadNotes(notesMap);
      }
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "nova" | "contactada" | "fechada") => {
    try {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        // Refresh stats
        setStats((prev) => {
          const old = leads.find((l) => l.id === id);
          if (!old) return prev;
          const oldStatus = old.status;
          return {
            ...prev,
            [oldStatus === "nova" ? "novas" : oldStatus]: Math.max(0, (prev as any)[oldStatus === "nova" ? "novas" : oldStatus] - 1),
            [newStatus === "nova" ? "novas" : newStatus]: (prev as any)[newStatus === "nova" ? "novas" : newStatus] + 1,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setSavingNoteId(id);
    try {
      const lead = leads.find((l) => l.id === id);
      if (!lead) return;

      await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: lead.status,
          notes: activeLeadNotes[id] || "",
        }),
      });
    } catch (err) {
      console.error("Erro ao guardar notas:", err);
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar esta lead?")) return;

    try {
      const res = await fetch(`/api/crm/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        loadLeads();
      }
    } catch (err) {
      console.error("Erro ao eliminar lead:", err);
    }
  };

  // If checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>A carregar painel comercial...</span>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Solaris <span className="text-blue-500">CRM</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Plataforma Comercial • Tecnergy Soluções Energéticas
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neon PostgreSQL Ativo</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Utilizador
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: tecnergy"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoggingIn ? "A autenticar..." : "Entrar no CRM"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            Acesso reservado à equipa comercial e técnica.
          </div>
        </div>
      </div>
    );
  }

  // Authenticated CRM Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* CRM Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight">
                Solaris <span className="text-blue-500">CRM</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Neon DB Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Tecnergy Gestão Comercial</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <span>Ver Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => loadLeads()}
            title="Atualizar dados"
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminar Sessão</span>
          </button>
        </div>
      </header>

      {/* Main CRM Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Pipeline Statistics KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setStatusFilter("todas");
              loadLeads("todas", searchQuery);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "todas"
                ? "bg-slate-900 border-blue-500 ring-1 ring-blue-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{stats.total}</div>
            <div className="text-[11px] text-slate-500 mt-1">Todas as candidaturas</div>
          </div>

          <div
            onClick={() => {
              setStatusFilter("nova");
              loadLeads("nova", searchQuery);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "nova"
                ? "bg-slate-900 border-amber-500 ring-1 ring-amber-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Leads Novas</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">{stats.novas}</div>
            <div className="text-[11px] text-slate-400 mt-1">Por contactar comercialmente</div>
          </div>

          <div
            onClick={() => {
              setStatusFilter("contactada");
              loadLeads("contactada", searchQuery);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "contactada"
                ? "bg-slate-900 border-sky-500 ring-1 ring-sky-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Contactadas</span>
              <Phone className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-sky-400 font-mono">{stats.contactadas}</div>
            <div className="text-[11px] text-slate-400 mt-1">Em negociação / vistoria agendada</div>
          </div>

          <div
            onClick={() => {
              setStatusFilter("fechada");
              loadLeads("fechada", searchQuery);
            }}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === "fechada"
                ? "bg-slate-900 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Fechadas / Vendas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">{stats.fechadas}</div>
            <div className="text-[11px] text-slate-400 mt-1">Projetos adjudicados</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => {
                setStatusFilter("todas");
                loadLeads("todas", searchQuery);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "todas" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => {
                setStatusFilter("nova");
                loadLeads("nova", searchQuery);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "nova" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              📥 Novas ({stats.novas})
            </button>
            <button
              onClick={() => {
                setStatusFilter("contactada");
                loadLeads("contactada", searchQuery);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "contactada" ? "bg-sky-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              📞 Contactadas ({stats.contactadas})
            </button>
            <button
              onClick={() => {
                setStatusFilter("fechada");
                loadLeads("fechada", searchQuery);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "fechada" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              🏆 Fechadas ({stats.fechadas})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telemóvel, concelho..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadLeads(statusFilter, e.target.value);
              }}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Leads List / Cards */}
        {leads.length === 0 ? (
          <div className="bg-slate-900/60 rounded-3xl p-12 border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Nenhuma lead encontrada</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {statusFilter !== "todas"
                ? `Não existem leads com o estado "${statusFilter}". Selecione outra aba ou altere a pesquisa.`
                : "Ainda não foram submetidas leads ou não correspondem ao filtro atual."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const statusConfig = {
                nova: {
                  badge: "Nova Lead",
                  bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
                  dot: "bg-amber-400",
                },
                contactada: {
                  badge: "Contactada",
                  bg: "bg-sky-500/10 border-sky-500/30 text-sky-400",
                  dot: "bg-sky-400",
                },
                fechada: {
                  badge: "Venda Fechada",
                  bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                  dot: "bg-emerald-400",
                },
              }[lead.status || "nova"];

              return (
                <div
                  key={lead.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 hover:border-slate-700 transition-all shadow-lg space-y-4"
                >
                  {/* Lead Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                        {lead.propertyType === "comercial" ? (
                          <Building2 className="w-5 h-5 text-sky-400" />
                        ) : (
                          <Home className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-white">{lead.name}</h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                            {statusConfig.badge}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{lead.propertyType}</span>
                          {lead.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500" />
                                {lead.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Call Button & Date */}
                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Ligar ({lead.phone})</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Eliminar lead"
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Qualification Data Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Fatura Atual</span>
                      <span className="font-extrabold text-white text-sm">{lead.monthlyBill || "N/D"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Orçamento Previsto</span>
                      <span className="font-extrabold text-blue-400 text-sm">
                        {lead.plannedBudget || "3.500€ a 6.000€"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Prazo Instalação</span>
                      <span className="font-semibold text-slate-300">{lead.timeline || "Imediato"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Recebido Em</span>
                      <span className="text-slate-400 text-[11px]">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleString("pt-PT") : "Hoje"}
                      </span>
                    </div>
                  </div>

                  {/* Pipeline Action & Commercial Notes */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1">
                    {/* Pipeline Status Buttons */}
                    <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 mr-1">Mudar Estado:</span>
                      <button
                        onClick={() => handleStatusChange(lead.id, "nova")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          lead.status === "nova"
                            ? "bg-amber-500 text-slate-950 shadow"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        📥 Nova
                      </button>
                      <button
                        onClick={() => handleStatusChange(lead.id, "contactada")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          lead.status === "contactada"
                            ? "bg-sky-500 text-slate-950 shadow"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        📞 Contactada
                      </button>
                      <button
                        onClick={() => handleStatusChange(lead.id, "fechada")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          lead.status === "fechada"
                            ? "bg-emerald-500 text-slate-950 shadow"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        🏆 Fechada
                      </button>
                    </div>

                    {/* Commercial Notes Input */}
                    <div className="lg:col-span-7 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Adicionar notas comerciais (ex: Vistoria marcada para sábado às 10h)..."
                        value={activeLeadNotes[lead.id] || ""}
                        onChange={(e) =>
                          setActiveLeadNotes({ ...activeLeadNotes, [lead.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveNotes(lead.id);
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => handleSaveNotes(lead.id)}
                        disabled={savingNoteId === lead.id}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {savingNoteId === lead.id ? "A guardar..." : "Guardar Nota"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
