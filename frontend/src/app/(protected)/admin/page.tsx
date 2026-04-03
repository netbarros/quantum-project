"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { stagger, VARIANTS } from "@/lib/animations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6">
      <div className="max-w-4xl mx-auto">
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
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data.streakDistribution} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#8b8ba8", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}d`}
                />
                <YAxis
                  tick={{ fill: "#8b8ba8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111120",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f0f0fa",
                  }}
                  formatter={(value) => [Number(value), "Usuários"]}
                  labelFormatter={(label) => `Streak: ${label} dias`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={800}>
                  {data.streakDistribution.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#5a5a6e" : "#8b5cf6"} fillOpacity={0.6 + i * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
              { label: "Pagamentos", href: "/admin/payments", icon: "💳" },
              { label: "Receita", href: "/admin/revenue", icon: "💰" },
              { label: "Custos AI", href: "/admin/costs", icon: "🤖" },
              { label: "Config IA", href: "/admin/ai-config", icon: "🧠" },
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
    </div>
  );
}
