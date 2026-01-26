import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbPath = path.join(process.cwd(), "data", "backup.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
