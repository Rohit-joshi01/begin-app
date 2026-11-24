import postRoutes from "./post.routes.js";
import Post from "./models/post.model.js";
import * as postService from "./post.service.js";
import postRepository from "./post.repository.js";

export { postRoutes, Post, postService, postRepository };
export default postRoutes;
