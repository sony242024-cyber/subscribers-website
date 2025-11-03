import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

export default function Dashboard() {
  const { status } = useSession();
  const [data, setData] = useState({ notPicked: [], picked: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toYouTubeUrl = (h) => {
    if (!h) return "";
    const handle = h.startsWith("@") ? h : `@${h}`;
    return `https://www.youtube.com/${handle}`;
  };

  const safeJson = async (res) => {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(text || `Unexpected response: ${res.status}`);
    }
    return res.json();
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pick-manage", { method: "GET" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to load users");
      setData({ notPicked: json.notPicked || [], picked: json.picked || [] });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const pickTen = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pick-manage", { method: "POST" });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.error || "Failed to pick users");
      setData({ notPicked: json.notPicked || [], picked: json.picked || [] });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status]);

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white shadow rounded p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link href="/" className="text-blue-600 underline">Home</Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={pickTen}
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Working..." : "Pick 10 Random Users"}
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="border rounded-lg">
              <header className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold">Available (Not Picked)</h2>
                <span className="text-sm text-gray-600">{data.notPicked.length}</span>
              </header>
              <ul className="divide-y">
                {data.notPicked.map((u) => (
                  <li key={u.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 break-all">{u.email || "(no email)"}</p>
                    <div className="text-xs text-gray-700 flex items-center gap-2">
                      <span>{u.name || "(no name)"}</span>
                      {u.youtubeHandle && (
                        <a
                          href={toYouTubeUrl(u.youtubeHandle)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline break-all"
                        >
                          {u.youtubeHandle}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
                {data.notPicked.length === 0 && (
                  <li className="px-4 py-6 text-sm text-gray-600">No users available.</li>
                )}
              </ul>
            </section>

            <section className="border rounded-lg">
              <header className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="font-semibold">Picked</h2>
                <span className="text-sm text-gray-600">{data.picked.length}</span>
              </header>
              <ul className="divide-y">
                {data.picked.map((u) => (
                  <li key={u.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 break-all">{u.email || "(no email)"}</p>
                    <div className="text-xs text-gray-700 flex items-center gap-2">
                      <span>{u.name || "(no name)"}</span>
                      {u.youtubeHandle && (
                        <a
                          href={toYouTubeUrl(u.youtubeHandle)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline break-all"
                        >
                          {u.youtubeHandle}
                        </a>
                      )}
                    </div>
                    {u.pickedAt && (
                      <p className="text-[11px] text-gray-500 mt-1">Picked at: {new Date(u.pickedAt).toLocaleString()}</p>
                    )}
                  </li>
                ))}
                {data.picked.length === 0 && (
                  <li className="px-4 py-6 text-sm text-gray-600">No picked users yet.</li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  const current = (session?.user?.email || "").toLowerCase();

  if (!session || !current || !adminEmail || current !== adminEmail) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  return { props: { session } };
}
