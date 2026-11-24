import Auth from "./models/auth.model.js";
import type { IAuth } from "../../shared/types/database.types.js";

/**
 * Repository for Auth records.
 *
 * All public methods return plain JS objects (never raw Mongoose documents)
 * so callers remain decoupled from the ORM layer.
 */

/**
 * Find an Auth record by its database identifier.
 */
export async function findById(id: string | any): Promise<IAuth | null> {
  const doc = await Auth.findById(id).lean<IAuth>();
  return doc || null;
}

/**
 * Find an Auth record by email address.
 */
export async function findByEmail(email: string): Promise<IAuth | null> {
  const doc = await Auth.findOne({ email }).lean<IAuth>();
  return doc || null;
}

/**
 * Find an Auth record by Google OAuth subject ID or by email.
 * Used during Google OAuth sign-in to detect existing accounts.
 */
export async function findByGoogleIdOrEmail(googleId: string, email: string): Promise<IAuth | null> {
  const doc = await Auth.findOne({
    $or: [{ googleId }, { email }],
  }).lean<IAuth>();
  return doc || null;
}

/**
 * Insert a new Auth record.
 */
export async function create(data: Partial<IAuth>): Promise<IAuth> {
  const doc = await Auth.create(data);
  return doc.toObject() as IAuth;
}

/**
 * Apply a partial update to the Auth record with the given ID.
 */
export async function updateById(id: string | any, data: Partial<IAuth>): Promise<IAuth | null> {
  const doc = await Auth.findByIdAndUpdate(id, data, { new: true }).lean<IAuth>();
  return doc || null;
}

/**
 * Persist changes made directly on a Mongoose Auth document instance.
 * Also supports plain objects with _id by delegating to updateById.
 */
export async function save(doc: any): Promise<IAuth> {
  if (doc && typeof doc.save === "function") {
    const saved = await doc.save();
    return (saved.toObject ? saved.toObject() : saved) as IAuth;
  }
  if (doc && doc._id) {
    const { _id, ...data } = doc;
    const updated = await updateById(_id, data);
    return updated as IAuth;
  }
  return doc as IAuth;
}

/**
 * Find by email and update, creating the record if none exists (upsert).
 * Used when verifying email OTPs to materialise an Auth record on first sign-up.
 */
export async function upsertByEmail(email: string, data: Partial<IAuth>): Promise<IAuth> {
  const doc = await Auth.findOneAndUpdate(
    { email },
    data,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<IAuth>();
  return doc as IAuth;
}

/**
 * Find a live (non-lean) Mongoose Auth document by its ID.
 */
export async function findDocumentById(id: string | any): Promise<any> {
  return Auth.findById(id);
}

/**
 * Find a live (non-lean) Mongoose Auth document by filter.
 */
export async function findDocument(filter: Record<string, any>): Promise<any> {
  return Auth.findOne(filter);
}

const authRepository = {
  findById,
  findByEmail,
  findByGoogleIdOrEmail,
  create,
  updateById,
  save,
  upsertByEmail,
  findDocumentById,
  findDocument,
};

export default authRepository;
