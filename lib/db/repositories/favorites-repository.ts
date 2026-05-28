import { readJson, writeJson } from "@/lib/db/file-store";

const FILE = "favorites.json";

type FavoritesDb = Record<string, string[]>;

export interface FavoritesRepository {
  list(userId: string): Promise<string[]>;
  add(userId: string, hotelId: string): Promise<string[]>;
  remove(userId: string, hotelId: string): Promise<string[]>;
  merge(userId: string, hotelIds: string[]): Promise<string[]>;
}

export class FileFavoritesRepository implements FavoritesRepository {
  private async db(): Promise<FavoritesDb> {
    return readJson<FavoritesDb>(FILE, {});
  }

  private async save(db: FavoritesDb) {
    await writeJson(FILE, db);
  }

  async list(userId: string) {
    const db = await this.db();
    return db[userId] ?? [];
  }

  async add(userId: string, hotelId: string) {
    const db = await this.db();
    const set = new Set(db[userId] ?? []);
    set.add(hotelId);
    db[userId] = [...set];
    await this.save(db);
    return db[userId];
  }

  async remove(userId: string, hotelId: string) {
    const db = await this.db();
    db[userId] = (db[userId] ?? []).filter((id) => id !== hotelId);
    await this.save(db);
    return db[userId];
  }

  async merge(userId: string, hotelIds: string[]) {
    const db = await this.db();
    const set = new Set([...(db[userId] ?? []), ...hotelIds]);
    db[userId] = [...set];
    await this.save(db);
    return db[userId];
  }
}

export const favoritesRepository: FavoritesRepository = new FileFavoritesRepository();
