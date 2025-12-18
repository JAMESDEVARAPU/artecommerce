import { config } from "dotenv";
config();

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema-sqlite";

const sqlite = new Database("./local.db");
export const db = drizzle(sqlite, { schema });
export const pool = null;
