"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      const role = data.user.role;
      router.push(role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      style={{ background: "var(--background)" }}
    >
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <Link href="/" className="inline-flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              BloodWork Pro
            </span>
          </Link>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            Welcome back
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          <form
            onSubmit={handleSubmit}
            className="glass-card relative overflow-hidden rounded-2xl p-8"
          >
            {/* Gradient accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, var(--primary), var(--accent), var(--accent-2))",
              }}
            />

            <h2
              className="mb-6 text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Log In
            </h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card mb-4 rounded-xl border p-3 text-sm"
                style={{
                  borderColor: "rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                }}
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-glow w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--secondary)",
                    color: "var(--foreground)",
                  }}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-glow w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--secondary)",
                    color: "var(--foreground)",
                  }}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-btn mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Log In
            </button>

            <p
              className="mt-5 text-center text-sm"
              style={{ color: "var(--muted)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium transition hover:underline"
                style={{ color: "var(--primary)" }}
              >
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
