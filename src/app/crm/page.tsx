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
  Users,
  UserPlus,
  UserCheck,
  Send,
  Mail,
  Filter,
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
  assignedTo?: string;
  assignedName?: string;
  assignedAt?: string;
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

interface CurrentUser {
  id: string;
  username: string;
  name: string;
  role: "admin" | "vendedor";
}

interface VendorUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: "admin" | "vendedor";
  createdAt: string;
}

export default function CrmPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
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
  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Vendors Management (for Admin)
  const [vendorsList, setVendorsList] = useState<VendorUser[]>([]);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [newVendorUsername, setNewVendorUsername] = useState("");
  const [newVendorPassword, setNewVendorPassword] = useState("");
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [vendorCreateError, setVendorCreateError] = useState<string | null>(null);
  const [vendorCreateSuccess, setVendorCreateSuccess] = useState<string | null>(null);
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);

  // Lead Assign Modal (for Admin)
  const [assigningLead, setAssigningLead] = useState<Lead | null>(null);
  const [targetVendorId, setTargetVendorId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

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

  // Check initial session & restore saved theme
  useEffect(() => {
    checkSession();
    if (localStorage.getItem("crm_theme") === "dark") setIsDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("crm_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/crm/auth");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        loadLeads("", selectedVendorFilter);
        if (data.user?.role === "admin") {
          loadVendors();
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await fetch("/api/crm/users");
      if (res.ok) {
        const data = await res.json();
        setVendorsList(data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar vendedores:", err);
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

      setCurrentUser(data.user);
      setSelectedVendorFilter("all");
      loadLeads("", "all");
      if (data.user?.role === "admin") {
        loadVendors();
      }
    } catch (err: any) {
      setLoginError(err.message || "Erro no início de sessão");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/crm/auth", { method: "DELETE" });
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
  };

  const loadLeads = async (search = searchQuery, vendor = selectedVendorFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (vendor && vendor !== "all") params.append("vendorId", vendor);

      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
        if (data.currentUser) setCurrentUser(data.currentUser);

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

  const handleVendorFilterChange = (vendorId: string) => {
    setSelectedVendorFilter(vendorId);
    loadLeads(searchQuery, vendorId);
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingVendor(true);
    setVendorCreateError(null);
    setVendorCreateSuccess(null);

    try {
      const res = await fetch("/api/crm/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newVendorUsername,
          password: newVendorPassword,
          name: newVendorName,
          email: newVendorEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar conta de vendedor");
      }

      setVendorCreateSuccess(`Conta criada com sucesso para ${newVendorName}!`);
      setNewVendorUsername("");
      setNewVendorPassword("");
      setNewVendorName("");
      setNewVendorEmail("");
      loadVendors();
      setTimeout(() => {
        setIsVendorModalOpen(false);
        setVendorCreateSuccess(null);
      }, 1500);
    } catch (err: any) {
      setVendorCreateError(err.message || "Falha ao criar utilizador.");
    } finally {
      setIsCreatingVendor(false);
    }
  };

  const handleDeleteVendor = async (userId: string, vendorName: string) => {
    if (!confirm(`Tem a certeza que deseja eliminar o acesso do vendedor "${vendorName}"?`)) return;

    try {
      const res = await fetch(`/api/crm/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedVendorFilter === userId) {
          setSelectedVendorFilter("all");
          loadLeads(searchQuery, "all");
        }
        loadVendors();
      }
    } catch (err) {
      console.error("Erro ao eliminar vendedor:", err);
    }
  };

  const handleOpenAssignLead = (lead: Lead) => {
    setAssigningLead(lead);
    setTargetVendorId(lead.assignedTo || "");
  };

  const handleConfirmAssignLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLead) return;

    setIsAssigning(true);
    const chosenVendor = vendorsList.find((v) => v.id === targetVendorId);
    const assignedName = chosenVendor ? chosenVendor.name : targetVendorId === "admin_tecnergy" ? "Administrador (Tecnergy)" : null;

    try {
      const res = await fetch("/api/crm/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assigningLead.id,
          status: assigningLead.status,
          assignedTo: targetVendorId ? targetVendorId : null,
          assignedName: assignedName,
          notifyEmail: true,
        }),
      });

      if (res.ok) {
        setAssigningLead(null);
        loadLeads();
      }
    } catch (err) {
      console.error("Erro ao atribuir lead:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "nova" | "contactada" | "fechada",
    closedVal?: number,
    commVal?: number
  ) => {
    // If moving to "fechada" without values specified, open modal to input them
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

      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, notes: noteText } : l))
      );

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
      "Vendedor Atribuido",
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
      `"${(l.assignedName || "Não atribuído").replace(/"/g, '""')}"`,
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
      `solaris_leads_${currentUser?.username || "crm"}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading Session
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold text-sm">A carregar CRM Solaris...</span>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!currentUser) {
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
                  placeholder="tecnergy ou o seu username"
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
            Acesso reservado ao administrador e vendedores credenciados.
          </div>
        </div>
      </div>
    );
  }

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (propertyFilter !== "todos" && lead.propertyType !== propertyFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      (lead.location && lead.location.toLowerCase().includes(q)) ||
      (lead.assignedName && lead.assignedName.toLowerCase().includes(q))
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

  // Theme variable classes
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

  const isAdmin = currentUser?.role === "admin";
  const activeVendorName =
    selectedVendorFilter === "all"
      ? "Todas as Leads"
      : selectedVendorFilter === "unassigned"
      ? "Leads Sem Atribuição"
      : vendorsList.find((v) => v.id === selectedVendorFilter)?.name || "Vendedor";

  return (
    <div className={`${isDarkMode ? "dark" : ""} min-h-screen ${theme.bg} flex flex-col font-sans transition-colors duration-150`}>
      {/* Institutional Top Bar */}
      <div className={`border-b px-4 sm:px-8 py-1.5 text-[11px] font-semibold flex flex-wrap items-center justify-between gap-2 ${theme.subHeaderBg}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Plataforma Comercial • Tecnergy Solaris</span>
          </div>
          <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
          <div className="hidden md:flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Sessão: <strong>{currentUser.name}</strong> ({isAdmin ? "Administrador" : "Vendedor"})
            </span>
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
            Sincronização em tempo real
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
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                isAdmin
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              }`}>
                {isAdmin ? "ADMIN DONO" : "VENDEDOR"}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isAdmin ? "Gestão Global & Atribuição de Vendedores" : `Painel de Vendas • ${currentUser.name}`}
            </div>
          </div>
        </div>

        {/* Header Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Admin Manage Vendors Button */}
          {isAdmin && (
            <button
              onClick={() => setIsVendorModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
              title="Criar nova conta de vendedor ou gerir equipa"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Gerir Vendedores ({vendorsList.length})</span>
            </button>
          )}

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
            title="Atualizar dados"
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
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Executive CRM Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Admin Vendor Filter Pill Bar */}
        {isAdmin && (
          <div className={`p-3 rounded-2xl border ${theme.subBox} flex flex-wrap items-center justify-between gap-3`}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Ver CRM de:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleVendorFilterChange("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedVendorFilter === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                }`}
              >
                Todas as Leads
              </button>

              <button
                type="button"
                onClick={() => handleVendorFilterChange("unassigned")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedVendorFilter === "unassigned"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 border border-amber-200 dark:border-amber-800"
                }`}
              >
                ⚠️ Sem Vendedor
              </button>

              {vendorsList.map((vendor) => {
                const isSelected = selectedVendorFilter === vendor.id;
                return (
                  <button
                    key={vendor.id}
                    type="button"
                    onClick={() => handleVendorFilterChange(vendor.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span>{vendor.name}</span>
                    <span className="text-[10px] opacity-75">(@{vendor.username})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Institutional KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
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
              {isAdmin ? activeVendorName : "As suas leads atribuídas"}
            </div>
          </div>

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
              Qualificação / Proposta
            </div>
          </div>

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

        {/* Search & Property Segment Filter Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setPropertyFilter("todos")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                propertyFilter === "todos"
                  ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Todos os Imóveis
            </button>
            <button
              onClick={() => setPropertyFilter("residencial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                propertyFilter === "residencial"
                  ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Residencial
            </button>
            <button
              onClick={() => setPropertyFilter("comercial")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                propertyFilter === "comercial"
                  ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Comercial
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telemóvel, localidade ou vendedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${theme.inputBg} rounded-xl py-2.5 pl-10 pr-9 text-xs font-semibold focus:outline-none transition-colors shadow-xs`}
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

        {/* Kanban Guide */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
          <span>Arraste os cartões entre as colunas ou use os botões rápidos. As alterações são sincronizadas instantaneamente.</span>
        </div>

        {/* KANBAN DRAG-AND-DROP COLUMNS */}
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

                          {/* Vendor Assignment Badge & Button */}
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500">Comercial:</span>
                              {lead.assignedName ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-extrabold text-[11px] border border-blue-200 dark:border-blue-800">
                                  <UserCheck className="w-3 h-3 text-blue-600" />
                                  <span>{lead.assignedName}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-800">
                                  Não atribuído
                                </span>
                              )}
                            </div>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignLead(lead)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline cursor-pointer"
                              >
                                {lead.assignedTo ? "Mudar Vendedor" : "Atribuir"}
                              </button>
                            )}
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

                          {/* If closed, show Deal Value & Commission Badges */}
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

                          {/* Commercial Notes with Direct Input & Auto-save on Blur */}
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

                          {/* Fast Move Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                            <span>Mover etapa:</span>
                            <div className="flex items-center gap-1">
                              {col.status !== "nova" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "nova")}
                                  className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold cursor-pointer transition-colors"
                                >
                                  Nova
                                </button>
                              )}
                              {col.status !== "contactada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "contactada")}
                                  className="px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/70 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold cursor-pointer transition-colors"
                                >
                                  Contactada
                                </button>
                              )}
                              {col.status !== "fechada" && (
                                <button
                                  onClick={() => handleStatusChange(lead.id, "fechada")}
                                  className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-black cursor-pointer transition-colors"
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
      {/* MODAL: GERIR / CRIAR VENDEDORES (EXCLUSIVO ADMIN DONO)                    */}
      {/* ========================================================================= */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsVendorModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Equipa de Vendedores
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crie novos acessos para a sua equipa comercial
                </p>
              </div>
            </div>

            {vendorCreateError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{vendorCreateError}</span>
              </div>
            )}

            {vendorCreateSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{vendorCreateSuccess}</span>
              </div>
            )}

            {/* Form Criar Vendedor */}
            <form onSubmit={handleCreateVendor} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Adicionar Novo Vendedor
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Martins"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Email de Aviso *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vendedor@empresa.com"
                    value={newVendorEmail}
                    onChange={(e) => setNewVendorEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Nome de Utilizador (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: pedro"
                    value={newVendorUsername}
                    onChange={(e) => setNewVendorUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Palavra-passe Inicial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: solar2026"
                    value={newVendorPassword}
                    onChange={(e) => setNewVendorPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingVendor}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isCreatingVendor ? "A criar conta..." : "Criar Sessão de Vendedor"}</span>
              </button>
            </form>

            {/* Lista de Vendedores Atuais */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                Vendedores Registados ({vendorsList.length})
              </h4>

              {vendorsList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Nenhum vendedor criado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {vendorsList.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{v.name}</span>
                          <span className="text-[10px] text-slate-400">(@{v.username})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{v.email}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteVendor(v.id, v.name)}
                        className="text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                        title="Remover vendedor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ATRIBUIR LEAD A VENDEDOR (ADMIN DONO)                              */}
      {/* ========================================================================= */}
      {assigningLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setAssigningLead(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Atribuir Lead
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {assigningLead.name} ({assigningLead.phone})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmAssignLead} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Escolher Vendedor Responsável:
                </label>
                <select
                  value={targetVendorId}
                  onChange={(e) => setTargetVendorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 px-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Nenhum (Sem Vendedor)</option>
                  <option value="admin_tecnergy">Administrador (Tecnergy)</option>
                  {vendorsList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200">
                📧 O vendedor receberá automaticamente um <strong>aviso por email</strong> com todos os dados da lead e a mesma aparecerá imediatamente no CRM pessoal dele.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningLead(null)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAssigning ? "A guardar..." : "Confirmar Atribuição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTAR / EDITAR VENDA FECHADA E COMISSÃO                         */}
      {/* ========================================================================= */}
      {closingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setClosingLead(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Registar Fecho de Venda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {closingLead.name} ({closingLead.phone})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmCloseDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Valor Total do Contrato Adjudicado (€)
                </label>
                <div className="relative">
                  <Euro className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="10"
                    required
                    placeholder="Ex: 5500"
                    value={closingValueInput}
                    onChange={(e) => handleClosedValueChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Comissão Calculada (€)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    step="5"
                    required
                    placeholder="Ex: 550"
                    value={closingCommissionInput}
                    onChange={(e) => setClosingCommissionInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sugestão padrão automática: 10% do valor fechado.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingLead(null)}
                  className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClose}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingClose ? "A gravar..." : "Guardar Contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
