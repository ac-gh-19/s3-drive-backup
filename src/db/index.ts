import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "backup.db");
export const db = new Database(dbPath);
