"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";

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

function useAnalytics() {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api.get<Analytics>("/admin/analytics").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

const COLORS = ["#5a5a6e", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"];

export default function AdminAnalyticsPage() {
  const { data, isLoading, error } = useAnalytics();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-red-8)]">Erro ao carregar analytics.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6"><div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
        <a
          href="/admin"
          className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Admin
        </a>
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Analytics Detalhado</h1>
        <p className="text-[var(--q-text-secondary)] text-sm mt-1">Métricas de engajamento e crescimento</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6 max-w-4xl">
          {/* KPI Grid */}
          <motion.div
            {...stagger(0.06)}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AdminStatCard label="DAU (hoje)" value={data.dau} icon="👥" accent="purple" />
            <AdminStatCard label="MAU (30d)" value={data.mau} icon="📅" accent="cyan" />
            <AdminStatCard label="Retenção D7" value={`${Math.round(data.retentionRate * 100)}%`} icon="📈" accent="green" />
            <AdminStatCard label="Conclusão Diária" value={`${Math.round(data.completionRate * 100)}%`} icon="✅" accent="green" />
            <AdminStatCard label="Streak Médio" value={`${data.avgStreak}d`} icon="🔥" accent="amber" />
            <AdminStatCard label="Conversão Premium" value={`${Math.round(data.premiumConversion * 100)}%`} icon="⭐" accent="amber" />
          </motion.div>

          {/* Streak Distribution Bar Chart */}
          <motion.div
            variants={VARIANTS.cardReveal}
            initial="initial"
            animate="animate"
            transition={TRANSITIONS.spring}
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
          >
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">Distribuição de Streaks</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.streakDistribution} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#8b8ba8", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v: string) => `${v}d`}
                />
                <YAxis
                  tick={{ fill: "#8b8ba8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
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
                <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={800}>
                  {data.streakDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.7 + i * 0.07} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Funnel / Conversion Pie */}
          <motion.div
            variants={VARIANTS.cardReveal}
            initial="initial"
            animate="animate"
            transition={TRANSITIONS.spring}
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
          >
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">Conversão Free → Premium</h2>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Premium", value: Math.round(data.premiumConversion * 100) },
                      { name: "Free", value: 100 - Math.round(data.premiumConversion * 100) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    animationDuration={800}
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="rgba(255,255,255,0.06)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--q-accent-8)]" />
                  <span className="text-sm text-[var(--q-text-secondary)]">Premium: {Math.round(data.premiumConversion * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white/[0.06]" />
                  <span className="text-sm text-[var(--q-text-secondary)]">Free: {100 - Math.round(data.premiumConversion * 100)}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Cost Summary */}
          <motion.div
            variants={VARIANTS.cardReveal}
            initial="initial"
            animate="animate"
            transition={TRANSITIONS.spring}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-[var(--q-bg-surface)] border border-[var(--q-accent-8)]/30 rounded-[var(--q-radius-lg)] p-5">
              <p className="text-[var(--q-text-secondary)] text-xs uppercase tracking-wider mb-2">Custo Total AI</p>
              <p className="text-[var(--q-accent-9)] text-2xl font-bold tabular-nums font-[family-name:var(--font-dm-sans)]">${data.totalAICost}</p>
            </div>
            <div className="bg-[var(--q-bg-surface)] border border-[var(--q-cyan-8)]/30 rounded-[var(--q-radius-lg)] p-5">
              <p className="text-[var(--q-text-secondary)] text-xs uppercase tracking-wider mb-2">Custo por Usuário</p>
              <p className="text-[var(--q-cyan-9)] text-2xl font-bold tabular-nums font-[family-name:var(--font-dm-sans)]">${data.avgCostPerUser}</p>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div></div>
  );
}
