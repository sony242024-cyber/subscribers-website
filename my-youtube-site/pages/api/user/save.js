import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";


export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) return res.status(401).json({ error: "Unauthorized" });

  const { name, phone, youtubeHandle } = req.body || {};

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: { name, phone, youtubeHandle },
      create: {
        email: session.user.email,
        name,
        phone,
        youtubeHandle,
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("/api/user/save error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err?.message || null });
  }
}
