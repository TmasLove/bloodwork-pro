"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Loader2,
  User,
  Calendar,
} from "lucide-react";

interface ProtocolDetail {
  id: string;
  status: string;
  content: string;
  summary: string | null;
  createdAt: string;
  patient: { id: string; name: string; email: string };
  bloodWork: {
    id: string;
    fileName: string;
    fileType: string;
    extractedText: string | null;
    createdAt: string;
  };
  review: {
    doctor: { id: string; name: string };
    decision: string;
    comments: string | null;
    createdAt: string;
  } | null;
}

export default function ProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [protocol, setProtocol] = useState<ProtocolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/protocols/${id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        if (!r.ok) throw new Error("Failed to load protocol");
        return r.json();
      })
      .then((data) => {
        if (data) setProtocol(data.protocol);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
        </div>
      </>
    );
  }

  if (error || !protocol) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <p className="text-red-500">{error || "Protocol not found"}</p>
          <Link
            href="/dashboard/patient"
            className="mt-4 text-[var(--primary)] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </>
    );
  }

  const statusConfig = {
    APPROVED: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950",
      label: "Approved",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950",
      label: "Rejected",
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950",
      label: "Pending Review",
    },
  };

  const status = statusConfig[protocol.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Health Protocol</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {protocol.bloodWork.fileName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(protocol.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${status.bg} ${status.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </div>
        </div>

        {/* Doctor Review (if exists) */}
        {protocol.review && (
          <div
            className={`mt-6 rounded-xl border p-5 ${
              protocol.review.decision === "APPROVED"
                ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">
                {protocol.review.doctor.name.startsWith("Dr.") ? protocol.review.doctor.name : `Dr. ${protocol.review.doctor.name}`}
              </span>
              <span className="text-sm text-[var(--muted)]">
                &mdash;{" "}
                {protocol.review.decision === "APPROVED"
                  ? "Approved this protocol"
                  : "Requested revisions"}
              </span>
            </div>
            {protocol.review.comments && (
              <p className="mt-2 text-sm">{protocol.review.comments}</p>
            )}
          </div>
        )}

        {/* Pending message */}
        {protocol.status === "PENDING" && (
          <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="font-medium text-yellow-700 dark:text-yellow-400">
                Awaiting Doctor Review
              </p>
            </div>
            <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-500">
              Your protocol has been generated by AI and is waiting for a
              physician to review and approve it. You&apos;ll be notified once it&apos;s
              ready.
            </p>
          </div>
        )}

        {/* Protocol Content */}
        {(protocol.status === "APPROVED" || protocol.status === "REJECTED") && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Your Daily Protocol</h2>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: protocol.content
                    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-5 mb-2">$1</h3>')
                    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mt-6 mb-2">$1</h2>')
                    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-8 mb-3">$1</h1>')
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>")
                    .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
                    .replace(/\n\n/g, '</p><p class="mt-3">')
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          </div>
        )}

        {/* Pending: show summary only */}
        {protocol.status === "PENDING" && protocol.summary && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Protocol Summary</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Full protocol will be visible after doctor approval.
            </p>
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)] p-5">
              <p className="text-sm">{protocol.summary}</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
