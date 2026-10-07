/**
 * Utilitários de tracking para Meta Pixel & Conversions API (CAPI)
 */

/**
 * Extrai todos os valores monetários/numéricos válidos de uma string ou lista de strings e retorna o valor mais alto.
 * Suporta formatos portugueses (ex: "3.500€", "3.500€ a 6.000€", "6.000€ a 12.000€", "Mais de 12.000€", "140.000 €", "150k", "150 mil").
 */
export function extractHighestValue(
  sources: (string | number | undefined | null)[] | string | number | undefined | null
): number {
  if (!sources) return 6000; // Valor padrão razoável de instalação solar em Portugal caso vazio

  const list = Array.isArray(sources) ? sources : [sources];
  const candidates: number[] = [];

  for (const item of list) {
    if (item === undefined || item === null) continue;

    if (typeof item === "number") {
      if (Number.isFinite(item) && item > 0) {
        candidates.push(item);
      }
      continue;
    }

    const text = String(item).trim();
    if (!text) continue;

    // 1. Procura formatos com "k" ou "mil" (ex: "150k", "150 mil", "12k")
    const kRegex = /(\d+(?:[.,]\d+)?)\s*(?:k|mil)\b/gi;
    let kMatch: RegExpExecArray | null;
    while ((kMatch = kRegex.exec(text)) !== null) {
      const numStr = kMatch[1].replace(",", ".");
      const parsed = parseFloat(numStr) * 1000;
      if (Number.isFinite(parsed) && parsed > 0) {
        candidates.push(parsed);
      }
    }

    // 2. Procura números formatados com pontos ou espaços como milhares (ex: 3.500, 6.000, 12.000, 140.000, 150 000)
    const formattedRegex = /\b\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?\b/g;
    let fmtMatch: RegExpExecArray | null;
    while ((fmtMatch = formattedRegex.exec(text)) !== null) {
      const clean = fmtMatch[0].replace(/[.\s]/g, "").replace(",", ".");
      const parsed = parseFloat(clean);
      if (Number.isFinite(parsed) && parsed > 0) {
        candidates.push(parsed);
      }
    }

    // 3. Procura números inteiros diretos (ex: "3500", "6000", "12000", "50000")
    const plainRegex = /\b\d{3,12}\b/g;
    let plainMatch: RegExpExecArray | null;
    while ((plainMatch = plainRegex.exec(text)) !== null) {
      const parsed = parseFloat(plainMatch[0]);
      if (Number.isFinite(parsed) && parsed > 0) {
        candidates.push(parsed);
      }
    }

    // 4. Se o texto contiver números simples soltos
    const digitsOnly = text.replace(/[^0-9]/g, "");
    if (digitsOnly.length >= 3) {
      const parsed = parseFloat(digitsOnly);
      if (Number.isFinite(parsed) && parsed > 0) {
        candidates.push(parsed);
      }
    }
  }

  if (candidates.length === 0) {
    return 6000;
  }

  return Math.max(...candidates);
}

/**
 * Gera um ID de evento único para desduplicação perfeita entre Meta Pixel e Conversions API
 */
export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `lead_${timestamp}_${random}`;
}

/**
 * Lê o valor de um cookie no browser
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : undefined;
}

/**
 * Obtém ou constrói o parâmetro fbc da Meta (via query param fbclid ou cookie _fbc)
 */
export function getFbcParam(): string | undefined {
  if (typeof window === "undefined") return undefined;

  // 1. Cookie já existente
  const existingCookie = getCookie("_fbc");
  if (existingCookie) return existingCookie;

  // 2. Extrai do parâmetro fbclid da URL se presente
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");
    if (fbclid) {
      const creationTime = Date.now();
      return `fb.1.${creationTime}.${fbclid}`;
    }
  } catch {
    // ignorar erros de parsing
  }

  return undefined;
}
