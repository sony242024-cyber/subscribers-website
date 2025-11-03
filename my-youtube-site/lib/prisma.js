import { PrismaClient } from "@prisma/client";

// Ensure a single PrismaClient instance in development to avoid exhausting DB connections
// In production (Vercel serverless), a new instance per invocation is fine, but caching is harmless
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
