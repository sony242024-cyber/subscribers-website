import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ name: "", phone: "", youtubeHandle: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user?.name) {
      setForm((f) => ({ ...f, name: session.user.name }));
    }
  }, [session?.user?.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/user/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          youtubeHandle: form.youtubeHandle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setMessage("Details saved successfully!");
    } catch (err) {
      setMessage(err.message || "Something went wrong");
    }
  };

  return (
    <>
      <Head>
        <title>My YouTube Site</title>
      </Head>
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white shadow rounded p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">My YouTube Site</h1>

          {status === "loading" && <p>Loading...</p>}

          {!session ? (
            <div className="text-center">
              <p className="mb-4">Please sign in to continue</p>
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign in with Google
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm">Signed in as {session.user?.email}</p>
                <div className="space-x-2">
                  <Link href="/dashboard" className="text-blue-600 underline">
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Sign out
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">YouTube Handle Name</label>
                  <input
                    type="text"
                    value={form.youtubeHandle}
                    onChange={(e) => setForm({ ...form, youtubeHandle: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g. @mychannel"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Details
                </button>
              </form>

              {message && (
                <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
