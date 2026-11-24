import discoveryRoutes from "./discovery.routes.js";
import Follow from "./models/follow.model.js";
import Shortlist from "./models/shortlist.model.js";
import * as discoveryService from "./discovery.service.js";
import followRepository from "./follow.repository.js";
import shortlistRepository from "./shortlist.repository.js";

export { discoveryRoutes, Follow, Shortlist, discoveryService, followRepository, shortlistRepository };
export default discoveryRoutes;
