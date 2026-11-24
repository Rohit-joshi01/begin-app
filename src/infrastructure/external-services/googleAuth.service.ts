import config from "../../config/env.js";

/**
 * External service client for Google OAuth 2.0.
 * Handles consent URL generation, code-token exchange, and user profile queries.
 */

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export const getGoogleAuthUrl = (): string => {
  const { clientId, callbackUrl } = config.googleAuth;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured in environment variables.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
};

export const getGoogleUserFromCode = async (code: string): Promise<any> => {
  const { clientId, clientSecret, callbackUrl } = config.googleAuth;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET) are missing.");
  }

  const tokenParams = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  });

  const tokenData: any = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || tokenData.error || "Failed to exchange Google authorization code.");
  }

  const userResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData: any = await userResponse.json();

  if (!userResponse.ok) {
    throw new Error(userData.error_description || "Failed to fetch user details from Google.");
  }

  return {
    tokens: tokenData,
    user: userData,
  };
};
