"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  trackMetaLead,
  extractHighestValue,
  generateEventId,
  getCookie,
  getFbcParam,
} from "@/lib/tracking";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  Home,
  Building2,
  Euro,
  MapPin,
  Clock,
  ArrowRight,
  Edit2,
  Sparkles,
  AlertTriangle,
  Loader2,
  Calendar,
  Target,
  Award,
  ChevronDown,
} from "lucide-react";

const STORAGE_KEY = "solaris_lead_autofill_data";

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    propertyType: "residencial",
    monthlyBill: "100€ - 250€",
    plannedBudget: "3.500€ a 6.000€",
    timeline: "Imediato (2 a 4 semanas)",
    location: "",
  });

  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  // 1. Preenchimento automático com informação existente (localStorage, URL query params, Simulador)
  useEffect(() => {
    let savedLocal: Partial<typeof formData> = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        savedLocal = JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    let urlData: Partial<typeof formData> = {};
    try {
      if (typeof window !== "undefined") {
        const search = new URLSearchParams(window.location.search);
        const nameParam = search.get("name") || search.get("nome");
        const phoneParam = search.get("phone") || search.get("tel") || search.get("telefone");
        const locationParam = search.get("location") || search.get("localidade") || search.get("cidade") || search.get("concelho");
        const propertyTypeParam = search.get("propertyType") || search.get("tipo");
        const monthlyBillParam = search.get("monthlyBill") || search.get("fatura");
        const budgetParam = search.get("budget") || search.get("orcamento");
        const timelineParam = search.get("timeline") || search.get("prazo");

        if (nameParam) urlData.name = nameParam.trim();
        if (phoneParam) urlData.phone = phoneParam.trim();
        if (locationParam) urlData.location = locationParam.trim();
        if (propertyTypeParam && ["residencial", "comercial"].includes(propertyTypeParam)) {
          urlData.propertyType = propertyTypeParam as any;
        }
        if (monthlyBillParam) urlData.monthlyBill = monthlyBillParam;
        if (budgetParam) urlData.plannedBudget = budgetParam;
        if (timelineParam) urlData.timeline = timelineParam;
      }
    } catch {
      // ignore
    }

    const merged = { ...savedLocal, ...urlData };
    if (Object.keys(merged).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...merged,
      }));
      if (merged.name || merged.phone || merged.location) {
        setHasAutofilled(true);
      }
    }

    // Escutar eventos ao vivo de outros componentes (ex: Simulador de Poupança)
    const handleLiveSync = (e: any) => {
      if (e?.detail) {
        setFormData((prev) => {
          const next = { ...prev, ...e.detail };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    };

    window.addEventListener("solaris:update-lead-form", handleLiveSync);
    return () => {
      window.removeEventListener("solaris:update-lead-form", handleLiveSync);
    };
  }, []);

  // Atualizar campo e persistir em localStorage
  const updateFormField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleClearAutofill = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setFormData({
      name: "",
      phone: "",
      propertyType: "residencial",
      monthlyBill: "100€ - 250€",
      plannedBudget: "3.500€ a 6.000€",
      timeline: "Imediato (2 a 4 semanas)",
      location: "",
    });
    setHasAutofilled(false);
  };

  // Quick validation before confirmation modal
  const handleOpenVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage("Por favor introduza o seu nome completo.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\s+/g, "").replace(/[-().]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage("Por favor introduza um número de telemóvel válido com pelo menos 9 dígitos.");
      return;
    }

    // Open confirmation modal to double-check phone number
    setIsVerifyingModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Extração do valor mais alto do formulário
      const highestValue = extractHighestValue([
        formData.plannedBudget,
        formData.monthlyBill,
      ]);

      // 2. Geração de ID de evento para desduplicação Pixel + Conversions API
      const eventId = generateEventId();

      // 3. Disparo do evento Lead no Meta Pixel (Browser)
      trackMetaLead({
        eventId,
        value: highestValue,
        currency: "EUR",
        contentName: `Estudo Solar (${formData.propertyType})`,
      });

      // 4. Parâmetros de atribuição Meta
      const fbp = getCookie("_fbp");
      const fbc = getFbcParam();
      const pageUrl = typeof window !== "undefined" ? window.location.href : "";

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId,
          highestValue,
          fbp,
          fbc,
          pageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro ao enviar o formulário.");
      }

      setIsVerifyingModalOpen(false);
      setSubmittedLeadId(data.leadId || "L-" + Math.floor(100000 + Math.random() * 900000));

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (cErr) {
        // fallback if canvas-confetti fails
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro. Por favor tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="formulario" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold mb-4">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Simulação 100% Gratuita • Sem Fidelização nem Compromisso</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
            Solicite o Seu Estudo Solar & Elegibilidade a Apoios
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Descubra quantos painéis necessita para a sua moradia, o valor exato da sua poupança mensal e a quanto tem direito a fundo perdido pelo Fundo Ambiental.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-950/70 px-4 py-1.5 rounded-xl border border-amber-700/60">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Atenção: Vagas de vistoria técnica gratuita limitadas por concelho este mês.</span>
          </div>
        </div>

        {/* Form Card or Success Message */}
        <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-700 shadow-2xl">
          {submittedLeadId ? (
            /* Success State */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Pedido Recebido com Sucesso!
                </h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto">
                  Muito obrigado, <strong>{formData.name}</strong>. O seu estudo técnico e a verificação de elegibilidade aos apoios do Estado estão a ser processados.
                </p>
                <div className="mt-3 inline-block bg-slate-900 px-4 py-1.5 rounded-lg text-xs font-mono text-blue-400 border border-slate-700">
                  Referência do Processo: {submittedLeadId}
                </div>
              </div>

              {/* What happens next roadmap */}
              <div className="bg-slate-900/80 rounded-2xl p-6 text-left border border-slate-700 max-w-lg mx-auto space-y-4">
                <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Próximos passos (o que vai acontecer agora):
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">Análise de Satélite do Telhado</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Os nossos engenheiros calculam a inclinação, orientação solar e área útil disponível da sua moradia.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">Contacto Telefónico Rápido (máx. 3-5 min)</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ligaremos para o seu número ({formData.phone}) nas próximas horas para validar o dimensionamento e o montante de apoios estatais a que tem direito.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-white">Apresentação da Proposta das Melhores Empresas</span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sem qualquer compromisso, com a garantia de 25 anos e instalação chave-na-mão até 30 dias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedLeadId(null);
                    setFormData({
                      name: "",
                      phone: "",
                      propertyType: "residencial",
                      monthlyBill: "100€ - 250€",
                      plannedBudget: "3.500€ a 6.000€",
                      timeline: "Imediato (2 a 4 semanas)",
                      location: "",
                    });
                  }}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Fazer outro pedido para outro imóvel
                </button>
              </div>
            </div>
          ) : (
            /* Lead Capture Form */
            <form
              id="formulario-leads"
              name="solarisLeadForm"
              autoComplete="on"
              onSubmit={handleOpenVerification}
              className="space-y-6"
            >
              {/* Notificação discreta de Preenchimento Automático com dados existentes */}
              {hasAutofilled && (formData.name || formData.phone || formData.location) && (
                <div className="flex items-center justify-between text-xs text-sky-200 bg-sky-950/70 border border-sky-500/40 rounded-2xl px-4 py-2.5 animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-medium">
                      Formulário preenchido automaticamente com a sua informação existente.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAutofill}
                    className="text-xs text-sky-300 hover:text-white underline font-bold cursor-pointer shrink-0 ml-3 transition-colors"
                  >
                    Limpar dados
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Property Type Radio Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                  1. Onde pretende instalar os painéis solares?
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <label
                    className={`cursor-pointer rounded-2xl p-3 sm:p-4 border flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 transition-all ${
                      formData.propertyType === "residencial"
                        ? "bg-blue-600/25 border-blue-500 text-white shadow-md"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value="residencial"
                      checked={formData.propertyType === "residencial"}
                      onChange={(e) => updateFormField("propertyType", e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        formData.propertyType === "residencial" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm sm:text-base">Moradia Familiar</div>
                      <div className="text-[11px] text-slate-400">Poupar até 75% na fatura de casa</div>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer rounded-2xl p-3 sm:p-4 border flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 transition-all ${
                      formData.propertyType === "comercial"
                        ? "bg-blue-600/25 border-blue-500 text-white shadow-md"
                        : "bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="propertyType"
                      value="comercial"
                      checked={formData.propertyType === "comercial"}
                      onChange={(e) => updateFormField("propertyType", e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        formData.propertyType === "comercial" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm sm:text-base">Empresa / Pavilhão</div>
                      <div className="text-[11px] text-slate-400">ROI rápido & Dedução em IRC</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Nome Completo <span className="text-blue-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="lead-name"
                      name="name"
                      autoComplete="name"
                      autoCapitalize="words"
                      required
                      placeholder="Ex: João Pereira"
                      value={formData.name}
                      onChange={(e) => updateFormField("name", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white text-base sm:text-sm placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Número de Telemóvel <span className="text-blue-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      id="lead-phone"
                      name="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      placeholder="Ex: 912 345 678"
                      value={formData.phone}
                      onChange={(e) => updateFormField("phone", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white text-base sm:text-sm placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    (Validará o número no passo seguinte para contacto técnico)
                  </span>
                </div>
              </div>

              {/* High-Intent Qualification Filter: Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1. Planned Budget */}
                <div>
                  <label htmlFor="orcamento-select" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    2. Orçamento Previsto / Valor da Intervenção
                  </label>
                  <div className="relative">
                    <Euro className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="orcamento-select"
                      name="plannedBudget"
                      autoComplete="off"
                      value={formData.plannedBudget}
                      onChange={(e) => updateFormField("plannedBudget", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-10 text-white text-base sm:text-sm focus:border-blue-500 transition-colors appearance-none cursor-pointer truncate"
                    >
                      <option value="Até 3.500€">Até 3.500€ · Essencial</option>
                      <option value="3.500€ a 6.000€">3.500€ a 6.000€ · Familiar</option>
                      <option value="6.000€ a 12.000€">6.000€ a 12.000€ · Baterias</option>
                      <option value="Mais de 12.000€">Mais de 12.000€ · Empresas</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Timeline */}
                <div>
                  <label htmlFor="prazo-select" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    3. Para quando prevê a instalação?
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="prazo-select"
                      name="timeline"
                      autoComplete="off"
                      value={formData.timeline}
                      onChange={(e) => updateFormField("timeline", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-10 text-white text-base sm:text-sm focus:border-blue-500 transition-colors appearance-none cursor-pointer truncate"
                    >
                      <option value="Imediato (2 a 4 semanas)">Imediato (2 a 4 semanas)</option>
                      <option value="1 a 3 meses">Nos próximos 1 a 3 meses</option>
                      <option value="Apenas planeamento para este ano">Só a planear para este ano</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Monthly Bill and Location (Clean 2-column grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label htmlFor="fatura-select" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Fatura de Luz Atual
                  </label>
                  <div className="relative">
                    <Euro className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="fatura-select"
                      name="monthlyBill"
                      autoComplete="off"
                      value={formData.monthlyBill}
                      onChange={(e) => updateFormField("monthlyBill", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-10 text-white text-base sm:text-sm focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Até 100€">Até 100€ / mês</option>
                      <option value="100€ - 250€">100€ a 250€ / mês</option>
                      <option value="250€ - 500€">250€ a 500€ / mês</option>
                      <option value="Mais de 500€">Mais de 500€ / mês</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-location" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Concelho / Localidade da Moradia
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      id="lead-location"
                      name="address-level2"
                      autoComplete="address-level2"
                      placeholder="Ex: Sintra / Braga / Faro"
                      value={formData.location}
                      onChange={(e) => updateFormField("location", e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white text-base sm:text-sm placeholder:text-slate-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* What is included in this offer strip */}
              <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px] mb-1">
                  ✓ O que garante hoje ao avançar com este pedido:
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Auditoria de satélite 3D e dimensionamento do telhado (100% Grátis)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cálculo e reserva de apoio a fundo perdido do Fundo Ambiental</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Comparativo fechado com os 3 melhores instaladores certificados DGEG</span>
                </div>
              </div>

              {/* Submit Button with Massive Buyer Intent */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-black text-base sm:text-lg shadow-xl shadow-blue-600/35 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>Quero Instalar os Meus Painéis e Começar a Poupar Este Mês</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </button>
              </div>

              {/* Trust & GDPR reassurance */}
              <div className="pt-1 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Dados 100% confidenciais (RGPD). Sem chamadas insistentes nem custos ocultos.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHONE CONFIRMATION MODAL                                                  */}
      {/* ========================================================================= */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-white mb-2">
              Confirme o seu número de telemóvel
            </h3>

            <p className="text-sm text-slate-300 mb-6">
              Para podermos apresentar a simulação 3D personalizada do seu telhado e os incentivos aplicáveis da sua região, certifique-se de que o número abaixo está correto:
            </p>

            {/* High-visibility phone preview box */}
            <div className="p-4 rounded-2xl bg-slate-800 border-2 border-blue-500/60 text-center mb-6">
              <div className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                Contacto para apresentação do estudo:
              </div>
              <div className="text-2xl font-black text-white font-mono tracking-wider">
                {formData.phone}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                ✓ Destinatário: {formData.name}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              {/* Confirm & Send Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A registar estudo...</span>
                  </>
                ) : (
                  <>
                    <span>Sim, o Número Está Correto — Avançar com a Instalação</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Edit Number Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsVerifyingModalOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Corrigir número de telemóvel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
