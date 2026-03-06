"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
} from "@/features/notification/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { Notification } from "@/features/notification/types";

const POLL_INTERVAL = 30_000;

export function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef(0);

  const pollUnread = useCallback(async () => {
    if (!user) return;
    try {
      const count = await fetchUnreadCount();
      if (count > prevCountRef.current && prevCountRef.current !== 0) {
        toast("즐겨찾기 소스에 새로운 글이 등록되었습니다.", {
          action: {
            label: "확인",
            onClick: () => setOpen(true),
          },
        });
      }
      prevCountRef.current = count;
      setUnreadCount(count);
    } catch {
      // ignore silently
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    pollUnread();
    const interval = setInterval(pollUnread, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [user, pollUnread]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAsRead({ all: true });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true })),
      );
      setUnreadCount(0);
      prevCountRef.current = 0;
    } catch {
      // ignore
    }
  };

  const handleClickNotification = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markAsRead({ notificationIds: [notification.id] });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      } catch {
        // ignore
      }
    }
    window.open(notification.article.url, "_blank", "noopener,noreferrer");
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-[16px] bg-elevated text-muted-foreground transition-colors hover:text-foreground",
          )}
          aria-label="알림"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 font-mono text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="font-mono text-sm font-semibold">알림</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              모두 읽음
            </button>
          )}
        </div>

        <div className="scrollbar-hide max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="font-mono text-xs text-muted-foreground">
                불러오는 중...
              </span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <span className="font-mono text-xs text-muted-foreground">
                새로운 알림이 없습니다
              </span>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClickNotification(notification)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-elevated",
                  !notification.is_read && "bg-primary/5",
                )}
              >
                <div className="shrink-0 pt-0.5">
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-orange" />
                  )}
                  {notification.is_read && <div className="h-2 w-2" />}
                </div>
                <div className="min-w-0 grow">
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {notification.article.source.name}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 font-mono text-xs",
                      !notification.is_read
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {notification.article.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
                <ExternalLink className="mt-1 h-3 w-3 shrink-0 text-muted-foreground/50" />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
