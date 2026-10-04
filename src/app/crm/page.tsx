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
  PhoneCall,
  Save,
  MessageSquare,
  DollarSign,
  Briefcase,
  X,
  Sparkles,
  Download,
  MessageCircle,
  Edit3,
  Layers,
  Database,
  Check,
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
  closedValue?: number;
  commissionValue?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Stats {
  total: number;
  novas: number;
  contactadas: number;
  fechadas: number;
  totalVolume?: number;
  totalCommission?: number;
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
  const [stats, setStats] = useState<Stats>({
    total: 0,
    novas: 0,
    contactadas: 0,
    fechadas: 0,
    totalVolume: 0,
    totalCommission: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<"todos" | "residencial" | "comercial">("todos");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Active notes state
  const [activeLeadNotes, setActiveLeadNotes] = useState<{ [id: string]: string }>({});
  const [savedNotesIndicator, setSavedNotesIndicator] = useState<{ [id: string]: boolean }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Close Deal Modal State
  const [closingLead, setClosingLead] = useState<Lead | null>(null);
  const [closingValueInput, setClosingValueInput] = useState("");
  const [closingCommissionInput, setClosingCommissionInput] = useState("");
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

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

        const notesMap: { [id: string]: string } = {};
        (data.leads || []).forEach((lead: Lead) => {
          notesMap[lead.id] = lead.notes || "";
        });
        setActiveLeadNotes(notesMap);
        setLastSyncTime(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (err) {
      console.error("Erro ao carregar leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "nova" | "contactada" | "fechada",
    closedVal?: number,
    commVal?: number
  ) => {
    // If moving to "fechada" without values specified, open modal to input them!
    if (newStatus === "fechada" && closedVal === undefined) {
      const target = leads.find((l) => l.id === id);
      if (target) {
        setClosingLead(target);
        setClosingValueInput(target.closedValue ? target.closedValue.toString() : "5000");
        setClosingCommissionInput(
          target.commissionValue ? target.commissionValue.toString() : "500"
        );
        return;
      }
    }

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: newStatus,
              closedValue: closedVal !== undefined ? closedVal : l.closedValue,
              commissionValue: commVal !== undefined ? commVal : l.commissionValue,
            }
          : l
      )
    );

    try {
      await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          closedValue: closedVal,
          commissionValue: commVal,
        }),
      });
      loadLeads();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      loadLeads();
    }
  };

  const handleConfirmCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingLead) return;

    setIsSubmittingClose(true);
    const numClosed = parseFloat(closingValueInput) || 0;
    const numComm = parseFloat(closingCommissionInput) || 0;

    await handleStatusChange(closingLead.id, "fechada", numClosed, numComm);
    setIsSubmittingClose(false);
    setClosingLead(null);
  };

  // Open modal directly to adjust closed deal value & commission
  const handleOpenEditClosedDeal = (lead: Lead) => {
    setClosingLead(lead);
    setClosingValueInput(lead.closedValue ? lead.closedValue.toString() : "5000");
    setClosingCommissionInput(lead.commissionValue ? lead.commissionValue.toString() : "500");
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
    const noteText = activeLeadNotes[id] ?? "";
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    // Avoid redundant save if nothing changed
    if (lead.notes === noteText && !savedNotesIndicator[id]) {
      return;
    }

    setSavingNoteId(id);
    try {
      await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: lead.status,
          notes: noteText,
        }),
      });

      // Update local state without full reload
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: noteText } : l))
      );

      // Show temporary green checkmark indicator
      setSavedNotesIndicator((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSavedNotesIndicator((prev) => ({ ...prev, [id]: false }));
      }, 3000);
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

  // Auto-calculate commission (10% standard) when typing closed value
  const handleClosedValueChange = (val: string) => {
    setClosingValueInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setClosingCommissionInput(Math.round(parsed * 0.1).toString());
    }
  };

  // Export Leads to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      alert("Não existem leads para exportar.");
      return;
    }

    const headers = [
      "ID",
      "Nome",
      "Telefone",
      "Tipo Imovel",
      "Fatura Mensal",
      "Orcamento",
      "Prazo",
      "Localidade",
      "Estado",
      "Valor Fechado (€)",
      "Comissao (€)",
      "Notas",
      "Data Registo",
    ];

    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone || ""}"`,
      l.propertyType,
      `"${l.monthlyBill || ""}"`,
      `"${l.plannedBudget || ""}"`,
      `"${l.timeline || ""}"`,
      `"${(l.location || "").replace(/"/g, '""')}"`,
      l.status,
      l.closedValue || 0,
      l.commissionValue || 0,
      `"${(l.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      l.createdAt || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `solaris_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // Property type filter
    if (propertyFilter !== "todos" && lead.propertyType !== propertyFilter) {
      return false;
    }
    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      (lead.location && lead.location.toLowerCase().includes(q))
    );
  });

  // Calculate volume per column
  const novasCount = filteredLeads.filter((l) => (l.status || "nova") === "nova").length;
  const contactadasCount = filteredLeads.filter((l) => l.status === "contactada").length;
  const fechadasList = filteredLeads.filter((l) => l.status === "fechada");
  const fechadasVolume = fechadasList.reduce((acc, l) => acc + (l.closedValue || 0), 0);
  const fechadasCommission = fechadasList.reduce((acc, l) => acc + (l.commissionValue || 0), 0);

  const columns: {
    status: "nova" | "contactada" | "fechada";
    title: string;
    icon: any;
    count: number;
    subInfo?: string;
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
      count: novasCount,
      subInfo: "Novas candidaturas",
      colorClasses: {
        headerBg: isDarkMode ? "bg-amber-950/70" : "bg-amber-50/90",
        headerBorder: isDarkMode ? "border-amber-800/80" : "border-amber-300",
        headerText: isDarkMode ? "text-amber-300" : "text-amber-900",
        badge: isDarkMode ? "bg-amber-900/80 text-amber-200 border-amber-700" : "bg-amber-200 text-amber-950 border-amber-300",
        dropHighlight: isDarkMode ? "border-amber-500 bg-amber-500/10" : "border-amber-500 bg-amber-50/70",
      },
    },
    {
      status: "contactada",
      title: "Contactadas / Em Vistoria",
      icon: Phone,
      count: contactadasCount,
      subInfo: "Em qualificação / proposta",
      colorClasses: {
        headerBg: isDarkMode ? "bg-sky-950/70" : "bg-sky-50/90",
        headerBorder: isDarkMode ? "border-sky-800/80" : "border-sky-300",
        headerText: isDarkMode ? "text-sky-300" : "text-sky-950",
        badge: isDarkMode ? "bg-sky-900/80 text-sky-200 border-sky-700" : "bg-sky-200 text-sky-950 border-sky-300",
        dropHighlight: isDarkMode ? "border-sky-500 bg-sky-500/10" : "border-sky-500 bg-sky-50/70",
      },
    },
    {
      status: "fechada",
      title: "Vendas Fechadas",
      icon: CheckCircle2,
      count: fechadasList.length,
      subInfo: fechadasVolume > 0 ? `${fechadasVolume.toLocaleString("pt-PT")}€ em contratos` : "Contratos assinados",
      colorClasses: {
        headerBg: isDarkMode ? "bg-emerald-950/70" : "bg-emerald-50/90",
        headerBorder: isDarkMode ? "border-emerald-800/80" : "border-emerald-300",
        headerText: isDarkMode ? "text-emerald-300" : "text-emerald-950",
        badge: isDarkMode ? "bg-emerald-900/80 text-emerald-200 border-emerald-700" : "bg-emerald-200 text-emerald-950 border-emerald-300",
        dropHighlight: isDarkMode ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-500 bg-emerald-50/70",
      },
    },
  ];

  // Theme variable classes for perfect Light / Dark rendering
  const theme = {
    bg: isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900",
    headerBg: isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white border-slate-200/90 shadow-xs",
    subHeaderBg: isDarkMode ? "bg-slate-900/70 border-slate-800 text-slate-400" : "bg-white/80 border-slate-200/80 text-slate-600",
    kpiCard: isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200/90 shadow-xs text-slate-900",
    kpiLabel: isDarkMode ? "text-slate-400" : "text-slate-600",
    kpiSub: isDarkMode ? "text-slate-400" : "text-slate-600",
    cardBg: isDarkMode
      ? "bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700"
      : "bg-white border-slate-200/90 text-slate-900 hover:border-blue-400 hover:shadow-sm",
    colBg: isDarkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-100/80 border-slate-200/90",
    textHeading: isDarkMode ? "text-white" : "text-slate-950",
    textSub: isDarkMode ? "text-slate-300" : "text-slate-700",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-600",
    subBox: isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200/90",
    inputBg: isDarkMode
      ? "bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-600",
    notesBg: isDarkMode
      ? "bg-slate-950 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-blue-600",
  };

  const totalVolume = stats.totalVolume || 0;
  const totalCommission = stats.totalCommission || 0;
  const conversionRate = stats.total > 0 ? Math.round((stats.fechadas / stats.total) * 100) : 0;
  const averageTicket = stats.fechadas > 0 ? Math.round(totalVolume / stats.fechadas) : 0;

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col font-sans transition-colors duration-150`}>
      {/* Institutional Top Bar: Regulatory & Security Compliance (Non-Noise) */}
      <div className={`border-b px-4 sm:px-8 py-1.5 text-[11px] font-semibold flex flex-wrap items-center justify-between gap-2 ${theme.subHeaderBg}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Plataforma Comercial Certificada • DGEG / DL n.º 15/2022</span>
          </div>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
          <div className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Database className="w-3 h-3 text-emerald-500" />
            <span>Neon PostgreSQL (Frankfurt)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
          {lastSyncTime && (
            <span className="hidden sm:inline">
              Sincronizado às <strong>{lastSyncTime}</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Canal Seguro TLS 1.3
          </span>
        </div>
      </div>

      {/* Main CRM Header */}
      <header className={`sticky top-0 z-40 ${theme.headerBg} backdrop-blur-md border-b px-4 sm:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-black text-lg sm:text-xl tracking-tight ${theme.textHeading}`}>
                Solaris <span className="text-blue-600">CRM</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                PRO v2.6
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Tecnergy Soluções Energéticas • Pipeline de Vendas Solares
            </div>
          </div>
        </div>

        {/* Header Right Action Tools: Export, Day/Night Mode, Refresh, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs"
            }`}
            title="Exportar base de dados para ficheiro CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Exportar CSV</span>
          </button>

          {/* Day / Night Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs"
            }`}
            title="Alternar Modo Dia / Noite"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            <span className="hidden sm:inline">{isDarkMode ? "Modo Dia" : "Modo Noite"}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadLeads()}
            title="Atualizar dados da base de dados Neon"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                : "bg-white border-slate-300 text-slate-700 hover:text-blue-600 shadow-xs"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Executive CRM Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Institutional KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* 1. Total Leads */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${theme.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[11px] font-black uppercase tracking-wider ${theme.kpiLabel}`}>
                Total Leads
              </span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black font-mono ${theme.textHeading}`}>
              {stats.total}
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${theme.kpiSub}`}>
              Total de candidaturas
            </div>
          </div>

          {/* 2. Novas */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${theme.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Leads Novas
              </span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
              {stats.novas}
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${theme.kpiSub}`}>
              A aguardar primeiro contacto
            </div>
          </div>

          {/* 3. Contactadas */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${theme.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Em Vistoria
              </span>
              <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-700 dark:text-sky-400 font-mono">
              {stats.contactadas}
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${theme.kpiSub}`}>
              Qualificação / Vistoria técnica
            </div>
          </div>

          {/* 4. Fechadas / Volume Total */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${theme.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Volume Fechado
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {totalVolume.toLocaleString("pt-PT")}€
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${theme.kpiSub}`}>
              {stats.fechadas} contratos ({conversionRate}% conv.)
            </div>
          </div>

          {/* 5. Comissões Geradas */}
          <div className={`col-span-2 md:col-span-1 p-4 sm:p-5 rounded-2xl border ${theme.kpiCard}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Comissões
              </span>
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono">
              {totalCommission.toLocaleString("pt-PT")}€
            </div>
            <div className={`text-[11px] font-medium mt-0.5 ${theme.kpiSub}`}>
              {averageTicket > 0 ? `Ticket Médio: ${averageTicket.toLocaleString("pt-PT")}€` : "Comissões acumuladas"}
            </div>
          </div>
        </div>

        {/* Institutional Secondary Control Strip: Segment Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          {/* Segment Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/70 dark:border-slate-800 text-xs font-bold w-fit">
            <button
              onClick={() => setPropertyFilter("todos")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                propertyFilter === "todos"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Todas as Leads ({leads.length})
            </button>
            <button
              onClick={() => setPropertyFilter("residencial")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                propertyFilter === "residencial"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Home className="w-3 h-3" />
              <span>Residencial</span>
            </button>
            <button
              onClick={() => setPropertyFilter("comercial")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                propertyFilter === "comercial"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Comercial</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px] sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar cliente, telefone, concelho..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadLeads(e.target.value);
              }}
              className={`w-full ${theme.inputBg} rounded-xl py-2 pl-10 pr-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors shadow-xs`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  loadLeads("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Drag and Drop Instructional Guide */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span>Arraste os cartões entre as colunas ou clique nos botões de mudança rápida para avançar no pipeline.</span>
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
                className={`rounded-3xl border-2 transition-all duration-150 flex flex-col min-h-[640px] p-3 sm:p-4 ${
                  isTarget
                    ? `${col.colorClasses.dropHighlight} border-dashed ring-4 ring-blue-500/20`
                    : `${theme.colBg} border-transparent`
                }`}
              >
                {/* Column Header with Stage Stats */}
                <div
                  className={`p-3.5 rounded-2xl border ${col.colorClasses.headerBorder} ${col.colorClasses.headerBg} flex items-center justify-between mb-4 shadow-xs`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/70 dark:bg-slate-900/60 shadow-xs">
                      <col.icon className={`w-4 h-4 ${col.colorClasses.headerText}`} />
                    </div>
                    <div>
                      <h2 className={`font-black text-sm tracking-tight ${col.colorClasses.headerText}`}>
                        {col.title}
                      </h2>
                      {col.subInfo && (
                        <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                          {col.subInfo}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${col.colorClasses.badge}`}>
                    {colLeads.length}
                  </span>
                </div>

                {/* Leads Cards Container in Column */}
                <div className="flex-1 space-y-3.5">
                  {colLeads.length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-600">
                      <span className="text-xs font-bold">Sem leads nesta fase</span>
                      <span className="text-[10px] mt-1 text-slate-500">
                        Arraste um cartão para esta etapa
                      </span>
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const isBeingDragged = draggedLeadId === lead.id;
                      const hasNotesSaved = savedNotesIndicator[lead.id];
                      const isSavingThisNote = savingNoteId === lead.id;
                      const rawPhone = lead.phone ? lead.phone.replace(/\D/g, "") : "";
                      const formattedPhone = rawPhone.startsWith("351") ? rawPhone : `351${rawPhone}`;

                      return (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          className={`rounded-2xl border p-4 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-xs ${
                            theme.cardBg
                          } ${isBeingDragged ? "opacity-40 scale-95" : ""}`}
                        >
                          {/* Card Top Row: Grip Handle, Name, Location */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 cursor-grab" />
                              <div>
                                <h3 className={`font-black text-sm leading-tight ${theme.textHeading}`}>
                                  {lead.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                  {lead.propertyType === "comercial" ? (
                                    <Building2 className="w-3 h-3 text-sky-600 shrink-0" />
                                  ) : (
                                    <Home className="w-3 h-3 text-blue-600 shrink-0" />
                                  )}
                                  <span className="capitalize">{lead.propertyType}</span>
                                  {lead.location && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5 font-bold truncate max-w-[130px]">
                                        <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
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
                              className="text-slate-400 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 transition-colors p-1 shrink-0 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Action Buttons: Direct Call & WhatsApp */}
                          <div className="my-2.5 grid grid-cols-2 gap-2">
                            <a
                              href={`tel:${lead.phone}`}
                              className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span className="truncate">{lead.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Olá ${lead.name}, contactamos da Tecnergy Solaris relativamente à sua simulação de energia solar.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </div>

                          {/* Qualification Badges */}
                          <div className={`p-2.5 rounded-xl border ${theme.subBox} grid grid-cols-2 gap-2 text-[10px] mb-3`}>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block font-bold">Fatura Atual:</span>
                              <span className={`font-black ${theme.textHeading}`}>
                                {lead.monthlyBill || "N/D"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block font-bold">Orçamento:</span>
                              <span className="font-black text-blue-600 dark:text-blue-400">
                                {lead.plannedBudget || "3.5k - 6k€"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block font-bold">Prazo:</span>
                              <span className={`font-bold ${theme.textSub}`}>
                                {lead.timeline || "Imediato"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400 block font-bold">Data:</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-400">
                                {lead.createdAt
                                  ? new Date(lead.createdAt).toLocaleDateString("pt-PT")
                                  : "Hoje"}
                              </span>
                            </div>
                          </div>

                          {/* If closed, show Deal Value & Commission Badges with Adjustment Option */}
                          {lead.status === "fechada" && (
                            <div className="mb-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/80 text-xs">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 block uppercase tracking-wider">
                                    Valor Fechado
                                  </span>
                                  <span className="font-black text-emerald-950 dark:text-emerald-100 text-base">
                                    {lead.closedValue ? `${lead.closedValue.toLocaleString("pt-PT")}€` : "N/D"}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-300 block uppercase tracking-wider">
                                    Comissão
                                  </span>
                                  <span className="font-black text-indigo-950 dark:text-indigo-100 text-base">
                                    {lead.commissionValue ? `${lead.commissionValue.toLocaleString("pt-PT")}€` : "N/D"}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenEditClosedDeal(lead)}
                                className="w-full py-1 px-2 rounded-lg bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Ajustar Valor / Comissão</span>
                              </button>
                            </div>
                          )}

                          {/* Commercial Notes with Direct Input, Save & Auto-save on Blur */}
                          <div className="pt-1">
                            <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-slate-400" />
                                <span>Notas do Comercial:</span>
                              </span>
                              {hasNotesSaved && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>Guardada</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-start gap-1.5">
                              <textarea
                                rows={2}
                                placeholder="Escreva observações comerciais (ex: Visita agendada para sábado às 10h)..."
                                value={activeLeadNotes[lead.id] ?? ""}
                                onChange={(e) =>
                                  setActiveLeadNotes({ ...activeLeadNotes, [lead.id]: e.target.value })
                                }
                                onBlur={() => handleSaveNotes(lead.id)}
                                className={`flex-1 ${theme.notesBg} rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none transition-colors leading-relaxed shadow-xs`}
                              />
                              <button
                                onClick={() => handleSaveNotes(lead.id)}
                                disabled={isSavingThisNote}
                                className="px-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0 flex items-center justify-center"
                                title="Guardar nota na base de dados"
                              >
                                {isSavingThisNote ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Fast Move Buttons (Alternative to Dragging) */}
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            <span>Mover etapa:</span>
                            <div className="flex items-center gap-1">
                              {col.status !== "nova" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "nova")}
                                  className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold cursor-pointer transition-colors"
                                >
                                  Nova
                                </button>
                              )}
                              {col.status !== "contactada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "contactada")}
                                  className="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold cursor-pointer transition-colors"
                                >
                                  Contactada
                                </button>
                              )}
                              {col.status !== "fechada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "fechada")}
                                  className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black cursor-pointer transition-colors"
                                >
                                  🏆 Fechar Venda
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

      {/* ========================================================================= */}
      {/* MODAL: REGISTAR / EDITAR VENDA FECHADA E COMISSÃO                         */}
      {/* ========================================================================= */}
      {closingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setClosingLead(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-950 dark:text-white mb-1">
              Registar Venda Fechada
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
              Cliente: <strong className="text-slate-900 dark:text-white">{closingLead.name}</strong> • {closingLead.phone}
            </p>

            <form onSubmit={handleConfirmCloseDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Valor Total do Negócio Fechado (€) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Euro className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 5500"
                    value={closingValueInput}
                    onChange={(e) => handleClosedValueChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-950 dark:text-white font-mono font-bold text-base focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                  Valor da Comissão (€)
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 550"
                    value={closingCommissionInput}
                    onChange={(e) => setClosingCommissionInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-950 dark:text-white font-mono font-bold text-base focus:border-emerald-600 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block font-semibold">
                  (Calculado automaticamente a 10% ou ajustável livremente)
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingClose}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingClose ? "A gravar..." : "Confirmar Venda"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setClosingLead(null)}
                  className="py-3.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
