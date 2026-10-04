import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export interface LeadData {
  id?: string;
  name: string;
  phone: string;
  propertyType: "residencial" | "comercial" | "industrial";
  monthlyBill: string;
  plannedBudget?: string;
  timeline?: string;
  mainGoal?: string;
  hasBatteryInterest?: string;
  location?: string;
  estimatedSavingsAnnual?: number;
  ip?: string;
  userAgent?: string;
  createdAt?: string;
}

export async function saveLead(data: LeadData) {
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = new Date().toISOString();
  const enrichedLead: LeadData = {
    ...data,
    id: leadId,
    createdAt,
  };

  let dbSaved = false;
  let emailSent = false;
  let errorDetails: string[] = [];

  // 1. Neon Database Storage
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.includes("user:password@host")) {
    try {
      const sql = neon(databaseUrl);
      // Auto-create table if needed with extra qualification columns
      await sql`
        CREATE TABLE IF NOT EXISTS solar_leads (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          property_type VARCHAR(50) NOT NULL,
          monthly_bill VARCHAR(50),
          planned_budget VARCHAR(80),
          timeline VARCHAR(80),
          main_goal VARCHAR(120),
          battery_interest VARCHAR(50),
          location VARCHAR(100),
          estimated_savings_annual NUMERIC,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      await sql`
        INSERT INTO solar_leads (
          id, name, phone, property_type, monthly_bill, planned_budget, timeline, main_goal, battery_interest, location, estimated_savings_annual, created_at
        ) VALUES (
          ${leadId},
          ${enrichedLead.name},
          ${enrichedLead.phone},
          ${enrichedLead.propertyType},
          ${enrichedLead.monthlyBill},
          ${enrichedLead.plannedBudget || null},
          ${enrichedLead.timeline || null},
          ${enrichedLead.mainGoal || null},
          ${enrichedLead.hasBatteryInterest || null},
          ${enrichedLead.location || ""},
          ${enrichedLead.estimatedSavingsAnnual || null},
          ${createdAt}
        );
      `;
      dbSaved = true;
    } catch (err: any) {
      console.error("[Leads DB Error]", err?.message || err);
      errorDetails.push(`DB Error: ${err?.message || "Neon error"}`);
    }
  }

  // Fallback to local storage if Neon is not set or failed
  if (!dbSaved) {
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
      dbSaved = true;
    } catch (fsErr: any) {
      console.error("[Leads Local Fallback Error]", fsErr?.message || fsErr);
    }
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
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Contacto verificado e pronto para avaliação imediata</p>
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
            ${enrichedLead.mainGoal ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Objetivo Principal:</td>
              <td style="padding: 12px 0; color: #0f172a; font-weight: 600;">${enrichedLead.mainGoal}</td>
            </tr>` : ""}
            ${enrichedLead.location ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Localidade:</td>
              <td style="padding: 12px 0; color: #0f172a;">${enrichedLead.location}</td>
            </tr>` : ""}
            ${enrichedLead.estimatedSavingsAnnual ? `
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; color: #64748b; font-weight: 600;">Poupança Estimada / Ano:</td>
              <td style="padding: 12px 0; color: #16a34a; font-weight: 700; font-size: 16px;">~${enrichedLead.estimatedSavingsAnnual}€ / ano</td>
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
    isLocalFallback: !databaseUrl,
    warning: errorDetails.length > 0 ? errorDetails.join("; ") : undefined,
  };
}
