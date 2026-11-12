"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, User, Mail, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "login" | "register";
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
}: CustomerAuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Reset state when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }

  // Escape key & body lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mode === "login") {
        const res = await fetch("/api/customer/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal masuk ke akun.");
        }
        setSuccessMessage("Login berhasil! Memuat sesi Anda...");
        // Dispatch event for other components to reload customer data
        window.dispatchEvent(new Event("beautycare-customer-updated"));
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        const res = await fetch("/api/customer/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: identifier,
            phone,
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal mendaftar akun baru.");
        }
        setSuccessMessage("Pendaftaran berhasil! Akun Anda aktif.");
        window.dispatchEvent(new Event("beautycare-customer-updated"));
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-7 relative cursor-default border border-stone-200/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-100/60 rounded-full blur-3xl -z-10" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20 mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            {mode === "login" ? "Masuk ke Akun Customer" : "Daftar Akun Member Baru"}
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-500 max-w-xs mx-auto">
            {mode === "login"
              ? "Masuk untuk memberikan ulasan produk, kumpulkan poin loyalitas, dan terima update event diskon."
              : "Daftar sekarang untuk klaim bonus 50 poin loyalitas dan notifikasi promo bulanan 12.1, 11.2, 10.3."}
          </p>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === "register"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sarah Melati"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              {mode === "login" ? "Email atau Nomor WhatsApp" : "Alamat Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type={mode === "register" ? "email" : "text"}
                required
                placeholder={mode === "login" ? "email@domain.com / 0812..." : "email@domain.com"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Nomor WhatsApp (Untuk Loyalty Poin &amp; Notifikasi)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === "login" ? "Masuk Sekarang" : "Daftar Akun Baru"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-500">
            {mode === "login" ? "Belum punya akun BeautyCare? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-rose-600 font-bold hover:underline cursor-pointer"
            >
              {mode === "login" ? "Daftar Akun Gratis" : "Masuk ke Akun"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
