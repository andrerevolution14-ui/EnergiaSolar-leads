import { NextRequest, NextResponse } from "next/server";

const VALID_USER = process.env.CRM_USER || "tecnergy";
const VALID_PASS = process.env.CRM_PASS || "2005";
const COOKIE_NAME = "solaris_crm_session";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === VALID_USER && password === VALID_PASS) {
      const response = NextResponse.json({
        success: true,
        user: { username: VALID_USER, role: "admin" },
      });

      // Set cookie (valid for 7 days)
      response.cookies.set(COOKIE_NAME, "auth_valid_tecnergy_2005", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Credenciais inválidas. Verifique o utilizador e a palavra-passe." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Erro interno de autenticação." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = session === "auth_valid_tecnergy_2005";

  if (!isAuthenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user: { username: VALID_USER, role: "admin" } });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Sessão encerrada com sucesso." });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
