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
import { motion } from "framer-motion";

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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

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
      badgeClass: "badge-approved",
    },
    REJECTED: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-950",
      label: "Rejected",
      badgeClass: "badge-rejected",
    },
    PENDING: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950",
      label: "Pending Review",
      badgeClass: "badge-pending",
    },
  };

  const status = statusConfig[protocol.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div variants={fadeUp}>
            <motion.button
              onClick={() => router.back()}
              className="mb-8 flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-[var(--muted)] transition-all duration-300 hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </motion.button>
          </motion.div>

          {/* Header */}
          <motion.div
            variants={fadeUp}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <h1 className="gradient-text text-3xl font-bold tracking-tight">
                Health Protocol
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {protocol.bloodWork.fileName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(protocol.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className={`${status.badgeClass} flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold`}
            >
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </motion.div>
          </motion.div>

          {/* Doctor Review (if exists) */}
          {protocol.review && (
            <motion.div
              variants={fadeUp}
              className={`glass-card mt-8 rounded-2xl p-6 ${
                protocol.review.decision === "APPROVED"
                  ? "border-green-400/30 dark:border-green-500/20"
                  : "border-red-400/30 dark:border-red-500/20"
              }`}
              style={{
                borderImage:
                  protocol.review.decision === "APPROVED"
                    ? "linear-gradient(135deg, rgba(16,185,129,0.4), rgba(6,182,212,0.2)) 1"
                    : "linear-gradient(135deg, rgba(239,68,68,0.4), rgba(244,63,94,0.2)) 1",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    protocol.review.decision === "APPROVED"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-[var(--foreground)]">
                    {protocol.review.doctor.name.startsWith("Dr.") ? protocol.review.doctor.name : `Dr. ${protocol.review.doctor.name}`}
                  </span>
                  <span className="ml-2 text-sm text-[var(--muted)]">
                    &mdash;{" "}
                    {protocol.review.decision === "APPROVED"
                      ? "Approved this protocol"
                      : "Requested revisions"}
                  </span>
                </div>
              </div>
              {protocol.review.comments && (
                <p className="mt-4 rounded-xl bg-[var(--background)]/50 p-4 text-sm leading-relaxed text-[var(--foreground)]/80">
                  {protocol.review.comments}
                </p>
              )}
            </motion.div>
          )}

          {/* Pending message */}
          {protocol.status === "PENDING" && (
            <motion.div
              variants={fadeUp}
              className="glass-card mt-8 rounded-2xl p-6"
              style={{
                borderImage: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(249,115,22,0.15)) 1",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--warning)]/10"
                >
                  <Clock className="h-5 w-5 text-[var(--warning)]" />
                </motion.div>
                <div>
                  <p className="font-semibold text-[var(--warning)]">
                    Awaiting Doctor Review
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    Your protocol has been generated by AI and is waiting for a
                    physician to review and approve it. You&apos;ll be notified once it&apos;s
                    ready.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Protocol Content */}
          {(protocol.status === "APPROVED" || protocol.status === "REJECTED") && (
            <motion.div variants={fadeUp} className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Your Daily Protocol
              </h2>
              <div className="glass-card mt-4 rounded-2xl p-6 sm:p-8">
                <div
                  className="protocol-content max-w-none"
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
            </motion.div>
          )}

          {/* Pending: show summary only */}
          {protocol.status === "PENDING" && protocol.summary && (
            <motion.div variants={fadeUp} className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Protocol Summary
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Full protocol will be visible after doctor approval.
              </p>
              <div className="glass-card mt-4 rounded-2xl p-6">
                <p className="text-sm leading-relaxed">{protocol.summary}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </>
  );
}
