import { NextRequest, NextResponse } from "next/server";
import {
  getAllCrmUsers,
  createCrmUser,
  deleteCrmUser,
  verifySessionToken,
} from "@/lib/crm-users";

const COOKIE_NAME = "solaris_crm_session";

function getAdminSession(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  const admin = getAdminSession(request);
  if (!admin) {
    return NextResponse.json(
      { error: "Acesso reservado ao administrador do CRM." },
      { status: 403 }
    );
  }

  try {
    const users = await getAllCrmUsers();
    // Não expor os hashes de password
    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (err: any) {
    console.error("[CRM Users GET Error]", err);
    return NextResponse.json({ error: "Erro ao carregar utilizadores." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = getAdminSession(request);
  if (!admin) {
    return NextResponse.json(
      { error: "Acesso reservado ao administrador do CRM." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { username, password, name, email } = body;

    const result = await createCrmUser({
      username,
      password,
      name,
      email,
      role: "vendedor",
    });

    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || "Erro ao criar utilizador." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Conta de vendedor criada para ${result.user.name}.`,
      user: {
        id: result.user.id,
        username: result.user.username,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        createdAt: result.user.createdAt,
      },
    });
  } catch (err: any) {
    console.error("[CRM Users POST Error]", err);
    return NextResponse.json({ error: "Erro ao processar criação de utilizador." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = getAdminSession(request);
  if (!admin) {
    return NextResponse.json(
      { error: "Acesso reservado ao administrador do CRM." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "ID de utilizador obrigatório." }, { status: 400 });
    }

    const success = await deleteCrmUser(userId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("[CRM Users DELETE Error]", err);
    return NextResponse.json({ error: "Erro ao eliminar utilizador." }, { status: 500 });
  }
}

