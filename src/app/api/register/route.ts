import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    name?: string;
  } | null;

  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  const name = body?.name ? String(body.name).trim() : null;

  if (!email.includes("@") || email.length < 5) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, name, passwordHash } });

  return NextResponse.json({ ok: true });
}
