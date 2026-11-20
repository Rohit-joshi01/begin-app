import jwt from "jsonwebtoken";

const COOKIE_NAME = "begin_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/** Sign a JWT for the given user document */
export const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

/** Verify a JWT string and return the decoded payload (throws on failure) */
export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

/** Set the httpOnly auth cookie and send a JSON response */
export const setCookieAndRespond = (res, user, statusCode, json) => {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
  return res.status(statusCode).json(json);
};

/** Set the httpOnly auth cookie (used for redirect flows — Google OAuth) */
export const setCookie = (res, user) => {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
};

export { COOKIE_NAME };
