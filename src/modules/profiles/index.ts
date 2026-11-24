import profileRoutes from "./profile.routes.js";
import Profile from "./models/profile.model.js";
import * as profileService from "./profile.service.js";
import profileRepository from "./profile.repository.js";

export { profileRoutes, Profile, profileService, profileRepository };
export default profileRoutes;
