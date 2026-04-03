"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { useSettings, useUpdateNotificationTime } from "@/hooks/useSettings";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { NotificationTimeSelector } from "@/components/settings/NotificationTimeSelector";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const SECTION_LABEL = "text-[var(--q-text-tertiary)] text-xs uppercase tracking-[0.15em] mb-3 font-medium";
const CARD = "bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-4";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { mutate: updateTime } = useUpdateNotificationTime();
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    isLoading: notifLoading,
  } = useNotifications();

  const notifEnabled = isSubscribed && permission === "granted";

  const handleToggleNotifications = async () => {
    if (notifEnabled) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 pt-safe">
      {/* Header */}
      <motion.div
        variants={VARIANTS.pageEnter}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <button
          onClick={() => router.back()}
          className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Voltar
        </button>
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Configurações</h1>
      </motion.div>

      <motion.div
        {...stagger(0.08)}
        initial="initial"
        animate="animate"
        className="space-y-8 max-w-md"
      >
        {/* ── NOTIFICATIONS SECTION ──────────────────── */}
        <motion.section variants={VARIANTS.cardReveal}>
          <p className={SECTION_LABEL}>Notificações</p>
          <div className="space-y-3">

            {/* Push toggle card */}
            <div className={CARD}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--q-text-primary)]">
                    Push Notifications
                  </p>
                  <p className="text-xs text-[var(--q-text-secondary)] mt-0.5">
                    {!isSupported
                      ? "Não suportado neste navegador"
                      : permission === "denied"
                      ? "Bloqueado nas configurações do navegador"
                      : notifEnabled
                      ? "Ativadas"
                      : "Desativadas"}
                  </p>
                </div>
                <ToggleSwitch
                  id="push-notifications"
                  checked={notifEnabled}
                  onChange={handleToggleNotifications}
                  disabled={!isSupported || permission === "denied" || notifLoading}
                />
              </div>

              {permission === "denied" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-[var(--q-amber-8)] bg-[var(--q-amber-dim)] rounded-[var(--q-radius-sm)] px-3 py-2"
                >
                  📵 Para ativar, vá nas configurações do seu navegador e permita notificações para este site.
                </motion.p>
              )}
            </div>

            {/* Time selector — only if notifications are active */}
            <AnimatePresence>
              {notifEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={CARD}>
                    <p className="text-sm font-medium text-[var(--q-text-primary)] mb-3">
                      Horário preferido
                    </p>
                    <NotificationTimeSelector
                      value={settings?.notificationTime ?? null}
                      onChange={updateTime}
                      disabled={settingsLoading}
                    />
                    <p className="text-xs text-[var(--q-text-tertiary)] mt-2">
                      Receba seu lembrete diário neste horário.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── LANGUAGE SECTION ────────────────────────── */}
        <motion.section variants={VARIANTS.cardReveal}>
          <p className={SECTION_LABEL}>Idioma</p>
          <div className={CARD}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--q-text-primary)]">Português (Brasil)</p>
                <p className="text-xs text-[var(--q-text-tertiary)] mt-0.5">Outros idiomas em breve</p>
              </div>
              <span className="text-[var(--q-text-tertiary)] text-xs">🌎</span>
            </div>
          </div>
        </motion.section>

        {/* ── ACCOUNT SECTION ─────────────────────────── */}
        <motion.section variants={VARIANTS.cardReveal}>
          <p className={SECTION_LABEL}>Conta</p>
          <div className="space-y-2">

            <button
              onClick={() => router.push('/plans')}
              className={`${CARD} w-full flex items-center justify-between text-sm text-[var(--q-text-primary)] hover:border-[var(--q-border-strong)] transition-colors`}>
              Gerenciar assinatura
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/profile')}
              className={`${CARD} w-full flex items-center justify-between text-sm text-[var(--q-text-primary)] hover:border-[var(--q-border-strong)] transition-colors`}>
              Exportar meus dados
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            {/* Logout */}
            <div className={CARD}>
              {!showLogoutConfirm ? (
                <motion.button
                  onClick={() => setShowLogoutConfirm(true)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full text-left text-sm text-[var(--q-red-8)] font-medium"
                >
                  Sair da conta
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-[var(--q-text-secondary)]">
                    Tem certeza que deseja sair?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={handleLogout}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-[var(--q-radius-md)] bg-[var(--q-red-dim)] border border-[var(--q-red-8)] text-[var(--q-red-9)] text-sm font-medium"
                    >
                      Sim, sair
                    </motion.button>
                    <motion.button
                      onClick={() => setShowLogoutConfirm(false)}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-[var(--q-radius-md)] border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-sm"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Version */}
        <motion.p
          variants={VARIANTS.fadeIn}
          className="text-center text-xs text-[var(--q-text-tertiary)] pb-8"
        >
          Quantum Project · v1.0.0
        </motion.p>
      </motion.div>
    </div>
  );
}
