import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Alertes prix de l'utilisateur connecté (les plus récentes d'abord). */
export async function getAlerts() {
  const session = await auth();
  if (!session?.user) return [];
  return prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}
