# Begin Backend Modular Monolith Architecture

## 1. Overview

The Begin backend is organized as a feature-based **Modular Monolith**. This architecture groups related business capabilities, domain models, controllers, services, and route definitions into discrete, autonomous modules while keeping the entire application within a single deployable unit and runtime process.

This design enforces separation of concerns, eliminates circular dependencies, maintains consistent API contracts, and simplifies navigation for developers as new features are added.

---

## 2. Directory Structure

```text
begin-app/
├── src/
│   ├── modules/
│   │   ├── auth/                      # Authentication & session issuance
│   │   │   ├── models/
│   │   │   │   ├── auth.model.js      # User credentials & account state
│   │   │   │   └── otp.model.js       # Time-limited OTP codes
│   │   │   ├── auth.routes.js         # /auth/* and /api/auth/* routes
│   │   │   ├── auth.controller.js     # HTTP request & response handlers
│   │   │   ├── auth.service.js        # OTP & Google OAuth business logic
│   │   │   ├── auth.validation.js     # Payload validation
│   │   │   └── index.js               # Module public interface & exports
│   │   │
│   │   ├── onboarding/                # Student onboarding workflow
│   │   │   ├── onboarding.routes.js   # /onboarding/role & /onboarding/profile
│   │   │   ├── onboarding.controller.js
│   │   │   ├── onboarding.service.js
│   │   │   ├── onboarding.validation.js
│   │   │   └── index.js
│   │   │
│   │   ├── profiles/                  # Builder profiles & portfolio
│   │   │   ├── models/
│   │   │   │   └── profile.model.js   # Profile schema, past work, privacy
│   │   │   ├── profile.routes.js      # /profile/* and /api/profile/*
│   │   │   ├── profile.controller.js
│   │   │   ├── profile.service.js     # Completion score, privacy masking
│   │   │   ├── profile.validation.js
│   │   │   └── index.js
│   │   │
│   │   ├── startups/                  # Campus ventures & team recruitment
│   │   │   ├── models/
│   │   │   │   └── startup.model.js   # Startup schema, roles, milestones
│   │   │   ├── startup.routes.js      # /startup/* and /api/startup/*
│   │   │   ├── startup.controller.js
│   │   │   ├── startup.service.js     # Stealth mode, team invites, roles
│   │   │   ├── startup.validation.js
│   │   │   └── index.js
│   │   │
│   │   ├── discovery/                 # Directory discovery, search & matches
│   │   │   ├── models/
│   │   │   │   ├── follow.model.js    # Follow relations (USER, STARTUP)
│   │   │   │   └── shortlist.model.js # Private bookmarking & notes
│   │   │   ├── discovery.routes.js    # /discovery and /api/discovery/*
│   │   │   ├── discovery.controller.js
│   │   │   ├── discovery.service.js   # Search, filters, recommendations
│   │   │   ├── discovery.validation.js
│   │   │   └── index.js
│   │   │
│   │   ├── posts/                     # Campus progress feed & updates
│   │   │   ├── models/
│   │   │   │   └── post.model.js      # Post entity schema
│   │   │   ├── post.routes.js         # /post/new
│   │   │   ├── post.controller.js
│   │   │   ├── post.service.js
│   │   │   └── index.js
│   │   │
│   │   └── home/                      # Root dashboard & feed presentation
│   │       ├── home.routes.js         # /
│   │       ├── home.controller.js     # Suggested matches injection
│   │       └── index.js
│   │
│   ├── infrastructure/                # External systems & technical plumbing
│   │   ├── database/
│   │   │   ├── connection.js          # MongoDB connection & reconnect monitoring
│   │   │   └── seed.js                # Database seeder logic
│   │   ├── email/
│   │   │   └── email.service.js       # Resend email client
│   │   ├── external-services/
│   │   │   └── googleAuth.service.js  # Google OAuth API exchange
│   │   └── storage/
│   │       └── multer.storage.js      # Multer file upload storage configs
│   │
│   ├── middleware/                    # HTTP middleware pipeline
│   │   ├── auth.middleware.js         # attachUser, requireAuth, requireOnboarded
│   │   ├── error.middleware.js        # Global error boundary (JSON & EJS)
│   │   └── index.js
│   │
│   ├── config/                        # Configuration & environment variables
│   │   └── env.js                     # Validated configuration schema
│   │
│   ├── shared/                        # Cross-cutting reusable utilities
│   │   ├── constants/                 # Enums (Roles, Stages, Statuses)
│   │   ├── errors/                    # Operational AppError hierarchy
│   │   ├── utils/                     # Crypto hashing, string sanitizers
│   │   └── helpers/                   # Profile completion calculation
│   │
│   ├── app.js                         # Express application setup
│   └── server.js                      # Server lifecycle & graceful shutdown
│
├── tests/                             # Automated test suites
│   ├── architecture.test.ts           # Route verification & exports check
│   ├── views.test.ts                  # EJS template compilation tests
│   ├── integration.test.ts            # End-to-end database & domain tests
│   └── postgres.test.ts               # PostgreSQL & Drizzle ORM layer tests
│
├── views/                             # EJS frontend views
├── public/                            # Static assets & client uploads
├── database/                          # Legacy backward-compatibility proxies
├── models/                            # Legacy backward-compatibility proxies
├── controllers/                       # Legacy backward-compatibility proxies
├── routes/                            # Legacy backward-compatibility proxies
├── services/                          # Legacy backward-compatibility proxies
├── middlewares/                       # Legacy backward-compatibility proxies
├── utils/                             # Legacy backward-compatibility proxies
├── index.js                           # Root entrypoint delegating to src/server.js
└── package.json
```

