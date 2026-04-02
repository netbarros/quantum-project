"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS } from "@/lib/animations";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface CostData {
  totalCost: number;
  byModel: { model: string; cost: number; requests: number }[];
  byDay: { date: string; cost: number }[];
  topUsers: { userId: string; email: string; cost: number }[];
  avgCostPerUser: number;
}

function useCosts() {
  return useQuery({
    queryKey: ["admin", "costs"],
    queryFn: () => api.get<CostData>("/admin/costs").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export default function AdminCostsPage() {
  const { data, isLoading } = useCosts();

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] p-6">
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
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Custos AI</h1>
        <p className="text-[var(--q-text-secondary)] text-sm mt-1">Últimos 30 dias</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--q-bg-surface)] border border-[var(--q-accent-8)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-[var(--q-text-secondary)] text-xs uppercase tracking-wider mb-2">Custo Total</p>
              <p className="text-[var(--q-accent-9)] text-3xl font-bold tabular-nums">${data.totalCost}</p>
            </div>
            <div className="bg-[var(--q-bg-surface)] border border-[var(--q-cyan-8)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-[var(--q-text-secondary)] text-xs uppercase tracking-wider mb-2">Custo/Usuário</p>
              <p className="text-[var(--q-cyan-9)] text-3xl font-bold tabular-nums">${data.avgCostPerUser}</p>
            </div>
          </div>

          {/* Cost by model */}
          <div className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">Por modelo</h2>
            <div className="space-y-3">
              {data.byModel.map(({ model, cost, requests }) => (
                <div key={model} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--q-text-primary)] truncate max-w-[200px]">
                      {model.split("/").pop()}
                    </p>
                    <p className="text-xs text-[var(--q-text-tertiary)]">{requests} requisições</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--q-accent-9)] tabular-nums">${cost}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost trend — Recharts */}
          <div className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">Tendência diária</h2>
            {data.byDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={data.byDay.slice(-14)} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#8b8ba8", fontSize: 10 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                    tickFormatter={(v) => String(v).slice(-5)}
                  />
                  <YAxis
                    tick={{ fill: "#8b8ba8", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111120",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#f0f0fa",
                    }}
                    formatter={(value) => [`$${Number(value).toFixed(4)}`, "Custo"]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#costGradient)"
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-[var(--q-text-tertiary)] text-sm">Sem dados suficientes.</p>
            )}
          </div>

          {/* Top users */}
          <div className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
            <h2 className="text-sm font-medium text-[var(--q-text-primary)] mb-4">Top usuários por custo</h2>
            <div className="space-y-2">
              {data.topUsers.map(({ userId, email, cost }, i) => (
                <div key={userId} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--q-text-tertiary)] w-5 tabular-nums">#{i + 1}</span>
                  <span className="flex-1 text-sm text-[var(--q-text-secondary)] truncate">{email}</span>
                  <span className="text-sm text-[var(--q-text-primary)] tabular-nums">${cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
