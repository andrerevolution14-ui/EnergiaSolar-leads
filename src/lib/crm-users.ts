import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface CrmUser {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hash
  name: string;
  email: string;
  role: "admin" | "vendedor";
  createdAt: string;
  updatedAt: string;
}

export interface CrmSessionData {
  userId: string;
  username: string;
  name: string;
  role: "admin" | "vendedor";
}

const CRM_SECRET = process.env.CRM_SECRET || "solar_crm_secure_token_tecnergy_2005";
const ADMIN_USER = process.env.CRM_USER || "tecnergy";
const ADMIN_PASS = process.env.CRM_PASS || "2005";

function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes("user:password@host")) {
    return null;
  }
  return neon(databaseUrl);
}

export function hashPassword(plainText: string): string {
  return crypto.createHash("sha256").update(plainText).digest("hex");
}

export function createSessionToken(user: { id: string; username: string; name: string; role: "admin" | "vendedor" }): string {
  const payload = JSON.stringify({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    ts: Date.now(),
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  const signature = crypto.createHmac("sha256", CRM_SECRET).update(encodedPayload).digest("hex");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): CrmSessionData | null {
  if (!token) return null;

  // Retrocompatibilidade com token legado da sessão do dono
  if (token === "auth_valid_tecnergy_2005") {
    return {
      userId: "admin_tecnergy",
      username: ADMIN_USER,
      name: "Administrador (Tecnergy)",
      role: "admin",
    };
  }

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;

  const expectedSig = crypto.createHmac("sha256", CRM_SECRET).update(encodedPayload).digest("hex");
  if (signature !== expectedSig) return null;

  try {
    const raw = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const data = JSON.parse(raw);
    if (!data.username || !data.role) return null;
    return {
      userId: data.userId || (data.role === "admin" ? "admin_tecnergy" : data.username),
      username: data.username,
      name: data.name || data.username,
      role: data.role,
    };
  } catch {
    return null;
  }
}

// Inicializar tabela de utilizadores no Neon DB e fallback local
async function initUsersTable() {
  const sql = getDb();
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS solar_crm_users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(30) DEFAULT 'vendedor',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
    } catch (err) {
      console.error("[initUsersTable DB Error]", err);
    }
  }

  // Garantir diretoria e ficheiro local data/users.json
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const usersFile = path.join(dataDir, "users.json");
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }
  } catch (fsErr) {
    console.error("[initUsersTable Local Fallback Error]", fsErr);
  }
}

// Obter todos os utilizadores (vendedores)
export async function getAllCrmUsers(): Promise<CrmUser[]> {
  await initUsersTable();
  const sql = getDb();
  if (sql) {
    try {
      const rows: any[] = await sql`
        SELECT * FROM solar_crm_users
        ORDER BY created_at ASC;
      `;
      return rows.map((r) => ({
        id: r.id,
        username: r.username,
        passwordHash: r.password_hash,
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.error("[getAllCrmUsers DB Error]", err);
    }
  }

  // Fallback local
  try {
    const dataDir = path.join(process.cwd(), "data");
    const usersFile = path.join(dataDir, "users.json");
    if (fs.existsSync(usersFile)) {
      return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    }
  } catch (fsErr) {
    console.error("[getAllCrmUsers Local Error]", fsErr);
  }

  return [];
}

// Procurar utilizador por username
export async function findCrmUserByUsername(username: string): Promise<CrmUser | null> {
  const cleanUsername = username.trim().toLowerCase();

  // Caso especial: Conta Principal Admin (tecnergy)
  if (cleanUsername === ADMIN_USER.toLowerCase()) {
    return {
      id: "admin_tecnergy",
      username: ADMIN_USER,
      passwordHash: hashPassword(ADMIN_PASS),
      name: "Administrador (Tecnergy)",
      email: process.env.NOTIFICATION_EMAIL || "andrerevolution14@gmail.com",
      role: "admin",
      createdAt: new Date("2026-01-01").toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const users = await getAllCrmUsers();
  const found = users.find((u) => u.username.toLowerCase() === cleanUsername);
  return found || null;
}

// Criar novo utilizador (vendedor)
export async function createCrmUser(data: {
  username: string;
  password: string;
  name: string;
  email: string;
  role?: "vendedor" | "admin";
}): Promise<{ success: boolean; user?: CrmUser; error?: string }> {
  const username = data.username.trim().toLowerCase();
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();
  const role = data.role || "vendedor";

  if (!username || username.length < 3) {
    return { success: false, error: "O utilizador deve ter pelo menos 3 caracteres." };
  }
  if (!data.password || data.password.length < 4) {
    return { success: false, error: "A palavra-passe deve ter pelo menos 4 caracteres." };
  }
  if (!name || name.length < 2) {
    return { success: false, error: "Indique o nome completo do vendedor." };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "Indique um email válido para o vendedor." };
  }

  if (username === ADMIN_USER.toLowerCase()) {
    return { success: false, error: "Este nome de utilizador está reservado para a conta principal." };
  }

  const existing = await findCrmUserByUsername(username);
  if (existing) {
    return { success: false, error: "Já existe uma conta com este nome de utilizador." };
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const passwordHash = hashPassword(data.password);
  const now = new Date().toISOString();

  const newUser: CrmUser = {
    id: userId,
    username,
    passwordHash,
    name,
    email,
    role,
    createdAt: now,
    updatedAt: now,
  };

  const sql = getDb();
  if (sql) {
    try {
      await initUsersTable();
      await sql`
        INSERT INTO solar_crm_users (id, username, password_hash, name, email, role, created_at, updated_at)
        VALUES (${userId}, ${username}, ${passwordHash}, ${name}, ${email}, ${role}, ${now}, ${now});
      `;
    } catch (err: any) {
      console.error("[createCrmUser DB Error]", err);
      return { success: false, error: err?.message || "Erro ao criar utilizador na base de dados." };
    }
  }

  // Sincronizar fallback local
  try {
    const dataDir = path.join(process.cwd(), "data");
    const usersFile = path.join(dataDir, "users.json");
    let list: CrmUser[] = [];
    if (fs.existsSync(usersFile)) {
      list = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    }
    list.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(list, null, 2));
  } catch (fsErr) {
    console.error("[createCrmUser Local Error]", fsErr);
  }

  return { success: true, user: newUser };
}

// Eliminar utilizador (vendedor)
export async function deleteCrmUser(userId: string): Promise<boolean> {
  if (userId === "admin_tecnergy") return false;

  const sql = getDb();
  if (sql) {
    try {
      await sql`DELETE FROM solar_crm_users WHERE id = ${userId};`;
    } catch (err) {
      console.error("[deleteCrmUser DB Error]", err);
    }
  }

  try {
    const dataDir = path.join(process.cwd(), "data");
    const usersFile = path.join(dataDir, "users.json");
    if (fs.existsSync(usersFile)) {
      let list: CrmUser[] = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      list = list.filter((u) => u.id !== userId);
      fs.writeFileSync(usersFile, JSON.stringify(list, null, 2));
    }
  } catch (fsErr) {
    console.error("[deleteCrmUser Local Error]", fsErr);
  }

  return true;
}

