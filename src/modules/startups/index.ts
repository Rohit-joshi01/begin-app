import startupRoutes from "./startup.routes.js";
import Startup from "./models/startup.model.js";
import * as startupService from "./startup.service.js";
import startupRepository from "./startup.repository.js";

export { startupRoutes, Startup, startupService, startupRepository };
export default startupRoutes;
