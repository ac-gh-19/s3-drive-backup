import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");

async function readJSON(p: string) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function loadSavedAuthClient() {
  if (!(await fileExists(TOKEN_PATH))) return null;

  // checks if we have refresh token saved
  const token = await readJSON(TOKEN_PATH);
  const creds = await readJSON(CREDENTIALS_PATH);

  // creates unauthorized oAuth2 client with saved credentials
  const conf = creds.installed;
  const client = new google.auth.OAuth2(conf.client_id, conf.client_secret);

  // use refresh token to authorize
  client.setCredentials(token);
  return client;
}

async function saveAuthClient(client: any) {
  // Persist refresh token so future runs are headless
  const refresh = client.credentials?.refresh_token;
  if (!refresh) {
    throw new Error(
      "No refresh_token received. Revoke app access in your Google Account and re-auth, " +
        "or force a fresh consent so Google issues a refresh token.",
    );
  }

  const payload = {
    // Google libraries accept this "authorized_user" shape
    type: "authorized_user",
    refresh_token: refresh,
  };

  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(payload, null, 2), "utf8");
}

export async function getAuthClient() {
  // try cached token.json
  const saved = await loadSavedAuthClient();
  if (saved) return saved;

  // do interactive auth otherwise
  const client = await authenticate({
    keyfilePath: CREDENTIALS_PATH,
    scopes: SCOPES,
  });

  await saveAuthClient(client);
  return client;
}
