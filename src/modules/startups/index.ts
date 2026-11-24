import startupRoutes from "./startup.routes.ts";
import Startup from "./models/startup.model.ts";
import * as startupService from "./startup.service.ts";
import startupRepository from "./startup.repository.ts";

export { startupRoutes, Startup, startupService, startupRepository };
export default startupRoutes;
