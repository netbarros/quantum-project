"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { stagger, VARIANTS } from "@/lib/animations";

interface Analytics {
  dau: number;
  mau: number;
  retentionRate: number;
  completionRate: number;
  avgStreak: number;
  premiumConversion: number;
  streakDistribution: { range: string; count: number }[];
  totalAICost: number;
  avgCostPerUser: number;
}

function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.get<Analytics>("/admin/analytics").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export default function AdminPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-red-8)]">Erro ao carregar dados admin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] p-6">
      {/* Header */}
      <motion.div
        variants={VARIANTS.pageEnter}
        initial="initial"
        animate="animate"
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Admin Dashboard</h1>
        <p className="text-[var(--q-text-secondary)] text-sm mt-1">
          Visão geral da plataforma em tempo real
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse"
            />
          ))}
        </div>
      ) : data ? (
        <>
          {/* ── Stats Grid ─────────────────────────────── */}
          <motion.div
            {...stagger(0.07)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <AdminStatCard label="DAU" value={data.dau} icon="👥" accent="purple" />
            <AdminStatCard label="MAU" value={data.mau} icon="📅" accent="cyan" />
            <AdminStatCard
              label="Retenção D7"
              value={`${Math.round(data.retentionRate * 100)}%`}
              icon="📈"
              accent="green"
            />
            <AdminStatCard
              label="Conversão Premium"
              value={`${Math.round(data.premiumConversion * 100)}%`}
              icon="⭐"
              accent="amber"
            />
            <AdminStatCard
              label="Conclusão Diária"
              value={`${Math.round(data.completionRate * 100)}%`}
              icon="✅"
              accent="green"
            />
            <AdminStatCard
              label="Streak Médio"
              value={`${data.avgStreak}d`}
              icon="🔥"
              accent="amber"
            />
            <AdminStatCard
              label="Custo Total AI"
              value={`$${data.totalAICost}`}
              icon="🤖"
              accent="purple"
            />
            <AdminStatCard
              label="Custo/Usuário"
              value={`$${data.avgCostPerUser}`}
              icon="💰"
              accent="cyan"
            />
          </motion.div>

          {/* ── Streak Distribution ─────────────────────── */}
          <motion.div
            variants={VARIANTS.cardReveal}
            initial="initial"
            animate="animate"
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5 mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">
              Distribuição de Streaks
            </h2>
            <div className="space-y-3">
              {data.streakDistribution.map(({ range, count }) => {
                const maxCount = Math.max(...data.streakDistribution.map((d) => d.count), 1);
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={range} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--q-text-tertiary)] w-12 shrink-0 tabular-nums">
                      {range}d
                    </span>
                    <div className="flex-1 h-2 bg-[var(--q-bg-raised)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="h-full bg-[var(--q-accent-8)] rounded-full"
                      />
                    </div>
                    <span className="text-xs text-[var(--q-text-secondary)] w-8 shrink-0 tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Quick nav ───────────────────────────────── */}
          <motion.div
            variants={VARIANTS.cardReveal}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {[
              { label: "Usuários", href: "/admin/users", icon: "👥" },
              { label: "Analytics", href: "/admin/analytics", icon: "📊" },
              { label: "Custos AI", href: "/admin/costs", icon: "💰" },
              { label: "Broadcast", href: "/admin/broadcast", icon: "📢" },
            ].map(({ label, href, icon }) => (
              <motion.a
                key={href}
                href={href}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 p-4 rounded-[var(--q-radius-md)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] hover:border-[var(--q-border-strong)] transition-colors"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-[var(--q-text-primary)]">{label}</span>
              </motion.a>
            ))}
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
