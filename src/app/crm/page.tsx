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
  GripVertical,
  Moon,
  Sparkles,
  PhoneCall,
  Save,
  MessageSquare,
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

  // CRM State - Mode Day (Light) as Principal
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, novas: 0, contactadas: 0, fechadas: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeLeadNotes, setActiveLeadNotes] = useState<{ [id: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Check initial session
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/crm/auth");
      if (res.ok) {
        setIsAuthenticated(true);
        loadLeads("");
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
      loadLeads("");
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

  const loadLeads = async (search = searchQuery) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
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
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    // Update stats optimistically
    setStats((prev) => {
      const lead = leads.find((l) => l.id === id);
      if (!lead || lead.status === newStatus) return prev;
      const old = lead.status;
      return {
        ...prev,
        [old === "nova" ? "novas" : old]: Math.max(0, (prev as any)[old === "nova" ? "novas" : old] - 1),
        [newStatus === "nova" ? "novas" : newStatus]: (prev as any)[newStatus === "nova" ? "novas" : newStatus] + 1,
      };
    });

    try {
      await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      loadLeads();
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== column) {
      setDragOverColumn(column);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: "nova" | "contactada" | "fechada") => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (id) {
      handleStatusChange(id, targetStatus);
    }
    setDraggedLeadId(null);
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
    if (!confirm("Tem a certeza que deseja eliminar esta lead da base de dados?")) return;

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

  // Loading Session
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">A carregar CRM Solaris...</span>
        </div>
      </div>
    );
  }

  // Login Screen (Day Mode as Principal)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Solaris <span className="text-blue-600">CRM</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Tecnergy Soluções Energéticas • Gestão de Vendas
            </p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Base de Dados Neon Ativa</span>
            </div>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Utilizador
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Ex: tecnergy"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 text-sm focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 text-sm focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isLoggingIn ? "A autenticar..." : "Entrar no Pipeline Comercial"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            Acesso reservado à equipa comercial e gestores de projeto.
          </div>
        </div>
      </div>
    );
  }

  // Filter leads into 3 columns
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      (lead.location && lead.location.toLowerCase().includes(q))
    );
  });

  const columns: {
    status: "nova" | "contactada" | "fechada";
    title: string;
    icon: any;
    count: number;
    colorClasses: {
      headerBg: string;
      headerBorder: string;
      headerText: string;
      badge: string;
      dropHighlight: string;
    };
  }[] = [
    {
      status: "nova",
      title: "Leads Novas",
      icon: Clock,
      count: stats.novas,
      colorClasses: {
        headerBg: isDarkMode ? "bg-amber-950/40" : "bg-amber-50",
        headerBorder: isDarkMode ? "border-amber-800/60" : "border-amber-200",
        headerText: isDarkMode ? "text-amber-300" : "text-amber-900",
        badge: isDarkMode ? "bg-amber-900/60 text-amber-300" : "bg-amber-200/80 text-amber-900",
        dropHighlight: isDarkMode ? "border-amber-500 bg-amber-500/10" : "border-amber-500 bg-amber-50/50",
      },
    },
    {
      status: "contactada",
      title: "Contactadas / Em Vistoria",
      icon: Phone,
      count: stats.contactadas,
      colorClasses: {
        headerBg: isDarkMode ? "bg-sky-950/40" : "bg-sky-50",
        headerBorder: isDarkMode ? "border-sky-800/60" : "border-sky-200",
        headerText: isDarkMode ? "text-sky-300" : "text-sky-900",
        badge: isDarkMode ? "bg-sky-900/60 text-sky-300" : "bg-sky-200/80 text-sky-900",
        dropHighlight: isDarkMode ? "border-sky-500 bg-sky-500/10" : "border-sky-500 bg-sky-50/50",
      },
    },
    {
      status: "fechada",
      title: "Vendas Fechadas",
      icon: CheckCircle2,
      count: stats.fechadas,
      colorClasses: {
        headerBg: isDarkMode ? "bg-emerald-950/40" : "bg-emerald-50",
        headerBorder: isDarkMode ? "border-emerald-800/60" : "border-emerald-200",
        headerText: isDarkMode ? "text-emerald-300" : "text-emerald-900",
        badge: isDarkMode ? "bg-emerald-900/60 text-emerald-300" : "bg-emerald-200/80 text-emerald-900",
        dropHighlight: isDarkMode ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-500 bg-emerald-50/50",
      },
    },
  ];

  // Theme variable classes
  const theme = {
    bg: isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900",
    headerBg: isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200/90 shadow-sm",
    cardBg: isDarkMode ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md",
    colBg: isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-200/60 border-slate-200/80",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    subBox: isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200/80",
    inputBg: isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900",
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col font-sans transition-colors duration-200`}>
      {/* CRM Navigation Bar */}
      <header className={`sticky top-0 z-40 ${theme.headerBg} backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl tracking-tight">
                Solaris <span className="text-blue-600">CRM</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                🟢 Neon DB Conectado
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              Pipeline de Arrastar • Tecnergy
            </div>
          </div>
        </div>

        {/* Right Actions: Theme Toggle, Refresh, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Day / Night Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
            }`}
            title="Alternar Modo Dia / Noite"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDarkMode ? "Modo Dia" : "Modo Noite"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadLeads()}
            title="Atualizar dados da base de dados"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                : "bg-white border-slate-300 text-slate-700 hover:text-blue-600 shadow-sm"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminar Sessão</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Control Bar: Search and Quick Instructions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">
              Total no Pipeline:
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white">
              {stats.total} leads
            </span>
            <span className="text-xs text-slate-500 ml-2 hidden md:inline">
              (Arraste os cartões entre as colunas para atualizar o estado)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone, concelho..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadLeads(e.target.value);
              }}
              className={`w-full ${theme.inputBg} rounded-xl py-2 pl-10 pr-4 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors shadow-sm`}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KANBAN DRAG-AND-DROP COLUMNS                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const colLeads = filteredLeads.filter((l) => (l.status || "nova") === col.status);
            const isTarget = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`rounded-3xl border-2 transition-all duration-200 flex flex-col min-h-[620px] p-3 sm:p-4 ${
                  isTarget
                    ? `${col.colorClasses.dropHighlight} border-dashed ring-4 ring-blue-500/20`
                    : `${theme.colBg} border-transparent`
                }`}
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 rounded-2xl border ${col.colorClasses.headerBorder} ${col.colorClasses.headerBg} flex items-center justify-between mb-4 shadow-sm`}
                >
                  <div className="flex items-center gap-2">
                    <col.icon className={`w-4 h-4 ${col.colorClasses.headerText}`} />
                    <h2 className={`font-black text-sm ${col.colorClasses.headerText}`}>
                      {col.title}
                    </h2>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.colorClasses.badge}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Leads Cards Container in Column */}
                <div className="flex-1 space-y-3.5">
                  {colLeads.length === 0 ? (
                    <div className="h-40 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-slate-400">
                      <span className="text-xs font-semibold">Sem leads nesta coluna</span>
                      <span className="text-[10px] mt-1 text-slate-400">
                        Arraste um cartão para aqui
                      </span>
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const isBeingDragged = draggedLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className={`rounded-2xl border p-4 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md ${
                            theme.cardBg
                          } ${isBeingDragged ? "opacity-40 scale-95" : ""}`}
                        >
                          {/* Card Top Row: Grip Handle, Name, Property Type */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 cursor-grab" />
                              <div>
                                <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                                  {lead.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                  {lead.propertyType === "comercial" ? (
                                    <Building2 className="w-3 h-3 text-sky-600" />
                                  ) : (
                                    <Home className="w-3 h-3 text-blue-600" />
                                  )}
                                  <span className="capitalize font-semibold">{lead.propertyType}</span>
                                  {lead.location && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 font-medium">
                                        <MapPin className="w-2.5 h-2.5" />
                                        {lead.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              title="Eliminar lead"
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Quick Call Button with Phone */}
                          <div className="my-2.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Ligar: {lead.phone}</span>
                            </a>
                          </div>

                          {/* Qualification Badges */}
                          <div className={`p-2.5 rounded-xl border ${theme.subBox} grid grid-cols-2 gap-2 text-[10px] mb-3`}>
                            <div>
                              <span className="text-slate-400 block font-semibold">Fatura:</span>
                              <span className="font-extrabold text-slate-800 dark:text-white">
                                {lead.monthlyBill || "N/D"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">Orçamento:</span>
                              <span className="font-black text-blue-600 dark:text-blue-400">
                                {lead.plannedBudget || "3.5k - 6k€"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">Prazo:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {lead.timeline || "Imediato"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">Recebida:</span>
                              <span className="font-medium text-slate-500">
                                {lead.createdAt
                                  ? new Date(lead.createdAt).toLocaleDateString("pt-PT")
                                  : "Hoje"}
                              </span>
                            </div>
                          </div>

                          {/* Commercial Notes Input */}
                          <div className="pt-1">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Nota comercial (ex: Visita técnica sexta)..."
                                value={activeLeadNotes[lead.id] || ""}
                                onChange={(e) =>
                                  setActiveLeadNotes({ ...activeLeadNotes, [lead.id]: e.target.value })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveNotes(lead.id);
                                }}
                                className={`flex-1 ${theme.inputBg} rounded-lg py-1.5 px-2.5 text-[11px] font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors`}
                              />
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                disabled={savingNoteId === lead.id}
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold border border-blue-200 dark:border-slate-700 transition-all cursor-pointer"
                                title="Guardar nota"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Fast Move Buttons (Alternative to Dragging) */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>Mover para:</span>
                            <div className="flex items-center gap-1">
                              {col.status !== "nova" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "nova")}
                                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                                >
                                  Nova
                                </button>
                              )}
                              {col.status !== "contactada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "contactada")}
                                  className="px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200"
                                >
                                  Contactada
                                </button>
                              )}
                              {col.status !== "fechada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "fechada")}
                                  className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                                >
                                  Fechada
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
