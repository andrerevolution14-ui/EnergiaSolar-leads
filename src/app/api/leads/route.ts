import { NextRequest, NextResponse } from "next/server";
import { saveLead, LeadData } from "@/lib/leads";
import { sendMetaConversionsApiEvent } from "@/lib/meta-capi";
import { extractHighestValue, generateEventId } from "@/lib/tracking-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      propertyType = "residencial",
      monthlyBill = "100€ - 250€",
      plannedBudget,
      timeline,
      location = "",
      estimatedSavingsAnnual,
      eventId: incomingEventId,
      highestValue: incomingHighestValue,
      fbp,
      fbc,
      pageUrl,
    } = body;

    const isWhatsApp = body.source === "whatsapp" || body.origin === "whatsapp";

    // Validation
    const leadName =
      name && typeof name === "string" && name.trim().length >= 2
        ? name.trim()
        : isWhatsApp
        ? "Lead WhatsApp (Interessado Solar)"
        : "";

    if (!leadName && !isWhatsApp) {
      return NextResponse.json(
        { error: "Por favor indique o seu nome completo." },
        { status: 400 }
      );
    }

    const rawPhone = phone || (isWhatsApp ? "351928136297" : "");
    const cleanPhone = (rawPhone || "").replace(/\s+/g, "").replace(/[-().]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      return NextResponse.json(
        { error: "Por favor indique um número de telefone válido com pelo menos 9 dígitos." },
        { status: 400 }
      );
    }

    // 1. Extração do valor mais alto para envio à Meta
    const finalLeadValue =
      Number(incomingHighestValue) > 0
        ? Number(incomingHighestValue)
        : isWhatsApp
        ? 6000
        : extractHighestValue([plannedBudget, monthlyBill, estimatedSavingsAnnual]);

    // 2. Event ID para desduplicação Pixel + Conversions API
    const eventId = incomingEventId || generateEventId();

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const leadData: LeadData = {
      name: leadName,
      phone: phone?.trim() || (isWhatsApp ? "+351 928 136 297 (Origem WhatsApp)" : cleanPhone),
      propertyType: ["residencial", "comercial", "industrial"].includes(propertyType)
        ? propertyType
        : "residencial",
      monthlyBill: monthlyBill || (isWhatsApp ? "Contacto WhatsApp" : "100€ - 250€"),
      plannedBudget: plannedBudget || "3.500€ a 6.000€",
      timeline: timeline || "Imediato (2 a 4 semanas)",
      location: location?.trim() || "",
      estimatedSavingsAnnual: Number(estimatedSavingsAnnual) || undefined,
      notes: body.notes
        ? `${body.notes} | EventID: ${eventId}`
        : isWhatsApp
        ? `Origem: Botão Flutuante WhatsApp | Mensagem: "${body.whatsappMessage || "Pedido Geral de Informações"}" | EventID: ${eventId}`
        : `Valor Estimado: ${finalLeadValue}€ | EventID: ${eventId}`,
      ip: ipAddress,
      userAgent: userAgent,
    };

    const result = await saveLead(leadData);

    // 3. Disparo da Conversions API (CAPI) para a Meta (apenas se não for duplicado recente)
    let capiResult = null;
    if (!(result as any).isDuplicate) {
      try {
        capiResult = await sendMetaConversionsApiEvent({
          eventId,
          value: finalLeadValue,
          currency: "EUR",
          contentName: isWhatsApp
            ? "Lead WhatsApp • Estudo Solar"
            : `Lead Estudo Solar (${leadData.propertyType})`,
          sourceUrl: pageUrl || request.headers.get("referer") || "https://solaris-energia.pt",
          userAgent,
          ipAddress,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
          phone: cleanPhone,
          firstName: leadName ? leadName.split(" ")[0] : "Cliente",
        });
      } catch (capiErr: any) {
        console.error("[Meta CAPI Error in /api/leads]", capiErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: (result as any).isDuplicate
        ? "Contacto reconhecido e atualizado com sucesso!"
        : "Pedido de simulação recebido com sucesso!",
      leadId: result.leadId,
      dbSaved: result.dbSaved,
      emailSent: result.emailSent,
      isDuplicate: (result as any).isDuplicate || false,
      metaCapi: capiResult,
      eventId,
      leadValue: finalLeadValue,
    });
  } catch (error: any) {
    console.error("[API Lead POST Error]", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar o seu pedido. Por favor tente novamente." },
      { status: 500 }
    );
  }
}
