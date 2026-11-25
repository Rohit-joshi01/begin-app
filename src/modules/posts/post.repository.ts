import Post from "./models/post.model.ts";
import type { IPost } from "../../shared/types/database.types.ts";

/**
 * Repository layer for community feed posts.
 */

async function create(data: Partial<IPost>): Promise<IPost> {
  const doc = await Post.create(data);
  return doc.toObject() as IPost;
}

async function findMany(
  filter: Record<string, any> = {},
  options: {
    sort?: Record<string, 1 | -1 | "asc" | "desc">;
    limit?: number;
  } = {}
): Promise<IPost[]> {
  let query = Post.find(filter).lean<IPost[]>();
  if (options.sort) {
    query = query.sort(options.sort);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  return query;
}

async function findById(id: string | any): Promise<IPost | null> {
  const doc = await Post.findById(id).lean<IPost>();
  return doc || null;
}

async function updateById(id: string | any, data: Partial<IPost>): Promise<IPost | null> {
  const doc = await Post.findByIdAndUpdate(id, data, { returnDocument: "after" }).lean<IPost>();
  return doc || null;
}

async function deleteById(id: string | any): Promise<IPost | null> {
  const doc = await Post.findByIdAndDelete(id).lean<IPost>();
  return doc || null;
}

const postRepository = {
  create,
  findMany,
  findById,
  updateById,
  deleteById,
};

export default postRepository;
