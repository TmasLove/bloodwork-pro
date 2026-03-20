"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Upload,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Protocol {
  id: string;
  status: string;
  summary: string | null;
  createdAt: string;
  bloodWork: {
    id: string;
    fileName: string;
    fileType: string;
    createdAt: string;
  };
  review: {
    doctor: { name: string };
    comments: string | null;
    decision: string;
  } | null;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragActive, setDragActive] = useState(false);

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

  const handleUpload = async (file: File) => {
    setUploadError("");
    setUploadSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }

      setUploadSuccess(data.message || "Upload successful!");
      fetchProtocols();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "badge-approved";
      case "REJECTED":
        return "badge-rejected";
      case "PENDING":
        return "badge-pending";
      default:
        return "badge-pending";
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Patient Dashboard
          </h1>
          <p className="mt-3 text-base text-[var(--muted)] max-w-2xl">
            Upload your blood work results and track your personalized health
            protocols in one place.
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Upload Blood Work
          </h2>
          <div
            className={`upload-zone mt-4 ${dragActive ? "drag-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2
                    className="h-12 w-12 animate-spin"
                    style={{ color: "var(--accent)" }}
                  />
                  <div
                    className="absolute inset-0 h-12 w-12 rounded-full blur-xl opacity-30 animate-pulse"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Uploading and analyzing your blood work...
                </p>
                <p className="text-xs text-[var(--muted)]">
                  This may take a minute while we extract text and generate your
                  protocol.
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="h-12 w-12 text-[var(--muted)]" />
                </motion.div>
                <p className="mt-4 text-sm font-medium text-[var(--foreground)]">
                  Drag & drop your blood work file here
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  PDF, PNG, JPG, or TIFF
                </p>
                <label className="glass-card gradient-btn mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 active:scale-95">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.tiff"
                    onChange={onFileChange}
                  />
                </label>
              </>
            )}
          </div>

          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="glass-card mt-4 flex items-center gap-3 rounded-xl p-4 text-sm"
                style={{
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  backgroundColor: "rgba(239, 68, 68, 0.06)",
                }}
              >
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span className="text-red-600 dark:text-red-400">
                  {uploadError}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="glass-card mt-4 flex items-center gap-3 rounded-xl p-4 text-sm"
                style={{
                  borderColor: "rgba(34, 197, 94, 0.3)",
                  backgroundColor: "rgba(34, 197, 94, 0.06)",
                }}
              >
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  {uploadSuccess}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Protocols List */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Your Protocols
          </h2>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="relative">
                <Loader2
                  className="h-10 w-10 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
                <div
                  className="absolute inset-0 h-10 w-10 rounded-full blur-xl opacity-30 animate-pulse"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              </div>
            </div>
          ) : protocols.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-card mt-6 rounded-2xl p-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <FileText className="mx-auto h-14 w-14 text-[var(--muted)]" />
              </motion.div>
              <p className="mt-4 text-base font-medium text-[var(--foreground)]">
                No protocols yet
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Upload your blood work above to get started with your first
                protocol.
              </p>
            </motion.div>
          ) : (
            <div className="mt-5 space-y-3">
              {protocols.map((p, index) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.07,
                    ease: "easeOut",
                  }}
                  onClick={() => router.push(`/dashboard/protocol/${p.id}`)}
                  className="glass-card glass-card-hover flex cursor-pointer items-center gap-4 rounded-xl p-5 transition-all"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--secondary)" }}
                  >
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-[var(--foreground)]">
                      {p.bloodWork.fileName}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)] line-clamp-1">
                      {p.summary
                        ? p.summary.slice(0, 100) + "..."
                        : "Protocol generated"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      {statusIcon(p.status)}
                      <span className={`${statusBadgeClass(p.status)} inline-block rounded-full px-3 py-1 text-xs font-semibold`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
