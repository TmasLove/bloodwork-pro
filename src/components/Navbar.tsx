"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Menu,
  X,
  Activity,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: "PATIENT" | "DOCTOR";
}

interface Notification {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = () => {
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(() => {});
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const dashboardLink =
    user?.role === "DOCTOR" ? "/dashboard/doctor" : "/dashboard/patient";

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-[var(--border)]/50 backdrop-blur-xl bg-[var(--background)]/60">
      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-1">
          <Link href={user ? dashboardLink : "/"} className="flex items-center gap-2.5 group">
            <div className="relative">
              <Activity className="h-7 w-7 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 h-7 w-7 text-[var(--primary)] blur-sm opacity-50" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">
              BloodWork Pro
            </span>
          </Link>

          {user ? (
            <>
              {/* Desktop nav */}
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href={dashboardLink}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/80 transition-all duration-200"
                >
                  Dashboard
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-xl p-2.5 hover:bg-[var(--secondary)]/80 transition-all duration-200"
                  >
                    <Bell className="h-5 w-5 text-[var(--foreground)]/70" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)] text-xs font-semibold text-white pulse-ring">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border)]/50 glass-card backdrop-blur-xl bg-[var(--background)]/80 shadow-2xl shadow-black/10 overflow-hidden"
                      >
                        <div className="p-4 font-semibold text-sm border-b border-[var(--border)]/50 flex items-center justify-between">
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs font-medium rounded-full bg-[var(--primary)]/15 text-[var(--primary)] px-2.5 py-0.5">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-5 text-sm text-[var(--muted)] text-center">
                              No notifications
                            </p>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n.id}
                                className={`cursor-pointer border-b border-[var(--border)]/30 p-3.5 text-sm hover:bg-[var(--secondary)]/60 transition-all duration-150 ${
                                  !n.read ? "bg-[var(--primary)]/5" : ""
                                }`}
                                onClick={() => {
                                  if (!n.read) markRead(n.id);
                                  if (n.link) router.push(n.link);
                                  setShowNotifications(false);
                                }}
                              >
                                <div className="flex items-start gap-2.5">
                                  {!n.read && (
                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                                  )}
                                  <div className={!n.read ? "" : "pl-[18px]"}>
                                    <p className="leading-snug">{n.message}</p>
                                    <p className="mt-1.5 text-xs text-[var(--muted)]">
                                      {new Date(n.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)]/30 px-3.5 py-2">
                  <User className="h-4 w-4 text-[var(--foreground)]/60" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="rounded-md bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl p-2.5 text-[var(--muted)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden rounded-xl p-2.5 hover:bg-[var(--secondary)]/80 transition-all duration-200"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--foreground)]/80 hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/80 transition-all duration-200"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] shadow-md shadow-[var(--primary)]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--primary)]/30"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-[var(--border)]/50 md:hidden"
            >
              <div className="pb-4 pt-3 space-y-1">
                <Link
                  href={dashboardLink}
                  className="block rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[var(--secondary)]/80 transition-all duration-150"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="mt-2 mx-3 flex items-center gap-2.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)]/30 px-3.5 py-2.5">
                  <User className="h-4 w-4 text-[var(--foreground)]/60" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="rounded-md bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all duration-150"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
