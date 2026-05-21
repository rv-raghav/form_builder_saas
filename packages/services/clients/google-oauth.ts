import { OAuth2Client } from "google-auth-library";
import { env } from "../env";

let client: OAuth2Client | null = null;

export function getGoogleOAuth2Client(): OAuth2Client | null {
  if (!env.GOOGLE_OAUTH_CLIENT_ID || !env.GOOGLE_OAUTH_CLIENT_SECRET) {
    return null;
  }

  if (!client) {
    client = new OAuth2Client({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
    });
  }

  return client;
}
