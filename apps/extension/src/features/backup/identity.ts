import { BUFFER_IN_MS } from "@/features/backup/constants";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type {
  GoogleUserInfo,
  OAuthRefreshResponse,
  OAuthTokenResponse,
} from "@/features/backup/types";

export async function launchWebAuthFlow(): Promise<OAuthTokenResponse> {
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

export async function exchangeToken(code: string): Promise<OAuthTokenResponse> {
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

  return await response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<OAuthRefreshResponse> {
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

  return await response.json();
}

export async function getAccessToken(
  { authIfMissing } = { authIfMissing: true },
): Promise<string | null> {
  const {
    accessToken,
    accessTokenExpiry,
    refreshToken,
    userInfo,
    login,
    refresh,
  } = useGoogleStore.getState();

  if (!accessToken || !accessTokenExpiry || !refreshToken) {
    if (!authIfMissing) return null;

    const res = await launchWebAuthFlow();
    login(res);

    if (!userInfo && res.accessToken) {
      await getUserInfo(res.accessToken);
    }

    return res.accessToken;
  }

  if (Date.now() < accessTokenExpiry - BUFFER_IN_MS) {
    return accessToken;
  }

  const res = await refreshAccessToken(refreshToken);
  refresh(res);

  if (!userInfo && res.accessToken) {
    await getUserInfo(res.accessToken);
  }

  return res.accessToken;
}

const getUserInfo = async (
  accessToken: string,
): Promise<GoogleUserInfo | null> => {
  const { userInfo, setUserInfo } = useGoogleStore.getState();

  if (userInfo) return userInfo;

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) return null;

  const newUserInfo = await res.json();
  setUserInfo(newUserInfo);

  return newUserInfo;
};
