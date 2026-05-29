import type { FavoritesRepository } from "@/lib/db/repositories/favorites-repository";
import { prisma } from "@/lib/db/prisma";

export class PrismaFavoritesRepository implements FavoritesRepository {
  async list(userId: string) {
    const rows = await prisma.userFavorite.findMany({ where: { userId } });
    return rows.map((r) => r.hotelId);
  }

  async add(userId: string, hotelId: string) {
    await prisma.userFavorite.upsert({
      where: { userId_hotelId: { userId, hotelId } },
      create: { userId, hotelId },
      update: {},
    });
    return this.list(userId);
  }

  async remove(userId: string, hotelId: string) {
    await prisma.userFavorite.deleteMany({ where: { userId, hotelId } });
    return this.list(userId);
  }

  async merge(userId: string, hotelIds: string[]) {
    for (const hotelId of hotelIds) {
      await prisma.userFavorite.upsert({
        where: { userId_hotelId: { userId, hotelId } },
        create: { userId, hotelId },
        update: {},
      });
    }
    return this.list(userId);
  }
}
