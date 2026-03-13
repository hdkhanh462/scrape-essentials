import { BUFFER_IN_MS } from "@/features/backup/constants";
import type { OAuthTokenResponse } from "@/features/backup/types";

export async function launchWebAuthFlow(): Promise<string> {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const clientId = import.meta.env.WXT_GOOGLE_CLIENT_ID;
  const redirectUri = browser.identity.getRedirectURL();
  const state = crypto.randomUUID();
  const scopes = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/drive.file",
  ].join(" ");

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("prompt", "consent");

  const redirectUrl = await new Promise<string>((resolve, reject) => {
    browser.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      (url) => {
        if (browser.runtime.lastError || !url) {
          reject(browser.runtime.lastError);
          return;
        }

        resolve(url);
      },
    );
  });

  const url = new URL(redirectUrl);

  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error("Authorization code missing");
  }

  return exchangeToken(code);
}

export async function exchangeToken(code: string): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    },
  );

  if (!response.ok) {
    throw new Error("Token exchange failed");
  }

  const { accessToken, expiresAt, refreshToken } = await response.json();

  await browser.storage.local.set<OAuthTokenResponse>({
    accessToken,
    expiresAt,
    refreshToken,
  });

  return accessToken;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  if (!response.ok) throw new Error("Token refresh failed");

  const { accessToken, expiresAt } = await response.json();

  await browser.storage.local.set({
    accessToken,
    expiresAt,
  });

  return accessToken;
}

export async function getAccessToken(
  authIfMissing = true,
): Promise<string | null> {
  const { accessToken, expiresAt, refreshToken } =
    await browser.storage.local.get<OAuthTokenResponse>([
      "accessToken",
      "expiresAt",
      "refreshToken",
    ]);

  if (!accessToken || !expiresAt || !refreshToken) {
    if (!authIfMissing) return null;

    const newAccessToken = await launchWebAuthFlow();
    return newAccessToken;
  }

  if (Date.now() < expiresAt - BUFFER_IN_MS) {
    return accessToken;
  }

  return refreshAccessToken(refreshToken);
}
