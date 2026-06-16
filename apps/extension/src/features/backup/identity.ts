import { BUFFER_IN_MS } from "@/features/backup/constants";
import { useGoogleStore } from "@/features/backup/stores/google.store";
import type {
  GoogleUserInfo,
  OAuthRefreshResponse,
  OAuthTokenResponse,
} from "@/features/backup/types";
import { apiUrl, oAuthUrl } from "@/features/backup/utils";

export async function launchWebAuthFlow(): Promise<OAuthTokenResponse> {
  const redirectUri = browser.identity.getRedirectURL();
  const url = oAuthUrl("/v2/auth", {
    client_id: import.meta.env.WXT_GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    state: crypto.randomUUID(),
    scope: [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/drive.file",
    ].join(" "),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
  });

  const redirectUrl = await new Promise<string>((resolve, reject) => {
    browser.identity.launchWebAuthFlow(
      {
        url,
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

  const code = new URL(redirectUrl).searchParams.get("code");

  if (!code) throw new Error("Authorization code missing");

  return exchangeToken(code, redirectUri);
}

export async function exchangeToken(
  code: string,
  redirectUri: string,
): Promise<OAuthTokenResponse> {
  const response = await fetch(apiUrl("/api/auth/token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!response.ok) throw new Error("Token exchange failed");

  return await response.json();
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<OAuthRefreshResponse> {
  const response = await fetch(apiUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

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

    const response = await launchWebAuthFlow();
    login(response);

    if (!userInfo && response.accessToken) {
      await getUserInfo(response.accessToken);
    }

    return response.accessToken;
  }

  if (Date.now() < accessTokenExpiry - BUFFER_IN_MS) {
    return accessToken;
  }

  const response = await refreshAccessToken(refreshToken);
  refresh(response);

  if (!userInfo && response.accessToken) {
    await getUserInfo(response.accessToken);
  }

  return response.accessToken;
}

const getUserInfo = async (
  accessToken: string,
): Promise<GoogleUserInfo | null> => {
  const { userInfo, setUserInfo } = useGoogleStore.getState();
  if (userInfo) return userInfo;

  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) return null;

  const newUserInfo = await response.json();
  setUserInfo(newUserInfo);

  return newUserInfo;
};
