import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Fetch 10 random users with non-empty youtubeHandle
    const result = await prisma.$queryRaw`SELECT "youtubeHandle" FROM "User" WHERE "youtubeHandle" IS NOT NULL AND length("youtubeHandle") > 0 ORDER BY random() LIMIT 10;`;
    const handles = (result || []).map((r) => r.youtubeHandle);

    return res.status(200).json({ handles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
