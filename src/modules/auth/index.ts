import authRoutes from "./auth.routes.ts";
import Auth from "./models/auth.model.ts";
import EmailOTP from "./models/otp.model.ts";
import * as authService from "./auth.service.ts";
import authRepository from "./auth.repository.ts";
import otpRepository from "./otp.repository.ts";

export { authRoutes, Auth, EmailOTP, authService, authRepository, otpRepository };
export default authRoutes;
