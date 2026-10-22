import { extractHighestValue, generateEventId, getCookie, getFbcParam } from "./tracking-utils";

export interface TrackMetaLeadParams {
  eventId: string;
  value: number;
  currency?: string;
  contentName?: string;
}

/**
 * Dispara o evento Lead no Meta Pixel (lado do cliente / navegador) com deduplicação via eventID
 */
export function trackMetaLead(params: TrackMetaLeadParams): void {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    try {
      const eventData: Record<string, any> = {
        currency: params.currency || "EUR",
      };

      if (params.value > 0) {
        eventData.value = params.value;
      }

      if (params.contentName) {
        eventData.content_name = params.contentName;
      }

      (window as any).fbq("track", "Lead", eventData, { eventID: params.eventId });
    } catch (pixelErr) {
      console.warn("[Meta Pixel] Erro ao disparar evento Lead:", pixelErr);
    }
  }
}

/**
 * Dispara os eventos Lead e Contact no Meta Pixel quando um utilizador inicia conversa de WhatsApp
 * Utiliza o eventId idêntico para desduplicação com a Conversions API (CAPI)
 */
export function trackWhatsAppLead(params: { eventId: string; value?: number; contentName?: string }): void {
  if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
    try {
      const eventValue = params.value && params.value > 0 ? params.value : 6000;
      
      // 1. Lead Event com deduplicação via eventID
      (window as any).fbq(
        "track",
        "Lead",
        {
          value: eventValue,
          currency: "EUR",
          content_name: params.contentName || "Lead WhatsApp • Solaris Energia",
        },
        { eventID: params.eventId }
      );

      // 2. Contact Event para acompanhamento no Events Manager
      (window as any).fbq("track", "Contact", {
        content_name: "Contacto WhatsApp Iniciado",
      });
    } catch (pixelErr) {
      console.warn("[Meta Pixel] Erro ao disparar evento WhatsApp Lead:", pixelErr);
    }
  }
}

export { extractHighestValue, generateEventId, getCookie, getFbcParam };
