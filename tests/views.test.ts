import assert from "node:assert";
import path from "node:path";
import ejs from "ejs";

/**
 * Tests ensuring all EJS template views compile and render without runtime syntax errors.
 */

const viewsDir = path.resolve("./views");

async function renderTemplate(relPath: string, data: Record<string, any> = {}): Promise<string> {
  const fullPath = path.join(viewsDir, relPath);
  return new Promise<string>((resolve, reject) => {
    ejs.renderFile(
      fullPath,
      {
        user: null,
        locals: { user: null, ...data },
        ...data,
      },
      { views: [viewsDir] },
      (err: Error | null, str: string) => {
        if (err) return reject(err);
        resolve(str);
      }
    );
  });
}

async function runViewTests(): Promise<void> {
  console.log("Running EJS Template Compilation Tests...");

  // 1. Error page
  const errorHtml = await renderTemplate("error.ejs", { message: "Test error notice" });
  assert.ok(errorHtml.includes("Test error notice"), "Error page should render error message");

  // 2. Login page
  const loginHtml = await renderTemplate("login.ejs");
  assert.ok(loginHtml.includes("Sign In"), "Login page should render");

  // 3. Signup page
  const signupHtml = await renderTemplate("signup.ejs");
  assert.ok(signupHtml.includes("Create Account"), "Signup page should render");

  // 4. Onboarding role page
  const roleHtml = await renderTemplate("onboarding/role.ejs", { currentRole: null });
  assert.ok(roleHtml.includes("Founder"), "Role page should render");

  // 5. Onboarding profile page
  const onboardingProfileHtml = await renderTemplate("onboarding/profile.ejs", { role: "FOUNDER" });
  assert.ok(onboardingProfileHtml.includes("Set up your profile"), "Onboarding profile should render");

  // 6. Home page
  const homeHtml = await renderTemplate("home.ejs", {
    user: null,
    suggestedMembers: [],
    suggestedStartups: [],
  });
  assert.ok(homeHtml.includes("Welcome to Begin"), "Home page should render for guest");

  // 7. Discovery index page
  const discoveryHtml = await renderTemplate("discovery/index.ejs", {
    tab: "members",
    query: "",
    members: [],
    startups: [],
    memberFilters: {},
    startupFilters: {},
    followingMemberIds: [],
    followingStartupIds: [],
    shortlistedMemberIds: [],
    shortlistedStartupIds: [],
  });
  assert.ok(discoveryHtml.includes("Campus Discovery"), "Discovery page should render");

  // 8. Startup list page
  const startupListHtml = await renderTemplate("startup/list.ejs", { startups: [] });
  assert.ok(startupListHtml.includes("Campus Startups"), "Startup list page should render");

  // 9. Startup create page
  const startupCreateHtml = await renderTemplate("startup/create.ejs");
  assert.ok(startupCreateHtml.includes("Create Startup Page"), "Startup create page should render");

  // 10. Add post page
  const postHtml = await renderTemplate("addPost.ejs");
  assert.ok(postHtml.includes("post") || postHtml.length > 0, "Post page should render");

  console.log("PASS: All 10 core EJS views compiled and rendered successfully!");
}

runViewTests().catch((err: any) => {
  console.error("View rendering tests failed:", err);
  process.exit(1);
});
