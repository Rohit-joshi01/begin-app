import discoveryRoutes from "./discovery.routes.ts";
import Follow from "./models/follow.model.ts";
import Shortlist from "./models/shortlist.model.ts";
import * as discoveryService from "./discovery.service.ts";
import followRepository from "./follow.repository.ts";
import shortlistRepository from "./shortlist.repository.ts";

export { discoveryRoutes, Follow, Shortlist, discoveryService, followRepository, shortlistRepository };
export default discoveryRoutes;
