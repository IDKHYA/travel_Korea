export const AUTH_COOKIE_NAME = "travel-map-auth";

function getSitePassword(): string {
  return process.env.SITE_PASSWORD ?? "0729";
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The value a valid auth cookie must hold. Derived from the site password so
 * the plaintext password is never stored client-side. */
export async function getExpectedAuthToken(): Promise<string> {
  return sha256Hex(`travel-map:${getSitePassword()}`);
}

export async function verifyPassword(password: string): Promise<boolean> {
  return password === getSitePassword();
}
