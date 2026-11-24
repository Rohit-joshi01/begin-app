import authRoutes from "./auth.routes.js";
import Auth from "./models/auth.model.js";
import EmailOTP from "./models/otp.model.js";
import * as authService from "./auth.service.js";
import authRepository from "./auth.repository.js";
import otpRepository from "./otp.repository.js";

export { authRoutes, Auth, EmailOTP, authService, authRepository, otpRepository };
export default authRoutes;
