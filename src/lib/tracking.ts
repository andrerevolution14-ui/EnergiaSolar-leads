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

export { extractHighestValue, generateEventId, getCookie, getFbcParam };
