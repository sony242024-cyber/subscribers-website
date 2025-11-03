import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [handles, setHandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  const pickRandom = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pick-random", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setHandles(data.handles || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p className="p-6">Loading...</p>;

  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white shadow rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Link href="/" className="text-blue-600 underline">Home</Link>
          </div>

          <button
            onClick={pickRandom}
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Picking..." : "Pick 10 Random Users"}
          </button>

          {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

          <ul className="mt-6 space-y-2 list-disc list-inside">
            {handles.map((h, idx) => (
              <li key={idx} className="text-gray-800">{h}</li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
