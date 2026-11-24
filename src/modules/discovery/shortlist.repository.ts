import Shortlist from "./models/shortlist.model.ts";
import type { IShortlist } from "../../shared/types/database.types.ts";

/**
 * Repository for Shortlist documents. All methods return plain objects, never raw
 * Mongoose documents.
 */

export async function findOne(filter: Record<string, any>): Promise<IShortlist | null> {
  const doc = await Shortlist.findOne(filter).lean<IShortlist>();
  return doc || null;
}

export async function create(data: Partial<IShortlist>): Promise<IShortlist> {
  const doc = await Shortlist.create(data);
  return doc.toObject() as IShortlist;
}

export async function deleteOne(filter: Record<string, any>): Promise<number> {
  const result = await Shortlist.deleteOne(filter);
  return result.deletedCount;
}

export async function findMany(
  filter: Record<string, any>,
  options: {
    sort?: Record<string, 1 | -1 | "asc" | "desc">;
    select?: string | Record<string, 0 | 1 | boolean>;
  } = {}
): Promise<IShortlist[]> {
  let query = Shortlist.find(filter);
  if (options.sort) {
    query = query.sort(options.sort);
  }
  if (options.select) {
    query = query.select(options.select);
  }
  return query.lean<IShortlist[]>();
}

export async function count(filter: Record<string, any>): Promise<number> {
  return Shortlist.countDocuments(filter);
}

const shortlistRepository = {
  findOne,
  create,
  deleteOne,
  findMany,
  count,
};

export default shortlistRepository;
