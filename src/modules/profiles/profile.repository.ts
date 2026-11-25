import Profile from "./models/profile.model.ts";
import type { IProfile } from "../../shared/types/database.types.ts";

/**
 * Profile repository providing data-access methods for the Profile model.
 * All methods return plain JS objects (never raw Mongoose documents),
 * except save() which accepts a Mongoose document and returns a plain object
 * so that the pre-save hook that computes profileCompletionPercentage and
 * isBuilder is preserved.
 */

/**
 * Find a profile by userId.
 */
export async function findByUserId(userId: string | any, populateAuth = false): Promise<IProfile | null> {
  let query = Profile.findOne({ userId });
  if (populateAuth) {
    query = query.populate("userId", "email role");
  }
  const doc = await query.lean<IProfile>();
  return doc || null;
}

/**
 * Find a profile by its _id.
 */
export async function findById(profileId: string | any, populateAuth = false): Promise<IProfile | null> {
  let query = Profile.findById(profileId);
  if (populateAuth) {
    query = query.populate("userId", "email role");
  }
  const doc = await query.lean<IProfile>();
  return doc || null;
}

/**
 * Create a new profile document.
 */
export async function create(data: Partial<IProfile>): Promise<IProfile> {
  const doc = await Profile.create(data);
  return doc.toObject() as IProfile;
}

/**
 * Find a profile by userId and update it, upserting if not found.
 */
export async function upsertByUserId(userId: string | any, data: Partial<IProfile>): Promise<IProfile> {
  const doc = await Profile.findOneAndUpdate(
    { userId },
    { ...data, userId },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  ).lean<IProfile>();
  return doc as IProfile;
}

/**
 * Save a Mongoose document and return a plain object.
 */
export async function save(profileDoc: any): Promise<IProfile> {
  const saved = await profileDoc.save();
  return (saved.toObject ? saved.toObject() : saved) as IProfile;
}

/**
 * Update a profile by userId using findOneAndUpdate.
 */
export async function updateByUserId(userId: string | any, updateData: any): Promise<IProfile | null> {
  const doc = await Profile.findOneAndUpdate({ userId }, updateData, {
    returnDocument: "after",
  }).lean<IProfile>();
  return doc || null;
}

/**
 * Find multiple profiles matching a filter.
 */
export async function findMany(filter: Record<string, any> = {}, options: any = {}): Promise<IProfile[]> {
  let query = Profile.find(filter);
  if (options.sort) {
    query = query.sort(options.sort);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.populate) {
    for (const pop of options.populate) {
      query = query.populate(pop);
    }
  }
  return query.lean<IProfile[]>();
}

/**
 * Find a single profile matching a filter.
 */
export async function findOne(filter: Record<string, any>): Promise<IProfile | null> {
  const doc = await Profile.findOne(filter).lean<IProfile>();
  return doc || null;
}

/**
 * Retrieve a live Mongoose document for mutation-then-save patterns.
 */
export async function findDocumentByUserId(userId: string | any): Promise<any> {
  return Profile.findOne({ userId });
}

/**
 * Retrieve a live Mongoose document by custom filter for mutation-then-save patterns.
 */
export async function findDocument(filter: Record<string, any>): Promise<any> {
  return Profile.findOne(filter);
}

const profileRepository = {
  findByUserId,
  findById,
  findOne,
  create,
  upsertByUserId,
  save,
  updateByUserId,
  findMany,
  findDocumentByUserId,
  findDocument,
};

export default profileRepository;
