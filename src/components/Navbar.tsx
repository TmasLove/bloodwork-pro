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
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={user ? dashboardLink : "/"} className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-[var(--primary)]" />
            <span className="text-lg font-bold">BloodWork Pro</span>
          </Link>

          {user ? (
            <>
              {/* Desktop nav */}
              <div className="hidden items-center gap-4 md:flex">
                <Link
                  href={dashboardLink}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[var(--secondary)] transition"
                >
                  Dashboard
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-lg p-2 hover:bg-[var(--secondary)] transition"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)] text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-lg">
                      <div className="p-3 font-semibold border-b border-[var(--border)]">
                        Notifications
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-[var(--muted)]">
                            No notifications
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`cursor-pointer border-b border-[var(--border)] p-3 text-sm hover:bg-[var(--secondary)] transition ${
                                !n.read ? "bg-blue-50 dark:bg-blue-950" : ""
                              }`}
                              onClick={() => {
                                if (!n.read) markRead(n.id);
                                if (n.link) router.push(n.link);
                                setShowNotifications(false);
                              }}
                            >
                              <p>{n.message}</p>
                              <p className="mt-1 text-xs text-[var(--muted)]">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-[var(--secondary)] px-3 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs text-white">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--secondary)] hover:text-[var(--danger)] transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden rounded-lg p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--secondary)] transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && user && (
          <div className="border-t border-[var(--border)] pb-4 pt-2 md:hidden">
            <Link
              href={dashboardLink}
              className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--secondary)]"
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <div className="mt-2 px-3 py-2 text-sm text-[var(--muted)]">
              {user.name} ({user.role})
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--secondary)]"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
