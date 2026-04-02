"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  level: string;
  isPremium: boolean;
  consciousnessScore: number;
  streak: number;
  currentDay: number;
  profileType: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  lastSessionDate: string | null;
  contents: { id: string; day: number; isCompleted: boolean; completedAt: string | null; generatedAt: string }[];
  usages: { id: string; date: string; modelUsed: string; costEstimate: number; requestsCount: number }[];
  notifications: { id: string; type: string; title: string; body: string; sentAt: string }[];
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "var(--q-text-tertiary)",
  AWARE: "var(--q-cyan-9)",
  CONSISTENT: "var(--q-green-9)",
  ALIGNED: "var(--q-amber-9)",
  INTEGRATED: "var(--q-accent-9)",
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => api.get<{ user: UserDetail }>(`/admin/users/${userId}`).then((r) => r.data.user),
    staleTime: 1000 * 30,
  });

  const premiumMutation = useMutation({
    mutationFn: (isPremium: boolean) =>
      api.put(`/admin/users/${userId}/premium`, { isPremium }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: (role: string) =>
      api.put(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-red-8)]">Erro ao carregar usuário.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6"><div className="max-w-4xl mx-auto">
      {/* Back link */}
      <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/admin/users")}
          className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Usuários
        </motion.button>
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Detalhe do Usuário</h1>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
          ))}
        </div>
      ) : user ? (
        <motion.div {...stagger(0.08)} initial="initial" animate="animate" className="max-w-2xl space-y-5">
          {/* User header card */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--q-text-primary)]">{user.name || "Sem nome"}</h2>
                <p className="text-sm text-[var(--q-text-secondary)] mt-0.5">{user.email}</p>
                <div className="flex gap-2 mt-3">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color: LEVEL_COLORS[user.level] ?? "var(--q-text-tertiary)",
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${LEVEL_COLORS[user.level] ?? "var(--q-border-default)"}`,
                    }}
                  >
                    {user.level}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.isPremium
                      ? "bg-[var(--q-amber-dim)] text-[var(--q-amber-9)] border border-[var(--q-amber-8)]/30"
                      : "bg-white/5 text-[var(--q-text-tertiary)] border border-[var(--q-border-default)]"
                  }`}>
                    {user.isPremium ? "Premium" : "Free"}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === "ADMIN"
                      ? "bg-[var(--q-accent-dim)] text-[var(--q-accent-9)] border border-[var(--q-accent-8)]/30"
                      : "bg-white/5 text-[var(--q-text-tertiary)] border border-[var(--q-border-default)]"
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--q-text-tertiary)]">
                Criado: {new Date(user.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Score", value: user.consciousnessScore, color: "var(--q-accent-9)" },
              { label: "Streak", value: `${user.streak}d`, color: "var(--q-amber-9)" },
              { label: "Dia", value: user.currentDay, color: "var(--q-cyan-9)" },
              { label: "Perfil", value: user.profileType ?? "—", color: "var(--q-text-secondary)" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-md)] p-4 text-center">
                <p className="text-xl font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Ações</p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => premiumMutation.mutate(!user.isPremium)}
                disabled={premiumMutation.isPending}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  user.isPremium
                    ? "bg-[var(--q-bg-raised)] border border-[var(--q-border-default)] text-[var(--q-text-secondary)] hover:border-[var(--q-border-strong)]"
                    : "bg-[var(--q-amber-dim)] border border-[var(--q-amber-8)]/30 text-[var(--q-amber-9)]"
                }`}
              >
                {premiumMutation.isPending ? "..." : user.isPremium ? "Remover Premium" : "Ativar Premium"}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => roleMutation.mutate(user.role === "ADMIN" ? "USER" : "ADMIN")}
                disabled={roleMutation.isPending}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  user.role === "ADMIN"
                    ? "bg-[var(--q-red-dim)] border border-[var(--q-red-8)]/30 text-[var(--q-red-9)]"
                    : "bg-[var(--q-accent-dim)] border border-[var(--q-accent-8)]/30 text-[var(--q-accent-9)]"
                }`}
              >
                {roleMutation.isPending ? "..." : user.role === "ADMIN" ? "Remover Admin" : "Promover Admin"}
              </motion.button>
            </div>
            {(premiumMutation.isError || roleMutation.isError) && (
              <p className="text-xs text-[var(--q-red-8)] mt-3">
                {roleMutation.error instanceof Error && roleMutation.error.message.includes("próprio")
                  ? "Você não pode alterar seu próprio role."
                  : "Erro ao atualizar. Tente novamente."}
              </p>
            )}
          </motion.div>

          {/* Recent sessions */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Sessões Recentes</p>
            {user.contents.length === 0 ? (
              <p className="text-sm text-[var(--q-text-tertiary)]">Nenhuma sessão gerada.</p>
            ) : (
              <div className="space-y-2">
                {user.contents.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-[var(--q-border-subtle)] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${c.isCompleted ? "bg-[var(--q-green-8)]" : "bg-[var(--q-text-tertiary)]"}`} />
                      <span className="text-sm text-[var(--q-text-primary)] tabular-nums">Dia {c.day}</span>
                    </div>
                    <span className="text-xs text-[var(--q-text-tertiary)]">
                      {new Date(c.generatedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* AI Usage */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Uso de AI</p>
            {user.usages.length === 0 ? (
              <p className="text-sm text-[var(--q-text-tertiary)]">Sem uso registrado.</p>
            ) : (
              <div className="space-y-2">
                {user.usages.map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-[var(--q-border-subtle)] last:border-0">
                    <div>
                      <p className="text-sm text-[var(--q-text-primary)] truncate max-w-[200px]">
                        {u.modelUsed.split("/").pop()}
                      </p>
                      <p className="text-xs text-[var(--q-text-tertiary)]">{u.requestsCount} req</p>
                    </div>
                    <span className="text-sm text-[var(--q-accent-9)] tabular-nums">${u.costEstimate}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent notifications */}
          <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Notificações Recentes</p>
            {user.notifications.length === 0 ? (
              <p className="text-sm text-[var(--q-text-tertiary)]">Nenhuma notificação enviada.</p>
            ) : (
              <div className="space-y-2">
                {user.notifications.map((n) => (
                  <div key={n.id} className="py-2 border-b border-[var(--q-border-subtle)] last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--q-accent-9)] font-medium uppercase">{n.type}</span>
                      <span className="text-xs text-[var(--q-text-tertiary)]">
                        {new Date(n.sentAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--q-text-primary)] mt-1">{n.title}</p>
                    <p className="text-xs text-[var(--q-text-secondary)] mt-0.5 line-clamp-1">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </div></div>
  );
}
