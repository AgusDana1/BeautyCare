"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Sparkles, Check, ExternalLink, Calendar, Tag } from "lucide-react";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
  event?: {
    id: number;
    title: string;
    discountPercent: number;
    bannerText: string | null;
    code: string;
  } | null;
}

interface NotificationDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  onRefresh?: () => void;
}

export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  onRefresh,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        if (onRefresh) onRefresh();
      } catch (e) {
        console.error(e);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-rose-600 hover:border-rose-300 shadow-xs sm:shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center"
        aria-label="Notifikasi Event & Pembaruan"
        title="Notifikasi Event & Pembaruan"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-stone-700 hover:text-rose-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200/90 z-50 overflow-hidden animate-fade-in-down">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-stone-900">
                  Notifikasi &amp; Event
                </h4>
                <span className="text-[10px] text-stone-400">
                  Update event 12.1, 11.2, 10.3 &amp; promo khusus
                </span>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Tandai dibaca</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-stone-300 stroke-[1.5]" />
                <p className="text-xs">Belum ada notifikasi atau event baru.</p>
                <span className="text-[10px] text-stone-400 block">
                  Nantikan event diskon khusus setiap bulan di BeautyCare!
                </span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-rose-50/50 transition cursor-pointer flex gap-3 items-start ${
                    !notif.isRead ? "bg-rose-50/30" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === "EVENT"
                        ? "bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-2xs"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {notif.type === "EVENT" ? (
                      <Tag className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-xs text-stone-900 truncate">
                        {notif.title}
                      </h5>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.event && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-100/70 border border-rose-200 text-[10px] font-bold text-rose-700">
                        <span>Diskon {notif.event.discountPercent}%</span>
                        <span>•</span>
                        <span className="font-mono">{notif.event.code}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[9px] text-stone-400 mt-1">
                      <span>
                        {new Date(notif.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {notif.link && (
                        <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                          Lihat Promo <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
