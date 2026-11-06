import { NextRequest, NextResponse } from "next/server";
import {
  findCrmUserByUsername,
  hashPassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/crm-users";

const COOKIE_NAME = "solaris_crm_session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Por favor indique o utilizador e a palavra-passe." },
        { status: 400 }
      );
    }

    const user = await findCrmUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o utilizador e a palavra-passe." },
        { status: 401 }
      );
    }

    const hashedInput = hashPassword(password);
    if (hashedInput !== user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o utilizador e a palavra-passe." },
        { status: 401 }
      );
    }

    // Criar token assinado de sessão (válido para admin e vendedor)
    const token = createSessionToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Guardar cookie HTTP-only por 7 dias
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[CRM Auth POST Error]", error);
    return NextResponse.json({ error: "Erro interno de autenticação." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = verifySessionToken(sessionCookie);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
      role: session.role,
    },
  });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Sessão encerrada com sucesso." });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
