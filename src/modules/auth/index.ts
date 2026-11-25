import authRoutes from "./auth.routes.ts";
import Auth from "./models/auth.model.ts";
import * as authService from "./auth.service.ts";
import authRepository from "./auth.repository.ts";

export { authRoutes, Auth, authService, authRepository,  };
export default authRoutes;
