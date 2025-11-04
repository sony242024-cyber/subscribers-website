export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password } = req.body || {};

    const ADMIN_USER = process.env.ADMIN_USER || "admin";
    const ADMIN_PASS = process.env.ADMIN_PASS || "admin";

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const ok = username === ADMIN_USER && password === ADMIN_PASS;
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Issue HttpOnly cookie for admin access (30 days)
    const maxAge = 60 * 60 * 24 * 30; // 30 days
    const isProd = process.env.NODE_ENV === "production";
    const cookie = [
      `admin_auth=1`,
      `Path=/`,
      `HttpOnly`,
      `SameSite=Lax`,
      isProd ? `Secure` : undefined,
      `Max-Age=${maxAge}`,
    ]
      .filter(Boolean)
      .join("; ");

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("/api/admin/simple-login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
