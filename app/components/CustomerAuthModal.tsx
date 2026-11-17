"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Lock, Phone, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

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
      className="fixed inset-0 z-[85] bg-[#292925]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in cursor-pointer font-sans"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-[#EAE4DA] shadow-2xl max-w-md w-full p-6 sm:p-8 relative cursor-default rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#292925]/50 hover:text-[#292925] p-1 transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-6">
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#87947B] block font-sans">
            Atelier Membership
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-[#292925]">
            {mode === "login" ? "Masuk ke Akun Customer" : "Daftar Anggota Baru"}
          </h3>
          <p className="text-xs text-[#292925]/65 max-w-xs mx-auto leading-relaxed font-sans">
            {mode === "login"
              ? "Akses riwayat formulasi, evaluasi produk terverifikasi, dan perolehan poin privilege."
              : "Bergabung bersama komunitas BeautyCare untuk menikmati sambutan 50 poin loyalty dan dispatches formulasi eksklusif."}
          </p>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF8F4] border border-[#EAE4DA] rounded-sm mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className={`py-2 transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#292925] text-[#FAF8F4]"
                : "text-[#292925]/70 hover:text-[#292925]"
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
            className={`py-2 transition-all cursor-pointer ${
              mode === "register"
                ? "bg-[#292925] text-[#FAF8F4]"
                : "text-[#292925]/70 hover:text-[#292925]"
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-[#87947B]/15 border border-[#87947B] text-[#292925] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#87947B] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === "register" && (
            <div>
              <label className="block font-medium text-[#292925] mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#292925]/40 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DA] outline-none focus:border-[#292925] bg-[#FAF8F4] text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#292925] mb-1">
              {mode === "login" ? "Email atau Nomor WhatsApp" : "Alamat Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#292925]/40 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type={mode === "register" ? "email" : "text"}
                required
                placeholder={mode === "login" ? "email@domain.com atau 0812..." : "email@domain.com"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#EAE4DA] outline-none focus:border-[#292925] bg-[#FAF8F4] text-xs"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block font-medium text-[#292925] mb-1">
                Nomor WhatsApp (Untuk Akumulasi Poin)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#292925]/40 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#EAE4DA] outline-none focus:border-[#292925] bg-[#FAF8F4] text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-[#292925] mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#292925]/40 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#EAE4DA] outline-none focus:border-[#292925] bg-[#FAF8F4] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#292925] hover:bg-[#87947B] text-[#FAF8F4] font-medium text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <span>{mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-3 border-t border-[#EAE4DA] text-center">
          <p className="text-xs text-[#292925]/60 font-sans">
            {mode === "login" ? "Belum memiliki akun BeautyCare? " : "Sudah terdaftar sebelumnya? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-[#87947B] font-medium hover:text-[#292925] underline cursor-pointer"
            >
              {mode === "login" ? "Daftar Member Baru" : "Masuk ke Akun"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
