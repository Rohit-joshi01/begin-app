import Follow from "./models/follow.model.js";
import type { IFollow } from "../../shared/types/database.types.js";

/**
 * Repository for Follow documents. All methods return plain objects, never raw
 * Mongoose documents.
 */

export async function findOne(filter: Record<string, any>): Promise<IFollow | null> {
  const doc = await Follow.findOne(filter).lean<IFollow>();
  return doc || null;
}

export async function create(data: Partial<IFollow>): Promise<IFollow> {
  const doc = await Follow.create(data);
  return doc.toObject() as IFollow;
}

export async function deleteOne(filter: Record<string, any>): Promise<number> {
  const result = await Follow.deleteOne(filter);
  return result.deletedCount;
}

export async function findMany(
  filter: Record<string, any>,
  options: { select?: string | Record<string, 0 | 1 | boolean> } = {}
): Promise<IFollow[]> {
  let query = Follow.find(filter);
  if (options.select) {
    query = query.select(options.select);
  }
  return query.lean<IFollow[]>();
}

export async function count(filter: Record<string, any>): Promise<number> {
  return Follow.countDocuments(filter);
}

const followRepository = {
  findOne,
  create,
  deleteOne,
  findMany,
  count,
};

export default followRepository;
