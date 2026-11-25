import profileRoutes from "./profile.routes.ts";
import Profile from "./models/profile.model.ts";
import * as profileService from "./profile.service.ts";
import profileRepository from "./profile.repository.ts";

export { profileRoutes, Profile, profileService, profileRepository };
export default profileRoutes;
