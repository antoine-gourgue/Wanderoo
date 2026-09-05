import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Slugs des destinations mises en favori par l'utilisateur connecté. */
export async function getFavoriteSlugs(): Promise<Set<string>> {
  const session = await auth();
  if (!session?.user) return new Set();
  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { slug: true },
  });
  return new Set(favs.map((f) => f.slug));
}

/** Favoris complets de l'utilisateur connecté (les plus récents d'abord). */
export async function getFavorites() {
  const session = await auth();
  if (!session?.user) return [];
  return prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}
