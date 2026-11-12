import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: unknown;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  const u = new URL(databaseUrl);
  const sslParam = u.searchParams.get("ssl-mode") || u.searchParams.get("ssl");
  const useSsl =
    sslParam === "REQUIRED" ||
    sslParam === "true" ||
    u.hostname.includes("aivencloud.com") ||
    databaseUrl.includes("ssl-mode=REQUIRED");

  const pool =
    (globalForPrisma.pool as ReturnType<typeof mariadb.createPool>) ??
    mariadb.createPool({
      host: u.hostname,
      port: parseInt(u.port || "3306", 10),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      connectionLimit: 10,
      connectTimeout: 10000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaMariaDb(pool as any);
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  // If global client is missing or is stale (e.g. missing newly added fields on user)
  if (
    !globalForPrisma.prisma ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !(globalForPrisma.prisma as any).user?.fields?.phone
  ) {
    if (globalForPrisma.prisma) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalForPrisma.prisma as any).$disconnect === "function") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalForPrisma.prisma as any).$disconnect().catch(() => {});
      }
    }
    const freshClient = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = freshClient;
    }
    return freshClient;
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
