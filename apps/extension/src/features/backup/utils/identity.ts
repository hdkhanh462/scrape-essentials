export function getAuthToken() {
  return new Promise<string>((resolve, reject) => {
    browser.identity.getAuthToken({ interactive: true }, (result) => {
      if (browser.runtime.lastError || !result.token) {
        reject(browser.runtime.lastError);
        return;
      }
      resolve(result.token);
    });
  });
}

export async function launchWebAuthFlow() {
  try {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const clientId = import.meta.env.WXT_APP_CLIENT_ID;

    const redirectUri = `https://${browser.runtime.id}.chromiumapp.org`;

    const state = Math.random().toString(36).substring(2);
    const scopes = "profile email drive.file";

    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("include_granted_scopes", "true");
    authUrl.searchParams.set("prompt", "consent");

    browser.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      async (redirectUrl) => {
        if (browser.runtime.lastError || !redirectUrl) {
          throw new Error(`WebAuthFlow failed: ${browser.runtime.lastError}`);
        }

        const params = new URLSearchParams(redirectUrl.split("?")[1]);
        const code = params.get("code");

        if (!code) {
          throw new Error("No authorization code returned");
        }

        await exchangeToken(code);
      },
    );
  } catch (error) {
    throw new Error(`Sign-in failed: ${error.message}`);
  }
}

export async function exchangeToken(code: string) {
  let response: Response;

  try {
    response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });

    const { accessToken, expiresAt, refreshToken } = await response.json();

    if (accessToken) {
      // Save the tokens and expiration time to Chrome Storage
      await browser.storage.local.set({
        accessToken,
        refreshToken,
        expiresAt,
      });
    }
  } catch (error) {
    throw new Error(`OAuth Sign-in failed: ${error.message}`);
  }
}
