import { NextRequest, NextResponse } from "next/server";
import { saveLead, LeadData } from "@/lib/leads";

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
      ip: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    };

    const result = await saveLead(leadData);

    return NextResponse.json({
      success: true,
      message: "Pedido de simulação recebido com sucesso!",
      leadId: result.leadId,
      dbSaved: result.dbSaved,
      emailSent: result.emailSent,
    });
  } catch (error: any) {
    console.error("[API Lead POST Error]", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar o seu pedido. Por favor tente novamente." },
      { status: 500 }
    );
  }
}
