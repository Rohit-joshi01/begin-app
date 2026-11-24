import Startup from "./models/startup.model.js";
import type { IStartup } from "../../shared/types/database.types.js";

/**
 * Repository layer for the Startup model.
 * All public methods return plain JS objects (via .toObject() or .lean()),
 * never raw Mongoose documents, so callers are decoupled from Mongoose internals.
 */

function applyPopulate(query: any, populates?: Array<{ path: string; select?: string }>) {
  if (!Array.isArray(populates)) return query;
  for (const config of populates) {
    query = query.populate(config);
  }
  return query;
}

/**
 * Find a startup by its _id.
 */
export async function findById(
  startupId: string | any,
  options: { populate?: Array<{ path: string; select?: string }> } = {}
): Promise<IStartup | null> {
  let query = Startup.findById(startupId);
  query = applyPopulate(query, options.populate);
  const doc = await query.exec();
  if (!doc) return null;
  return (doc.toObject ? doc.toObject() : doc) as IStartup;
}

/**
 * Find multiple startups matching a filter.
 */
export async function findMany(
  filter: Record<string, any> = {},
  options: {
    sort?: Record<string, 1 | -1 | "asc" | "desc">;
    limit?: number;
    populate?: Array<{ path: string; select?: string }>;
  } = {}
): Promise<IStartup[]> {
  let query = Startup.find(filter);
  if (options.sort) {
    query = query.sort(options.sort);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  query = applyPopulate(query, options.populate);
  const docs = await query.exec();
  return docs.map((doc: any) => (doc.toObject ? doc.toObject() : doc)) as IStartup[];
}

/**
 * Create a new startup document and return a plain object.
 */
export async function create(data: Partial<IStartup>): Promise<IStartup> {
  const doc = await Startup.create(data);
  return doc.toObject() as IStartup;
}

/**
 * Save an existing Mongoose document instance and return a plain object.
 */
export async function save(startupDoc: any): Promise<IStartup> {
  const saved = await startupDoc.save();
  return (saved.toObject ? saved.toObject() : saved) as IStartup;
}

/**
 * Apply atomic updates to a startup by its ID and return the updated plain object.
 */
export async function updateById(startupId: string | any, updateData: any): Promise<IStartup | null> {
  const doc = await Startup.findByIdAndUpdate(startupId, updateData, { returnDocument: "after" }).lean<IStartup>();
  return doc || null;
}

/**
 * Count startup documents matching a filter.
 */
export async function count(filter: Record<string, any> = {}): Promise<number> {
  return Startup.countDocuments(filter);
}

/**
 * Find a live Mongoose document by its _id for mutation patterns.
 */
export async function findDocumentById(startupId: string | any): Promise<any> {
  return Startup.findById(startupId);
}

/**
 * Find a live Mongoose document matching a filter.
 */
export async function findDocument(filter: Record<string, any>): Promise<any> {
  return Startup.findOne(filter);
}

const startupRepository = {
  findById,
  findMany,
  create,
  save,
  updateById,
  count,
  findDocumentById,
  findDocument,
};

export default startupRepository;
