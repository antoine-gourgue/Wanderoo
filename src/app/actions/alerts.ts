"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const TYPE_MAP = { vol: "FLIGHT", hotel: "HOTEL", car: "CAR" } as const;
type TripKey = keyof typeof TYPE_MAP;

export type CreateAlertResult = { ok: true } | { error: "auth" | "exists" };

export async function createAlert(input: {
  type: TripKey;
  origin?: string;
  destination: string;
  lastPrice?: number;
}): Promise<CreateAlertResult> {
  const session = await auth();
  if (!session?.user) return { error: "auth" };
  const userId = session.user.id;
  const type = TYPE_MAP[input.type];

  const existing = await prisma.priceAlert.findFirst({
    where: { userId, type, origin: input.origin ?? null, destination: input.destination, active: true },
  });
  if (existing) return { error: "exists" };

  await prisma.priceAlert.create({
    data: {
      userId,
      type,
      origin: input.origin ?? null,
      destination: input.destination,
      lastPrice: input.lastPrice ?? null,
    },
  });
  revalidatePath("/alertes");
  return { ok: true };
}

export async function deleteAlert(id: string): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user) return { ok: false };
  await prisma.priceAlert.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/alertes");
  return { ok: true };
}
