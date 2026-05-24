import { Pool, type PoolClient } from "pg";

// Surface misconfiguration early — fail loudly at startup, not silently at runtime
if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.error("[db] DATABASE_URL is not set — all database calls will fail");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep pool small — Vercel serverless reuses instances but each function
  // invocation can spawn its own pool. With max=5 we stay within
  // typical Postgres connection limits even under parallel deployments.
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
  // Automatically close & remove errored clients so they aren't reused
  allowExitOnIdle: true,
});

// Log connection errors at pool level (won't crash the process)
pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

/**
 * Run a parameterized query and return typed rows.
 *
 * Usage:
 *   const users = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  try {
    const { rows } = await pool.query(sql, params);
    return rows as T[];
  } catch (err: unknown) {
    // Re-throw with the SQL context so error logs are actionable
    const msg = err instanceof Error ? err.message : String(err);
    // Redact params to avoid leaking PII in logs
    throw new Error(`[db] Query failed: ${msg} | SQL: ${sql.slice(0, 120)}`);
  }
}

/**
 * Acquire a client for multi-statement transactions.
 * Caller MUST call client.release() in a finally block.
 *
 * Usage:
 *   const client = await getDb();
 *   try {
 *     await client.query("BEGIN");
 *     // ... statements ...
 *     await client.query("COMMIT");
 *   } catch {
 *     await client.query("ROLLBACK");
 *   } finally {
 *     client.release();
 *   }
 */
export async function getDb(): Promise<PoolClient> {
  try {
    return await pool.connect();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[db] Could not acquire connection: ${msg}`);
  }
}

/**
 * Run a callback inside a transaction, committing on success and
 * rolling back automatically on error.
 *
 * Usage:
 *   const result = await withTransaction(async (client) => {
 *     const [row] = await client.query("INSERT INTO ... RETURNING id");
 *     await client.query("INSERT INTO ... VALUES ($1)", [row.id]);
 *     return row;
 *   });
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDb();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
