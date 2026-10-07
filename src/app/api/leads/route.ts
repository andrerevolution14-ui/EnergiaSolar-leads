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

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Por favor indique o seu nome completo." },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || "").replace(/\s+/g, "").replace(/[-().]/g, "");
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
        : extractHighestValue([plannedBudget, monthlyBill, estimatedSavingsAnnual]);

    // 2. Event ID para desduplicação Pixel + Conversions API
    const eventId = incomingEventId || generateEventId();

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const leadData: LeadData = {
      name: name.trim(),
      phone: phone.trim(),
      propertyType: ["residencial", "comercial", "industrial"].includes(propertyType)
        ? propertyType
        : "residencial",
      monthlyBill: monthlyBill || "100€ - 250€",
      plannedBudget: plannedBudget || "3.500€ a 6.000€",
      timeline: timeline || "Imediato (2 a 4 semanas)",
      location: location?.trim() || "",
      estimatedSavingsAnnual: Number(estimatedSavingsAnnual) || undefined,
      notes: `Valor Estimado: ${finalLeadValue}€ | EventID: ${eventId}`,
      ip: ipAddress,
      userAgent: userAgent,
    };

    const result = await saveLead(leadData);

    // 3. Disparo da Conversions API (CAPI) para a Meta
    let capiResult = null;
    try {
      capiResult = await sendMetaConversionsApiEvent({
        eventId,
        value: finalLeadValue,
        currency: "EUR",
        contentName: `Lead Estudo Solar (${leadData.propertyType})`,
        sourceUrl: pageUrl || request.headers.get("referer") || "https://solaris-energia.pt",
        userAgent,
        ipAddress,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        phone: cleanPhone,
        firstName: name.trim().split(" ")[0],
      });
    } catch (capiErr: any) {
      console.error("[Meta CAPI Error in /api/leads]", capiErr);
    }

    return NextResponse.json({
      success: true,
      message: "Pedido de simulação recebido com sucesso!",
      leadId: result.leadId,
      dbSaved: result.dbSaved,
      emailSent: result.emailSent,
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
