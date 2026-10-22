"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sun, ShieldCheck, CheckCheck, Sparkles, MessageCircle } from "lucide-react";
import { trackWhatsAppLead, generateEventId, getCookie, getFbcParam } from "@/lib/tracking";

// Número de destino padrão ou via variável de ambiente
const WHATSAPP_RAW_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "351928136297";
const WHATSAPP_NUMBER = WHATSAPP_RAW_NUMBER.replace(/\D/g, "");

// Objetivos da landing page com mensagens pré-formatadas, abertas e naturais
interface QuickOption {
  id: string;
  badge: string;
  title: string;
  message: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    id: "estudo",
    badge: "☀️ Simulação",
    title: "Estudo Solar & Poupança",
    message: "Olá! Gostaria de receber um estudo solar gratuito e saber quanto posso poupar na minha moradia.",
  },
  {
    id: "apoios",
    badge: "🏛️ Estado 2026",
    title: "Apoios Fundo Ambiental",
    message: "Olá! Gostaria de verificar a minha elegibilidade aos apoios a fundo perdido do Fundo Ambiental para painéis solares.",
  },
  {
    id: "fatura",
    badge: "⚡ Poupança",
    title: "Reduzir Fatura da Luz",
    message: "Olá! Quero reduzir a fatura de eletricidade da minha casa/empresa e conhecer as opções de autoconsumo e baterias.",
  },
  {
    id: "duvidas",
    badge: "💬 Dúvidas",
    title: "Falar com Especialista",
    message: "Olá! Tenho algumas questões sobre instalação de painéis solares e gostaria de falar com um especialista.",
  },
];

const DEFAULT_MESSAGE =
  "Olá! Gostaria de mais informações sobre painéis solares e simulação de poupança para o meu imóvel.";

export default function WhatsAppFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(DEFAULT_MESSAGE);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Exibe a tooltip convidativa após 2 segundos na página
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fecha o card ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOption = (option: QuickOption) => {
    setSelectedOptionId(option.id);
    setSelectedMessage(option.message);
  };

  const handleOpenChat = async () => {
    if (isSending) return;
    setIsSending(true);

    const messageToSend = selectedMessage.trim() || DEFAULT_MESSAGE;
    const eventId = generateEventId();
    const fbp = getCookie("_fbp");
    const fbc = getFbcParam();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";

    // 1. Disparo imediato do Meta Pixel no Navegador (Deduplicação com CAPI via eventId)
    trackWhatsAppLead({
      eventId,
      value: 6000,
      contentName: `Lead WhatsApp • Solaris (${selectedOptionId || "geral"})`,
    });

    // 2. Registo no CRM & Disparo Server-side da Meta Conversions API (CAPI)
    try {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          source: "whatsapp",
          origin: "whatsapp",
          name: "Lead WhatsApp (Interessado Solar)",
          phone: "+351 928 136 297",
          propertyType: "residencial",
          monthlyBill: "Contacto via WhatsApp",
          plannedBudget: "3.500€ a 6.000€",
          timeline: "Imediato",
          whatsappMessage: messageToSend,
          eventId,
          highestValue: 6000,
          fbp,
          fbc,
          pageUrl,
        }),
      }).catch((err) => {
        console.warn("[WhatsApp Lead API non-blocking error]", err);
      });
    } catch (e) {
      // Ignorar para nunca bloquear a abertura do WhatsApp
    }

    // 3. Montagem do link seguro do WhatsApp
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      messageToSend
    )}`;

    // Aguarda um micro instante e abre o WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setIsSending(false);
      setIsOpen(false);
    }, 250);
  };

  return (
    <aside
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none"
    >
      {/* 1. Modal / Balão Elegante de Conversação com Pré-visualização */}
      {isOpen && (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-chat-title"
          className="mb-3.5 w-[calc(100vw-2.5rem)] sm:w-[380px] max-w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95 origin-bottom-right"
        >
          {/* Top Header estilo WhatsApp oficial com identidade Solaris */}
          <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#0f766e] p-4 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Sun className="w-6 h-6 text-amber-300" />
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#075E54] rounded-full animate-pulse"
                    title="Disponível agora"
                  />
                </div>
                <div>
                  <h3 id="whatsapp-chat-title" className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>Solaris Portugal</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-100 font-medium mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span>Consultor Online • Resposta em minutos</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Fechar janela"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Body com padrão de mensagem */}
          <div className="p-4 bg-slate-50/80 space-y-3.5 max-h-[68vh] overflow-y-auto">
            {/* Mensagem de Boas-Vindas da Solaris */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                S
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-slate-100 text-slate-800 text-xs sm:text-[13px] leading-relaxed relative">
                <p className="font-semibold text-slate-900 mb-1">
                  Olá! 👋 Tem interesse em energia solar?
                </p>
                <p className="text-slate-600">
                  Descubra quanto pode poupar na luz e se a sua moradia tem direito a apoios do Fundo Ambiental em 2026.
                </p>
                <p className="text-slate-500 text-[11px] mt-2 font-medium">
                  Escolha o seu objetivo para iniciarmos:
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1">
                  <span>Agora</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Chips de Objetivos Rápidos da Landing Page */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Qual é a sua prioridade?
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_OPTIONS.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm"
                          : "bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                          {opt.badge}
                        </span>
                        <span className="truncate">{opt.title}</span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caixa de Mensagem Editável / Personalizada */}
            <div className="pt-1">
              <label
                htmlFor="whatsapp-custom-msg"
                className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1"
              >
                Mensagem a enviar:
              </label>
              <textarea
                id="whatsapp-custom-msg"
                rows={2}
                value={selectedMessage}
                onChange={(e) => setSelectedMessage(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none shadow-inner"
              />
            </div>

            {/* Botão Principal de Início de Conversa */}
            <button
              type="button"
              onClick={handleOpenChat}
              disabled={isSending}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0e7468] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isSending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>A ligar ao WhatsApp...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Iniciar Conversa no WhatsApp</span>
                  <Send className="w-3.5 h-3.5 text-emerald-100 ml-0.5" />
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sem custos de chamada • Resposta rápida de consultor DGEG</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tooltip Receptivo (Aparece suavemente para chamar a atenção quando fechado) */}
      {!isOpen && showTooltip && (
        <div className="mb-2.5 mr-1 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-slate-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fale connosco no WhatsApp</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 ml-1 transition-colors"
            aria-label="Dispensar aviso"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Botão Flutuante Circular Principal WhatsApp */}
      <div className="relative group">
        {/* Anel de Pulsação Suave */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 blur-sm group-hover:opacity-70 animate-pulse transition-opacity pointer-events-none"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setShowTooltip(false);
          }}
          aria-expanded={isOpen}
          aria-label="Abrir suporte via WhatsApp"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#2ee06e] text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          {isOpen ? (
            <X className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200" />
          ) : (
            <>
              {/* WhatsApp Icon */}
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>

              {/* Ponto indicador de estado Online */}
              <span
                className="absolute top-0 right-0 w-4 h-4 bg-emerald-300 border-2 border-white rounded-full shadow-sm"
                title="Online agora"
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
