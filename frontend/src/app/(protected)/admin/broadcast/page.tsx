"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS, TRANSITIONS } from "@/lib/animations";

const NOTIFICATION_TYPES = [
  { value: "DAILY_REMINDER", label: "Lembrete Diário", icon: "🔔" },
  { value: "MOTIVATIONAL_RESET", label: "Reset Motivacional", icon: "🔥" },
  { value: "RECOVERY_FLOW", label: "Fluxo de Recuperação", icon: "🌱" },
  { value: "SYSTEM", label: "Sistema", icon: "⚙️" },
] as const;

const USER_FILTERS = [
  { value: "all", label: "Todos os usuários" },
  { value: "premium", label: "Apenas Premium" },
  { value: "free", label: "Apenas Free" },
] as const;

interface BroadcastPayload {
  type: string;
  title: string;
  body: string;
  userFilter?: string;
}

function useBroadcast() {
  return useMutation({
    mutationFn: (payload: BroadcastPayload) =>
      api.post("/admin/broadcast", payload).then((r) => r.data),
  });
}

export default function BroadcastPage(): React.ReactElement {
  const [type, setType] = useState("DAILY_REMINDER");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);

  const broadcast = useBroadcast();

  const handleSend = (): void => {
    broadcast.mutate(
      { type, title, body, userFilter: userFilter === "all" ? undefined : userFilter },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          setShowConfirm(false);
        },
        onError: () => {
          setShowConfirm(false);
        },
      }
    );
  };

  const selectedType = NOTIFICATION_TYPES.find((t) => t.value === type);
  const canSend = title.trim().length >= 3 && body.trim().length >= 10;

  return (
    <motion.div
      variants={VARIANTS.pageEnter}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[var(--q-bg-void)] p-6 max-w-xl mx-auto"
    >
      <a
        href="/admin"
        className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Admin
      </a>

      <h1 className="text-2xl font-semibold text-[var(--q-text-primary)] mb-1">Broadcast</h1>
      <p className="text-[var(--q-text-secondary)] text-sm mb-6">Enviar notificação push para usuários</p>

      <div className="space-y-5">
        {/* Tipo */}
        <motion.div variants={VARIANTS.cardReveal} initial="initial" animate="animate" className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-2xl p-4">
          <label className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-3 block">
            Tipo de notificação
          </label>
          <div className="grid grid-cols-2 gap-2">
            {NOTIFICATION_TYPES.map((t) => (
              <motion.button
                key={t.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setType(t.value)}
                className={`p-3 rounded-xl text-left text-sm transition-colors ${
                  type === t.value
                    ? "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] text-[var(--q-text-primary)]"
                    : "bg-[var(--q-bg-raised)] border border-[var(--q-border-subtle)] text-[var(--q-text-secondary)]"
                }`}
              >
                <span className="mr-2">{t.icon}</span>
                {t.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Conteúdo */}
        <motion.div variants={VARIANTS.cardReveal} initial="initial" animate="animate" transition={{ delay: 0.08 }} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-2xl p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-2 block">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Ex: Hora da sua prática diária"
              className="w-full h-11 px-4 rounded-xl bg-[var(--q-bg-input)] border border-[var(--q-border-default)] text-[var(--q-text-primary)] text-sm placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-2 block">
              Mensagem
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Cada momento de presença transforma sua jornada..."
              className="w-full px-4 py-3 rounded-xl bg-[var(--q-bg-input)] border border-[var(--q-border-default)] text-[var(--q-text-primary)] text-sm placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors resize-none"
            />
            <p className="text-xs text-[var(--q-text-tertiary)] mt-1 text-right">{body.length}/500</p>
          </div>
        </motion.div>

        {/* Filtro de destinatários */}
        <motion.div variants={VARIANTS.cardReveal} initial="initial" animate="animate" transition={{ delay: 0.16 }} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-2xl p-4">
          <label className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-3 block">
            Destinatários
          </label>
          <div className="flex gap-2">
            {USER_FILTERS.map((f) => (
              <motion.button
                key={f.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setUserFilter(f.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  userFilter === f.value
                    ? "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)] text-[var(--q-text-primary)]"
                    : "bg-[var(--q-bg-raised)] border border-[var(--q-border-subtle)] text-[var(--q-text-secondary)]"
                }`}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Preview */}
        {canSend && (
          <motion.div variants={VARIANTS.slideUp} initial="initial" animate="animate" className="bg-[var(--q-bg-raised)] border border-[var(--q-border-medium)] rounded-2xl p-4">
            <p className="text-xs text-[var(--q-text-tertiary)] uppercase tracking-wider mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--q-accent-dim)] flex items-center justify-center text-lg shrink-0">
                {selectedType?.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--q-text-primary)]">{title}</p>
                <p className="text-xs text-[var(--q-text-secondary)] mt-0.5 line-clamp-2">{body}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Status feedback */}
        <AnimatePresence>
          {broadcast.isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
            >
              <p className="text-emerald-400 text-sm">Notificação enviada com sucesso!</p>
            </motion.div>
          )}
          {broadcast.isError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
            >
              <p className="text-red-400 text-sm">Erro ao enviar. Tente novamente.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send button with confirmation */}
        {!showConfirm ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => setShowConfirm(true)}
            disabled={!canSend || broadcast.isPending}
            className="w-full h-12 rounded-full bg-[var(--q-accent-8)] text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {broadcast.isPending ? "Enviando..." : "Enviar Notificação"}
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-12 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] text-[var(--q-text-secondary)] font-medium"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              className="flex-1 h-12 rounded-full bg-red-600 text-white font-medium"
            >
              Confirmar envio
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