---

## 3. Module Responsibilities

Each feature module is self-contained and adheres to strict responsibility boundaries:

### Routes (`<feature>.routes.js`)
- Exclusively defines HTTP endpoints and URL paths.
- Attaches relevant middleware (`requireAuth`, `requireOnboarded`, `multer` uploads).
- Delegates immediately to the controller handlers.
- Contains no business or query logic.

### Controllers (`<feature>.controller.js`)
- Receives HTTP request parameters (`req.params`, `req.query`, `req.body`).
- Invokes validation helpers to verify payload shape.
- Calls appropriate service functions.
- Formats standard HTTP responses (JSON payloads or EJS view rendering).
- Contains no direct database queries.

### Services (`<feature>.service.js`)
- Houses core business logic and database operations.
- Completely independent of Express `req` and `res` objects.
- Handles authorization checks (such as verifying startup ownership).
- Enforces domain rules (e.g. stealth mode privacy masking, builder badge awarding).
- Communicates across module boundaries using public exported functions.

### Models (`models/<feature>.model.js`)
- Defines Mongoose schemas, sub-schemas, indexes, and hooks.
- Lives within the feature module that owns the entity.

### Validation (`<feature>.validation.js`)
- Validates request payloads close to the feature.
- Throws typed operational errors (`BadRequestError`) when input fails constraints.

### Module Entrypoint (`index.js`)
- Defines the public API contract for the module.
- Exports router, models, and public service functions.
- Prevents external modules from deep-importing internal module details.

---

## 4. Cross-Module Communication

1. **Explicit Public Interfaces:** When Module A requires capability from Module B, it imports from `src/modules/B/index.js`.
2. **No Direct Model Mutations:** Modules should not arbitrarily modify the internal fields of entities owned by another module without going through that module's exported service functions.
3. **Mongoose Model References:** Models declare `ref: "Auth"` or `ref: "Startup"`. Mongoose registers all models globally upon import, ensuring `.populate()` operations work across module boundaries.
4. **Zero Circular Dependencies:** The dependency graph flows unidirectionally:
   `server.js` -> `app.js` -> `modules` -> `infrastructure` / `middleware` -> `shared` / `config`.

---

## 5. How to Add a New Feature Module

To add a new feature (for example, `comments` or `notifications`):

1. **Create the module folder:**
   ```bash
   mkdir -p src/modules/<feature-name>/models
   ```
2. **Define the domain model:**
   Create `src/modules/<feature-name>/models/<feature-name>.model.js`.
3. **Implement business logic:**
   Create `src/modules/<feature-name>/<feature-name>.service.js`. Keep functions free of `req` and `res`.
4. **Implement validation & controller:**
   Create `<feature-name>.validation.js` and `<feature-name>.controller.js`.
5. **Define HTTP routes:**
   Create `src/modules/<feature-name>/<feature-name>.routes.js`.
6. **Export the public interface:**
   Create `src/modules/<feature-name>/index.js` exporting the router and service functions.
7. **Mount the route in `src/app.js`:**
   ```javascript
   import { <featureName>Routes } from "./modules/<feature-name>/index.js";
   app.use("/<feature-name>", <featureName>Routes);
   ```
8. **Add test coverage in `tests/`:**
   Add unit or integration assertions in `tests/architecture.test.ts` or `tests/integration.test.ts`.

---

## 6. Shared Functionality and Infrastructure

- **`src/config/env.js`:** Central repository of validated environment variables. All code reads from `config` rather than accessing `process.env` directly in scattered files.
- **`src/shared/errors/`:** Central error classes (`AppError`, `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`).
- **`src/shared/constants/`:** System enums for roles, stages, availability, and follow types.
- **`src/shared/utils/`:** Pure utility functions (cryptographic HMAC hashing, timing-safe equality, string escaping).
- **`src/shared/helpers/`:** Reusable domain algorithms (10-dimension builder badge calculator).
- **`src/infrastructure/`:** Concrete integrations with external services (MongoDB via Mongoose, transactional email via Resend, Google OAuth 2.0, Multer disk storage).

