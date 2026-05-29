import { PrismaFavoritesRepository } from "@/lib/db/repositories/prisma/favorites-repository";

export interface FavoritesRepository {
  list(userId: string): Promise<string[]>;
  add(userId: string, hotelId: string): Promise<string[]>;
  remove(userId: string, hotelId: string): Promise<string[]>;
  merge(userId: string, hotelIds: string[]): Promise<string[]>;
}

export const favoritesRepository: FavoritesRepository = new PrismaFavoritesRepository();
