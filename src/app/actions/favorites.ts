"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ToggleResult = { saved: boolean } | { error: "auth" };

export async function toggleFavorite(input: {
  slug: string;
  label: string;
  imageUrl?: string;
}): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user) return { error: "auth" };
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_slug: { userId, slug: input.slug } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/favoris");
    return { saved: false };
  }

  await prisma.favorite.create({
    data: {
      userId,
      slug: input.slug,
      label: input.label,
      imageUrl: input.imageUrl ?? null,
    },
  });
  revalidatePath("/favoris");
  return { saved: true };
}