---

## 7. Application Initialization vs Server Startup

Initialization is strictly separated into two files:

- **`src/app.js`:** Responsible only for Express configuration, middleware setup, static file paths, view engine settings, route registrations, and error handling. It exports `app` and does not start an HTTP listener or open database connections.
- **`src/server.js`:** Responsible for reading configuration, connecting to MongoDB, starting `app.listen()`, and registering process signal handlers (`SIGTERM`, `SIGINT`) for graceful teardown.
- **`index.js`:** Sits at the project root and imports `./src/server.js`, preserving compatibility with `npm start`, `npm run dev`, nodemon, and deployment harnesses.

---

## 8. Old-to-New File Mapping

| Legacy Path | Modular Monolith Path | Responsibility |
| :--- | :--- | :--- |
| `index.js` | `src/app.js` & `src/server.js` | Express app configuration vs HTTP server lifecycle |
| `database/connection.js` | `src/infrastructure/database/connection.js` | MongoDB Mongoose connection and event monitoring |
| `database/seed.js` | `src/infrastructure/database/seed.js` | Database seeding with sample campus accounts |
| `services/email.service.js` | `src/infrastructure/email/email.service.js` | Resend API email delivery service |
| `services/googleAuth.service.js` | `src/infrastructure/external-services/googleAuth.service.js` | Google OAuth token exchange & userinfo |
| `middlewares/auth.middleware.js` | `src/middleware/auth.middleware.js` | Session attachment & authentication guards |
| `utils/otp.js` | `src/shared/utils/crypto.utils.js` | Cryptographic OTP generation & verification |
| `utils/profileCompletion.js` | `src/shared/helpers/profileCompletion.helper.js` | Profile completion percentage & builder badge logic |
| `models/auth.model.js` | `src/modules/auth/models/auth.model.js` | User account & credential schema |
| `models/opt.model.js` | `src/modules/auth/models/otp.model.js` | One-time password verification schema |
| `controllers/auth.controller.js` | `src/modules/auth/auth.controller.js` | Auth views and OTP/OAuth handlers |
| `services/otp.service.js` | `src/modules/auth/auth.service.js` | OTP generation and validation business logic |
| `routes/auth.route.js` | `src/modules/auth/auth.routes.js` | Sign-in, sign-up, Google OAuth, and OTP routes |
| `controllers/onboarding.controller.js` | `src/modules/onboarding/onboarding.controller.js` | Role selection & profile setup handlers |
| `routes/onboarding.route.js` | `src/modules/onboarding/onboarding.routes.js` | Onboarding screen and submission routes |
| `models/profile.model.js` | `src/modules/profiles/models/profile.model.js` | Builder profile, past work, and privacy schema |
| `controllers/profile.controller.js` | `src/modules/profiles/profile.controller.js` | Profile page renders and JSON API handlers |
| `services/profile.service.js` | `src/modules/profiles/profile.service.js` | Profile CRUD, badge evaluation, privacy masking |
| `routes/profile.route.js` | `src/modules/profiles/profile.routes.js` | Builder profile views and API endpoints |
| `models/startup.model.js` | `src/modules/startups/models/startup.model.js` | Startup, milestones, and open roles schema |
| `controllers/startup.controller.js` | `src/modules/startups/startup.controller.js` | Startup views and management handlers |
| `services/startup.service.js` | `src/modules/startups/startup.service.js` | Venture lifecycle, stealth mode, and team invites |
| `routes/startup.route.js` | `src/modules/startups/startup.routes.js` | Startup directory, editor, and API routes |
| `models/follow.model.js` | `src/modules/discovery/models/follow.model.js` | Social follow relation schema |
| `models/shortlist.model.js` | `src/modules/discovery/models/shortlist.model.js` | Private bookmarks and personal notes schema |
| `controllers/discovery.controller.js` | `src/modules/discovery/discovery.controller.js` | Directory views, search, follow & shortlist handlers |
| `services/discovery.service.js` | `src/modules/discovery/discovery.service.js` | Unified search, directory filters, suggested matches |
| `routes/discovery.route.js` | `src/modules/discovery/discovery.routes.js` | Campus discovery directory and search endpoints |
| `models/post.model.js` | `src/modules/posts/models/post.model.js` | Feed post entity schema |
| `controllers/post.controller.js` | `src/modules/posts/post.controller.js` | Post creation page handler |
| `routes/post.route.js` | `src/modules/posts/post.routes.js` | Feed post submission routes |

*Note: The legacy folder paths (`models/`, `controllers/`, `routes/`, `services/`, `middlewares/`, `utils/`) contain backward-compatible proxy re-exports to ensure zero breakage for any external tools or legacy scripts.*
