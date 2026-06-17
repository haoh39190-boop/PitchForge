import { Pool, type PoolConfig } from "pg";

type NeonPoolConfig = PoolConfig & {
  enableChannelBinding?: boolean;
};

const globalForDatabase = globalThis as typeof globalThis & {
  pitchForgeDatabasePool?: Pool;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

export function getDatabasePool() {
  if (!globalForDatabase.pitchForgeDatabasePool) {
    const databaseUrl = getDatabaseUrl();
    const config: NeonPoolConfig = {
      connectionString: databaseUrl,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      max: 5,
    };

    if (databaseUrl.includes("channel_binding=require")) {
      config.enableChannelBinding = true;
    }

    globalForDatabase.pitchForgeDatabasePool = new Pool(config);
  }

  return globalForDatabase.pitchForgeDatabasePool;
}

export async function checkDatabaseConnection() {
  const pool = getDatabasePool();
  const result = await pool.query<{ checked_at: Date }>(
    "select now() as checked_at"
  );

  return result.rows[0]?.checked_at ?? null;
}
