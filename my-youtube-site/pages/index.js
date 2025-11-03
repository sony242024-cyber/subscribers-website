import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [handles, setHandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);

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
    try {
      return await res.json();
    } catch (e) {
      throw new Error("Failed to parse JSON response");
    }
  };

  const fetchRandom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pick-random", { method: "POST" });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.error || "Failed to fetch users");
      setHandles(Array.isArray(data.handles) ? data.handles : []);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRandom();
    }
  }, [status]);

  const copyToClipboard = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch (e) {
      // no-op
    }
  };

  return (
    <>
      <Head>
        <title>Get Real Subscribers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center font-extrabold text-xl tracking-tight">
              <span className="text-indigo-600">YT</span>
              <span className="ml-1 text-gray-900">Subscribers</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <Link href="/" className="hover:text-indigo-600">Home</Link>
              <Link href="/contact" className="hover:text-indigo-600">Contact Us</Link>
              <Link href="/about" className="hover:text-indigo-600">About Us</Link>
              <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {status !== "authenticated" ? (
              <>
                <button
                  onClick={() => signIn("google")}
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
                >
                  Sign up
                </button>
                <button
                  onClick={() => signIn("google")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                GET Ral Subscribers
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Discover and share YouTube handles. Copy links instantly and grow your community.
              </p>
              <div className="mt-6 flex gap-3">
                {status !== "authenticated" ? (
                  <>
                    <button
                      onClick={() => signIn("google")}
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                    >
                      Get Started
                    </button>
                    <a
                      href="#list"
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Explore List
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href="#list"
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
                    >
                      View 10 Random Users
                    </Link>
                    <button
                      onClick={fetchRandom}
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                    >
                      {loading ? "Loading..." : "Refresh"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-8 bg-gradient-to-tr from-indigo-100 to-pink-100 rounded-3xl rotate-1" />
              <div className="relative bg-white border shadow-xl rounded-2xl p-6">
                <div className="h-40 w-72 bg-gray-100 rounded-lg" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-56 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-64 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* List Section */}
      <section id="list" className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">10 Users (Name / URL)</h2>
              {status === "authenticated" && (
                <button
                  onClick={fetchRandom}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              )}
            </div>

            <div className="p-6">
              {status === "loading" && <p className="text-gray-600">Loading session...</p>}

              {status !== "authenticated" && (
                <div className="text-center">
                  <p className="text-gray-700 mb-3">Login to view the list of users</p>
                  <button
                    onClick={() => signIn("google")}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Login with Google
                  </button>
                </div>
              )}

              {status === "authenticated" && (
                <>
                  {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                  {handles.length === 0 && !loading && (
                    <p className="text-gray-600">No users found. Try refreshing.</p>
                  )}
                  <ul className="divide-y divide-gray-200">
                    {handles.map((h, idx) => {
                      const url = toYouTubeUrl(h);
                      return (
                        <li key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{h}</p>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-indigo-600 hover:underline break-all"
                            >
                              {url}
                            </a>
                          </div>
                          <div className="shrink-0">
                            <button
                              onClick={() => copyToClipboard(url, idx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                              title="Copy URL"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              {copiedIdx === idx ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} YT Subscribers. All rights reserved.
        </div>
      </footer>
    </>
  );
}
