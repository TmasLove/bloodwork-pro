"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  User,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Protocol {
  id: string;
  status: string;
  summary: string | null;
  content: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  bloodWork: {
    id: string;
    fileName: string;
    fileType: string;
    createdAt: string;
  };
  review: {
    doctor: { id: string; name: string };
    decision: string;
    comments: string | null;
    createdAt: string;
  } | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const fetchProtocols = useCallback(() => {
    fetch("/api/protocols")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setProtocols(data.protocols || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  const handleReview = async (protocolId: string, decision: "APPROVED" | "REJECTED") => {
    setReviewing(true);
    try {
      const res = await fetch(`/api/protocols/${protocolId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comments: reviewComments }),
      });

      if (res.ok) {
        setSelectedProtocol(null);
        setReviewComments("");
        fetchProtocols();
      }
    } catch {
      // Error handling
    } finally {
      setReviewing(false);
    }
  };

  const filtered = protocols.filter(
    (p) => filter === "ALL" || p.status === filter
  );

  const pendingCount = protocols.filter((p) => p.status === "PENDING").length;

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED": return "badge-approved";
      case "REJECTED": return "badge-rejected";
      default: return "badge-pending";
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="gradient-text text-3xl font-bold tracking-tight">
                Doctor Dashboard
              </h1>
              <p className="mt-2 text-[var(--muted)]">
                Review and approve patient protocols.
              </p>
            </div>
            {pendingCount > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="badge-pending rounded-full px-4 py-2 text-sm font-semibold"
              >
                {pendingCount} pending review{pendingCount > 1 ? "s" : ""}
              </motion.div>
            )}
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={fadeUp}
            className="mt-8 flex items-center gap-2"
          >
            <Filter className="h-4 w-4 text-[var(--muted)]" />
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  filter === f
                    ? "gradient-btn shadow-lg"
                    : "glass-card hover:border-[var(--primary)] hover:shadow-[var(--glow)]"
                }`}
              >
                {filter === f ? <span>{f}</span> : f}
              </motion.button>
            ))}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="mt-10 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="glass-card mt-10 rounded-2xl p-12 text-center"
            >
              <FileText className="mx-auto h-12 w-12 text-[var(--muted)]" />
              <p className="mt-4 text-lg font-medium">No protocols found</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {filter === "PENDING"
                  ? "All protocols have been reviewed."
                  : "No protocols match this filter."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="mt-8 space-y-4"
            >
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  layout
                  className="glass-card glass-card-hover rounded-2xl overflow-hidden"
                >
                  {/* Card Header Row */}
                  <div
                    className="flex cursor-pointer items-center gap-4 p-5 transition-colors duration-200 hover:bg-[var(--secondary)]/40"
                    onClick={() =>
                      setSelectedProtocol(
                        selectedProtocol?.id === p.id ? null : p
                      )
                    }
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        p.status === "PENDING"
                          ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                          : p.status === "APPROVED"
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--danger)]/10 text-[var(--danger)]"
                      }`}
                    >
                      {p.status === "PENDING" ? (
                        <Clock className="h-5 w-5" />
                      ) : p.status === "APPROVED" ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[var(--muted)]" />
                        <span className="font-semibold text-[var(--foreground)]">
                          {p.patient.name}
                        </span>
                        <span className="text-sm text-[var(--muted)]">
                          ({p.patient.email})
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)] truncate">
                        {p.bloodWork.fileName} &mdash;{" "}
                        {p.summary?.slice(0, 80) || "Protocol generated"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`${getBadgeClass(p.status)} inline-block rounded-full px-3 py-1 text-xs font-semibold`}
                      >
                        {p.status}
                      </span>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Expanded view */}
                  <AnimatePresence>
                    {selectedProtocol?.id === p.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[var(--glass-border)] bg-[var(--secondary)]/30 p-6">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                            AI-Generated Protocol
                          </h3>
                          <div className="glass-card mt-4 max-h-96 overflow-y-auto rounded-xl p-6">
                            <div
                              className="protocol-content max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: p.content
                                  .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
                                  .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
                                  .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                  .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                                  .replace(/\n/g, "<br/>"),
                              }}
                            />
                          </div>

                          {/* Previous review info */}
                          {p.review && (
                            <div className="glass-card mt-5 rounded-xl p-5">
                              <p className="text-sm font-medium">
                                Reviewed by Dr. {p.review.doctor.name} &mdash;{" "}
                                <span
                                  className={
                                    p.review.decision === "APPROVED"
                                      ? "text-[var(--success)]"
                                      : "text-[var(--danger)]"
                                  }
                                >
                                  {p.review.decision}
                                </span>
                              </p>
                              {p.review.comments && (
                                <p className="mt-2 text-sm text-[var(--muted)]">
                                  {p.review.comments}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Review actions for pending */}
                          {p.status === "PENDING" && (
                            <div className="mt-5">
                              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                                Review Comments (optional)
                              </label>
                              <textarea
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                className="input-glow w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition-all duration-300"
                                rows={3}
                                placeholder="Add notes or feedback for the patient..."
                              />
                              <div className="mt-4 flex gap-3">
                                <motion.button
                                  onClick={() => handleReview(p.id, "APPROVED")}
                                  disabled={reviewing}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="gradient-btn flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all duration-300"
                                >
                                  {reviewing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  <span>Approve Protocol</span>
                                </motion.button>
                                <motion.button
                                  onClick={() => handleReview(p.id, "REJECTED")}
                                  disabled={reviewing}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="glass-card flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-[var(--danger)] hover:border-[var(--danger)] disabled:opacity-50 transition-all duration-300"
                                >
                                  {reviewing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <XCircle className="h-4 w-4" />
                                  )}
                                  Reject Protocol
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}
