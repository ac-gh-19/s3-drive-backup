import { getAuthClient } from "../auth/googleAuth";
import { google } from "googleapis";

export async function getDriveClient() {
  const authClient = await getAuthClient();
  return google.drive({ version: "v3", auth: authClient as any });
}
