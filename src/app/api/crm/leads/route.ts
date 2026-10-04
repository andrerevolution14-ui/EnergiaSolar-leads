import { NextRequest, NextResponse } from "next/server";
import { getAllLeads, updateLeadStatus, deleteLead, LeadStatus } from "@/lib/leads";

const COOKIE_NAME = "solaris_crm_session";

function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return session === "auth_valid_tecnergy_2005";
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const leads = await getAllLeads(status, search);

    // Calculate pipeline statistics
    const all = await getAllLeads();
    const stats = {
      total: all.length,
      novas: all.filter((l) => (l.status || "nova") === "nova").length,
      contactadas: all.filter((l) => l.status === "contactada").length,
      fechadas: all.filter((l) => l.status === "fechada").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      leads,
    });
  } catch (err: any) {
    console.error("[CRM Leads GET Error]", err);
    return NextResponse.json({ error: "Erro ao carregar leads." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { id, status, notes } = await request.json();

    if (!id || !["nova", "contactada", "fechada"].includes(status)) {
      return NextResponse.json(
        { error: "Dados inválidos para atualização de estado." },
        { status: 400 }
      );
    }

    const updated = await updateLeadStatus(id, status as LeadStatus, notes);

    if (!updated) {
      return NextResponse.json({ error: "Lead não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Lead atualizada para ${status}.`,
    });
  } catch (err: any) {
    console.error("[CRM Leads PATCH Error]", err);
    return NextResponse.json({ error: "Erro ao atualizar lead." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de lead obrigatório." }, { status: 400 });
    }

    const deleted = await deleteLead(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ error: "Erro ao eliminar lead." }, { status: 500 });
  }
}
