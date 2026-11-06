import { NextRequest, NextResponse } from "next/server";
import {
  getAllLeads,
  updateLeadStatus,
  deleteLead,
  LeadStatus,
  sendLeadAssignmentNotification,
} from "@/lib/leads";
import { verifySessionToken, getAllCrmUsers } from "@/lib/crm-users";

const COOKIE_NAME = "solaris_crm_session";

function getCrmSession(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  return verifySessionToken(session);
}

export async function GET(request: NextRequest) {
  const session = getCrmSession(request);
  if (!session) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const requestedVendor = searchParams.get("vendorId") || undefined;

    // Se for vendedor, só pode ver as suas próprias leads
    // Se for admin, pode filtrar por vendorId específico, por "unassigned" ou ver todas
    let assignedFilter: string | undefined = undefined;
    if (session.role === "vendedor") {
      assignedFilter = session.userId;
    } else if (session.role === "admin" && requestedVendor) {
      assignedFilter = requestedVendor; // pode ser "all", "unassigned", ou o id de um vendedor
      if (assignedFilter === "all") assignedFilter = undefined;
    }

    const leads = await getAllLeads(status, search, assignedFilter);

    // Calcular estatísticas da perspetiva de quem está a aceder
    const allScoped = await getAllLeads(undefined, undefined, assignedFilter);
    const fechadasList = allScoped.filter((l) => l.status === "fechada");
    const totalVolume = fechadasList.reduce((acc, l) => acc + (Number(l.closedValue) || 0), 0);
    const totalCommission = fechadasList.reduce((acc, l) => acc + (Number(l.commissionValue) || 0), 0);

    const stats = {
      total: allScoped.length,
      novas: allScoped.filter((l) => (l.status || "nova") === "nova").length,
      contactadas: allScoped.filter((l) => l.status === "contactada").length,
      fechadas: fechadasList.length,
      totalVolume,
      totalCommission,
    };

    return NextResponse.json({
      success: true,
      currentUser: session,
      stats,
      leads,
    });
  } catch (err: any) {
    console.error("[CRM Leads GET Error]", err);
    return NextResponse.json({ error: "Erro ao carregar leads." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = getCrmSession(request);
  if (!session) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      status,
      notes,
      closedValue,
      commissionValue,
      assignedTo,
      assignedName,
      notifyEmail,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID de lead obrigatório." },
        { status: 400 }
      );
    }

    // Se for vendedor, verificar se a lead pertence ao vendedor
    if (session.role === "vendedor") {
      const all = await getAllLeads(undefined, undefined, session.userId);
      const ownsLead = all.some((l) => l.id === id);
      if (!ownsLead) {
        return NextResponse.json(
          { error: "Não tem permissão para editar esta lead." },
          { status: 403 }
        );
      }
    }

    // Apenas Admin pode atribuir/re-atribuir leads a outros vendedores
    let targetAssignedTo = undefined;
    let targetAssignedName = undefined;

    if (session.role === "admin" && assignedTo !== undefined) {
      targetAssignedTo = assignedTo; // pode ser null ou string
      targetAssignedName = assignedName;
    }

    const updated = await updateLeadStatus(
      id,
      (status as LeadStatus) || "nova",
      notes,
      closedValue !== undefined ? Number(closedValue) : undefined,
      commissionValue !== undefined ? Number(commissionValue) : undefined,
      targetAssignedTo,
      targetAssignedName
    );

    if (!updated) {
      return NextResponse.json({ error: "Lead não encontrada." }, { status: 404 });
    }

    // Notificar vendedor por email caso tenha sido atribuído pelo Admin
    let emailStatus = { attempted: false, sent: false, reason: "" };
    if (session.role === "admin" && targetAssignedTo && notifyEmail !== false) {
      emailStatus.attempted = true;
      try {
        const users = await getAllCrmUsers();
        const vendor = users.find((u) => u.id === targetAssignedTo);
        if (vendor && vendor.email) {
          const leadList = await getAllLeads();
          const targetLead = leadList.find((l) => l.id === id);
          if (targetLead) {
            const sent = await sendLeadAssignmentNotification({
              lead: targetLead,
              vendorName: vendor.name,
              vendorEmail: vendor.email,
            });
            emailStatus.sent = sent;
            if (!sent) {
              emailStatus.reason = "RESEND_API_KEY não configurada no servidor ou erro de entrega no Resend.";
            }
          }
        } else {
          emailStatus.reason = "Vendedor não possui email configurado.";
        }
      } catch (err: any) {
        console.warn("[Email Notification Exception]", err);
        emailStatus.reason = err?.message || "Exceção no envio de email.";
      }
    }

    return NextResponse.json({
      success: true,
      message: `Lead atualizada com sucesso.`,
      emailStatus,
    });
  } catch (err: any) {
    console.error("[CRM Leads PATCH Error]", err);
    return NextResponse.json({ error: "Erro ao atualizar lead." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = getCrmSession(request);
  if (!session) {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de lead obrigatório." }, { status: 400 });
    }

    // Se for vendedor, verificar se tem posse da lead
    if (session.role === "vendedor") {
      const all = await getAllLeads(undefined, undefined, session.userId);
      const ownsLead = all.some((l) => l.id === id);
      if (!ownsLead) {
        return NextResponse.json(
          { error: "Não tem permissão para eliminar esta lead." },
          { status: 403 }
        );
      }
    }

    const deleted = await deleteLead(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error("[CRM Leads DELETE Error]", err);
    return NextResponse.json({ error: "Erro ao eliminar lead." }, { status: 500 });
  }
}
