import crypto from "crypto";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "979841341182458";

export const META_CONVERSIONS_API_ACCESS_TOKEN =
  process.env.META_CONVERSIONS_API_ACCESS_TOKEN ||
  "EAAT9k03bEqsBSgjVoa82Fet3Yiurus5KtnXVbjnPh6eVD42uNpHjz4uJsZAgZCRYrg4jcPZBZCIXZBPbNrCdrMzKryYhF0c07LSM2qmkIBvJ2OpsgIigbbcBVLFByCi6d8ZALAg87QREmel4XtaTh75xWR60eKdNYeYjvkTdCZAp4jZCk0dGoJiFVJAxneHXYAZDZD";

export interface MetaCapiLeadParams {
  eventId: string;
  value?: number;
  currency?: string;
  contentName?: string;
  sourceUrl?: string;
  userAgent?: string;
  ipAddress?: string;
  fbp?: string;
  fbc?: string;
  phone?: string;
  email?: string;
  firstName?: string;
  testEventCode?: string;
}

export interface MetaCapiResponse {
  success: boolean;
  eventsReceived?: number;
  fbtraceId?: string;
  error?: string;
}

/**
 * Normaliza e gera o hash SHA-256 exigido pela Meta para dados de utilizador (email, nome)
 */
export function hashData(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Normaliza número de telefone (remove caracteres não numéricos) e gera hash SHA-256
 */
export function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return undefined;
  // Se for número português sem indicativo 351 (ex: 912345678), adiciona 351
  if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("2"))) {
    digits = `351${digits}`;
  }
  return crypto.createHash("sha256").update(digits).digest("hex");
}

/**
 * Envia evento Lead para a Meta Conversions API (CAPI) via Graph API v20.0
 */
export async function sendMetaConversionsApiEvent(
  params: MetaCapiLeadParams
): Promise<MetaCapiResponse> {
  const pixelId = META_PIXEL_ID;
  const accessToken = META_CONVERSIONS_API_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("[Meta CAPI] Pixel ID ou Access Token em falta.");
    return { success: false, error: "Pixel ID ou Token em falta" };
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);

    // Preparação dos dados do utilizador com hash SHA-256
    const userData: Record<string, any> = {};

    const hashedPhone = hashPhone(params.phone);
    if (hashedPhone) userData.ph = [hashedPhone];

    const hashedEmail = hashData(params.email);
    if (hashedEmail) userData.em = [hashedEmail];

    const hashedFirstName = hashData(params.firstName);
    if (hashedFirstName) userData.fn = [hashedFirstName];

    if (params.userAgent) {
      userData.client_user_agent = params.userAgent;
    }

    if (params.ipAddress) {
      userData.client_ip_address = params.ipAddress;
    }

    if (params.fbp) {
      userData.fbp = params.fbp;
    }

    if (params.fbc) {
      userData.fbc = params.fbc;
    }

    // Custom Data com o valor monetário do lead e moeda EUR
    const customData: Record<string, any> = {
      currency: params.currency || "EUR",
    };

    if (params.value !== undefined && params.value > 0) {
      customData.value = params.value;
    }

    if (params.contentName) {
      customData.content_name = params.contentName;
    }

    const payload: Record<string, any> = {
      data: [
        {
          event_name: "Lead",
          event_time: eventTime,
          event_id: params.eventId,
          event_source_url: params.sourceUrl || "https://solaris-energia.pt",
          action_source: "website",
          user_data: userData,
          custom_data: customData,
        },
      ],
    };

    if (params.testEventCode) {
      payload.test_event_code = params.testEventCode;
    }

    const endpoint = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI Error Response]", result);
      return {
        success: false,
        error: result?.error?.message || "Erro na Meta Graph API",
        fbtraceId: result?.error?.fbtrace_id,
      };
    }

    return {
      success: true,
      eventsReceived: result.events_received,
      fbtraceId: result.fbtrace_id,
    };
  } catch (err: any) {
    console.error("[Meta CAPI Network Error]", err);
    return {
      success: false,
      error: err?.message || "Falha de rede ao contactar Meta CAPI",
    };
  }
}
