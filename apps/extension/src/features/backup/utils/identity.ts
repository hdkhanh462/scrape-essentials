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

export async function googleLogin() {
  const clientId = import.meta.env.WXT_APP_CLIENT_ID;
  const redirectUri = browser.identity.getRedirectURL();
  const scope = "https://www.googleapis.com/auth/drive.file";
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent`;

  const responseUrl = await browser.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });

  if (!responseUrl) {
    throw new Error("OAuth failed");
  }

  const url = new URL(responseUrl);

  const code = url.searchParams.get("code");

  if (!code) {
    throw new Error("Authorization code missing");
  }

  return code;
}

export async function exchangeToken(code: string) {
  const res = await fetch("https://your-worker-url/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const data = await res.json();

  await browser.storage.local.set({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  });

  return data.access_token;
}
