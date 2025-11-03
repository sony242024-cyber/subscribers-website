import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";


function isAdmin(session) {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const current = session?.user?.email || "";
  return adminEmail && current && adminEmail.toLowerCase() === current.toLowerCase();
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!isAdmin(session)) {
    return res.status(403).json({ error: "Forbidden: Admin only" });
  }

  const method = req.method;

  if (method !== "GET" && method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (method === "GET") {
      const users = await prisma.user.findMany({
        where: {
          youtubeHandle: { not: null },
        },
        select: {
          id: true,
          email: true,
          name: true,
          youtubeHandle: true,
          picked: true,
          pickedAt: true,
        },
        orderBy: { createdAt: "asc" },
      });

      const notPicked = users.filter((u) => !u.picked);
      const picked = users.filter((u) => u.picked);

      return res.status(200).json({ notPicked, picked });
    }

    // POST: pick 10 random unpicked users and mark them as picked
    // Use raw SQL for random order in Postgres
    const candidates = await prisma.$queryRaw`SELECT "id" FROM "User" WHERE "youtubeHandle" IS NOT NULL AND length("youtubeHandle") > 0 AND "picked" = false ORDER BY random() LIMIT 10`;
    const ids = (candidates || []).map((c) => c.id);

    if (ids.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { picked: true, pickedAt: new Date() },
      });
    }

    // Return updated lists
    const users = await prisma.user.findMany({
      where: {
        youtubeHandle: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        youtubeHandle: true,
        picked: true,
        pickedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const notPicked = users.filter((u) => !u.picked);
    const picked = users.filter((u) => u.picked);

    return res.status(200).json({ pickedIds: ids, notPicked, picked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
