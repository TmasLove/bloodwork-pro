"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Patient Dashboard</h1>
        <p className="mt-1 text-[var(--muted)]">
          Upload your blood work and track your health protocols.
        </p>

        {/* Upload Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Upload Blood Work</h2>
          <div
            className={`mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition ${
              dragActive
                ? "border-[var(--primary)] bg-blue-50 dark:bg-blue-950"
                : "border-[var(--border)] hover:border-[var(--primary)]"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">
                  Uploading and analyzing your blood work...
                </p>
                <p className="text-xs text-[var(--muted)]">
                  This may take a minute while we extract text and generate your protocol.
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-[var(--muted)]" />
                <p className="mt-3 text-sm font-medium">
                  Drag & drop your blood work file here
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  PDF, PNG, JPG, or TIFF
                </p>
                <label className="mt-4 cursor-pointer rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition">
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

          {uploadError && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
              {uploadSuccess}
            </div>
          )}
        </div>

        {/* Protocols List */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold">Your Protocols</h2>

          {loading ? (
            <div className="mt-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted)]" />
            </div>
          ) : protocols.length === 0 ? (
            <div className="mt-6 rounded-xl border border-[var(--border)] p-10 text-center">
              <FileText className="mx-auto h-12 w-12 text-[var(--muted)]" />
              <p className="mt-3 font-medium">No protocols yet</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Upload your blood work to get started.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {protocols.map((p) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/protocol/${p.id}`)}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border border-[var(--border)] p-5 hover:bg-[var(--secondary)] transition"
                >
                  {statusIcon(p.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {p.bloodWork.fileName}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      {p.summary
                        ? p.summary.slice(0, 100) + "..."
                        : "Protocol generated"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        p.status === "APPROVED"
                          ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                          : p.status === "REJECTED"
                          ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                          : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400"
                      }`}
                    >
                      {p.status}
                    </span>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
