import postRepository from "./post.repository.js";
import type { IPost } from "../../shared/types/database.types.js";

/**
 * Posts service handling feed updates and milestone publications.
 */

export async function createPost(postData: Partial<IPost>): Promise<IPost> {
  return postRepository.create(postData);
}

export async function getRecentPosts(limit = 20): Promise<IPost[]> {
  return postRepository.findMany({}, { sort: { createdAt: -1 }, limit });
}
