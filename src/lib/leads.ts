import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export type LeadStatus = "nova" | "contactada" | "fechada";

export interface LeadData {
  id?: string;
  name: string;
  phone: string;
  propertyType: "residencial" | "comercial" | "industrial";
  monthlyBill: string;
  plannedBudget?: string;
  timeline?: string;
  location?: string;
  status?: LeadStatus;
  notes?: string;
  estimatedSavingsAnnual?: number;
  closedValue?: number;
  commissionValue?: number;
  ip?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("user:password@host")) {
    return null;
  }
  return neon(databaseUrl);
}

export async function saveLead(data: LeadData) {
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();
  const status: LeadStatus = data.status || "nova";
  const enrichedLead: LeadData = {
    ...data,
    id: leadId,
    status,
    notes: data.notes || "",
    createdAt,
    updatedAt: createdAt,
  };

  let dbSaved = false;
  let emailSent = false;
  let errorDetails: string[] = [];

  // 1. Neon Database Storage
  const sql = getDb();
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS solar_leads (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          property_type VARCHAR(50) DEFAULT 'residencial',
          monthly_bill VARCHAR(50),
          planned_budget VARCHAR(80),
          timeline VARCHAR(80),
          location VARCHAR(100),
          status VARCHAR(30) DEFAULT 'nova',
          notes TEXT DEFAULT '',
          estimated_savings_annual NUMERIC,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        INSERT INTO solar_leads (
          id, name, phone, property_type, monthly_bill, planned_budget, timeline, location, status, notes, estimated_savings_annual, created_at, updated_at
        ) VALUES (
          ${leadId},
          ${enrichedLead.name},
          ${enrichedLead.phone},
          ${enrichedLead.propertyType},
          ${enrichedLead.monthlyBill},
          ${enrichedLead.plannedBudget || null},
          ${enrichedLead.timeline || null},
          ${enrichedLead.location || ""},
          ${status},
          ${enrichedLead.notes || ""},
          ${enrichedLead.estimatedSavingsAnnual || null},
          ${createdAt},
          ${createdAt}
        );
      `;
      dbSaved = true;
    } catch (err: any) {
      console.error("[Leads DB Error]", err?.message || err);
      errorDetails.push(`DB Error: ${err?.message || "Neon error"}`);
    }
  }

  // Fallback to local storage
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const leadsFile = path.join(dataDir, "leads.json");
    let existingLeads: LeadData[] = [];
    if (fs.existsSync(leadsFile)) {
      try {
        existingLeads = JSON.parse(fs.readFileSync(leadsFile, "utf-8"));
      } catch {
        existingLeads = [];
      }
    }
    existingLeads.unshift(enrichedLead);
    fs.writeFileSync(leadsFile, JSON.stringify(existingLeads, null, 2));
    if (!dbSaved) dbSaved = true;
  } catch (fsErr: any) {
    console.error("[Leads Local Fallback Error]", fsErr?.message || fsErr);
  }

  // 2. Resend Email Notification
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL || "leads@solaris-energia.pt";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Solaris Leads <onboarding@resend.dev>";

  if (resendApiKey && !resendApiKey.includes("re_your_api_key")) {
    try {
      const resend = new Resend(resendApiKey);
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #1e40af 100%); padding: 20px; border-radius: 8px; color: white; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 700;">☀️ Nova Lead de Energia Solar</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Contacto qualificado e pronto para fecho comercial</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600; width: 40%;">Nome:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 700; font-size: 16px;">${enrichedLead.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Telefone Verificado:</td>
              <td style="padding: 12px 0; color: #0284c7; font-weight: 700; font-size: 18px;">
                <a href="tel:${enrichedLead.phone}" style="color: #0284c7; text-decoration: none;">${enrichedLead.phone}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Tipo de Imóvel:</td>
              <td style="padding: 12px 0; color: #0f172a; text-transform: capitalize;">${enrichedLead.propertyType}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Fatura Mensal:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600;">${enrichedLead.monthlyBill}</td>
            </tr>
            ${enrichedLead.plannedBudget ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Orçamento Previsto:</td>
              <td style="padding: 12px 0; color: #0284c7; font-weight: 700;">${enrichedLead.plannedBudget}</td>
            </tr>` : ""}
            ${enrichedLead.timeline ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Prazo de Instalação:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600;">${enrichedLead.timeline}</td>
            </tr>` : ""}
            ${enrichedLead.location ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Concelho / Localidade:</td>
              <td style="padding: 12px 0; color: #0f172a;">${enrichedLead.location}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Data do Pedido:</td>
              <td style="padding: 12px 0; color: #64748b; font-size: 13px;">${new Date().toLocaleString("pt-PT")}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 14px; text-align: center;">
            <a href="tel:${enrichedLead.phone}" style="display: inline-block; background-color: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
              Ligar para ${enrichedLead.name}
            </a>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `⚡ Nova Lead Solar (${enrichedLead.propertyType}): ${enrichedLead.name} — ${enrichedLead.phone}`,
        html: emailHtml,
      });
      emailSent = true;
    } catch (resendErr: any) {
      console.error("[Resend Error]", resendErr?.message || resendErr);
      errorDetails.push(`Email Error: ${resendErr?.message || "Resend error"}`);
    }
  }

  return {
    success: true,
    leadId,
    dbSaved,
    emailSent,
    isLocalFallback: !sql,
    warning: errorDetails.length > 0 ? errorDetails.join("; ") : undefined,
  };
}

export async function getAllLeads(statusFilter?: string, searchQuery?: string): Promise<LeadData[]> {
  const sql = getDb();
  if (sql) {
    try {
      let query = "SELECT * FROM solar_leads";
      const conditions: string[] = [];

      if (statusFilter && statusFilter !== "todas") {
        conditions.push(`status = '${statusFilter.replace(/'/g, "''")}'`);
      }
      if (searchQuery && searchQuery.trim()) {
        const clean = searchQuery.trim().replace(/'/g, "''");
        conditions.push(`(name ILIKE '%${clean}%' OR phone ILIKE '%${clean}%' OR location ILIKE '%${clean}%')`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += " ORDER BY created_at DESC";

      const rows: any[] = await sql.query(query);
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        propertyType: r.property_type,
        monthlyBill: r.monthly_bill,
        plannedBudget: r.planned_budget,
        timeline: r.timeline,
        location: r.location,
        status: (r.status as LeadStatus) || "nova",
        notes: r.notes || "",
        estimatedSavingsAnnual: r.estimated_savings_annual ? Number(r.estimated_savings_annual) : undefined,
        closedValue: r.closed_value !== null && r.closed_value !== undefined ? Number(r.closed_value) : undefined,
        commissionValue: r.commission_value !== null && r.commission_value !== undefined ? Number(r.commission_value) : undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      }));
    } catch (err) {
      console.error("[getAllLeads DB Error]", err);
    }
  }

  // Fallback to local data
  try {
    const dataDir = path.join(process.cwd(), "data");
    const leadsFile = path.join(dataDir, "leads.json");
    if (fs.existsSync(leadsFile)) {
      let leads: LeadData[] = JSON.parse(fs.readFileSync(leadsFile, "utf-8"));
      if (statusFilter && statusFilter !== "todas") {
        leads = leads.filter((l) => (l.status || "nova") === statusFilter);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        leads = leads.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.phone.toLowerCase().includes(q) ||
            (l.location && l.location.toLowerCase().includes(q))
        );
      }
      return leads;
    }
  } catch (fsErr) {
    console.error("[getAllLeads Local Fallback Error]", fsErr);
  }

  return [];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string,
  closedValue?: number,
  commissionValue?: number
): Promise<boolean> {
  const sql = getDb();
  const now = new Date().toISOString();

  let updated = false;
  if (sql) {
    try {
      const setParts: string[] = [`status = '${status}'`, `updated_at = NOW()`];
      if (notes !== undefined) {
        setParts.push(`notes = '${notes.replace(/'/g, "''")}'`);
      }
      if (closedValue !== undefined) {
        setParts.push(`closed_value = ${isNaN(Number(closedValue)) ? "NULL" : Number(closedValue)}`);
      }
      if (commissionValue !== undefined) {
        setParts.push(`commission_value = ${isNaN(Number(commissionValue)) ? "NULL" : Number(commissionValue)}`);
      }

      await sql.query(`UPDATE solar_leads SET ${setParts.join(", ")} WHERE id = '${id.replace(/'/g, "''")}'`);
      updated = true;
    } catch (err) {
      console.error("[updateLeadStatus DB Error]", err);
    }
  }

  // Always sync local fallback
  try {
    const dataDir = path.join(process.cwd(), "data");
    const leadsFile = path.join(dataDir, "leads.json");
    if (fs.existsSync(leadsFile)) {
      let leads: LeadData[] = JSON.parse(fs.readFileSync(leadsFile, "utf-8"));
      const idx = leads.findIndex((l) => l.id === id);
      if (idx !== -1) {
        leads[idx].status = status;
        if (notes !== undefined) leads[idx].notes = notes;
        if (closedValue !== undefined) leads[idx].closedValue = Number(closedValue);
        if (commissionValue !== undefined) leads[idx].commissionValue = Number(commissionValue);
        leads[idx].updatedAt = now;
        fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
        updated = true;
      }
    }
  } catch (fsErr) {
    console.error("[updateLeadStatus Local Error]", fsErr);
  }

  return updated;
}

export async function deleteLead(id: string): Promise<boolean> {
  const sql = getDb();
  let deleted = false;
  if (sql) {
    try {
      await sql`DELETE FROM solar_leads WHERE id = ${id}`;
      deleted = true;
    } catch (err) {
      console.error("[deleteLead DB Error]", err);
    }
  }

  try {
    const dataDir = path.join(process.cwd(), "data");
    const leadsFile = path.join(dataDir, "leads.json");
    if (fs.existsSync(leadsFile)) {
      let leads: LeadData[] = JSON.parse(fs.readFileSync(leadsFile, "utf-8"));
      leads = leads.filter((l) => l.id !== id);
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2));
      deleted = true;
    }
  } catch (fsErr) {
    console.error("[deleteLead Local Error]", fsErr);
  }

  return deleted;
}
