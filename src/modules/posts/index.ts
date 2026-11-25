import postRoutes from "./post.routes.ts";
import Post from "./models/post.model.ts";
import * as postService from "./post.service.ts";
import postRepository from "./post.repository.ts";

export { postRoutes, Post, postService, postRepository };
export default postRoutes;
