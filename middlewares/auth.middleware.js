import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";

/**
 * requireAuth — protects a route behind a valid JWT cookie.
 *
 * On success  → sets req.user = { userId, email } and calls next()
 * On failure  → HTML requests redirect to "/", JSON requests get 401
 */
export const requireAuth = (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return _unauthorized(req, res);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { userId, email }
    return next();
  } catch {
    // Invalid or expired token — clear the bad cookie
    res.clearCookie(COOKIE_NAME);
    return _unauthorized(req, res);
  }
};

function _unauthorized(req, res) {
  const acceptsHtml = req.headers.accept?.includes("text/html");
  if (acceptsHtml) return res.redirect("/");
  return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
}
