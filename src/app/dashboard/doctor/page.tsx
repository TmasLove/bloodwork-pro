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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
            <p className="mt-1 text-[var(--muted)]">
              Review and approve patient protocols.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="rounded-full bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400">
              {pendingCount} pending review{pendingCount > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--muted)]" />
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === f
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] hover:bg-[var(--border)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[var(--border)] p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-[var(--muted)]" />
            <p className="mt-3 font-medium">No protocols found</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {filter === "PENDING"
                ? "All protocols have been reviewed."
                : "No protocols match this filter."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[var(--border)] overflow-hidden"
              >
                <div
                  className="flex cursor-pointer items-center gap-4 p-5 hover:bg-[var(--secondary)] transition"
                  onClick={() =>
                    setSelectedProtocol(
                      selectedProtocol?.id === p.id ? null : p
                    )
                  }
                >
                  {p.status === "PENDING" ? (
                    <Clock className="h-5 w-5 text-yellow-500 shrink-0" />
                  ) : p.status === "APPROVED" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[var(--muted)]" />
                      <span className="font-medium">{p.patient.name}</span>
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
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        p.status === "APPROVED"
                          ? "bg-green-50 text-green-600 dark:bg-green-950"
                          : p.status === "REJECTED"
                          ? "bg-red-50 text-red-600 dark:bg-red-950"
                          : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950"
                      }`}
                    >
                      {p.status}
                    </span>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Expanded view */}
                {selectedProtocol?.id === p.id && (
                  <div className="border-t border-[var(--border)] bg-[var(--secondary)]/50 p-6">
                    <h3 className="text-sm font-semibold uppercase text-[var(--muted)]">
                      AI-Generated Protocol
                    </h3>
                    <div className="mt-3 max-h-96 overflow-y-auto rounded-lg bg-[var(--background)] border border-[var(--border)] p-5">
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
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

                    {p.review && (
                      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                        <p className="text-sm font-medium">
                          Reviewed by Dr. {p.review.doctor.name} &mdash;{" "}
                          <span
                            className={
                              p.review.decision === "APPROVED"
                                ? "text-green-600"
                                : "text-red-600"
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

                    {p.status === "PENDING" && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium">
                          Review Comments (optional)
                        </label>
                        <textarea
                          value={reviewComments}
                          onChange={(e) => setReviewComments(e.target.value)}
                          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition"
                          rows={3}
                          placeholder="Add notes or feedback for the patient..."
                        />
                        <div className="mt-3 flex gap-3">
                          <button
                            onClick={() => handleReview(p.id, "APPROVED")}
                            disabled={reviewing}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition"
                          >
                            {reviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve Protocol
                          </button>
                          <button
                            onClick={() => handleReview(p.id, "REJECTED")}
                            disabled={reviewing}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            {reviewing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject Protocol
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
