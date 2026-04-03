"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";

interface Revenue {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPayments: number;
  completedPayments: number;
  monthlyPaymentCount: number;
  premiumUsers: number;
  totalUsers: number;
  conversionRate: number;
  recentPayments: {
    id: string; email: string; name: string | null; amount: number;
    plan: string; orderBump: boolean; status: string; completedAt: string;
  }[];
}

export default function AdminRevenuePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: () => api.get<Revenue>("/admin/revenue").then((r) => r.data),
    staleTime: 1000 * 30,
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-red-8)]">Erro ao carregar receita.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
          <a href="/admin" className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            Admin
          </a>
          <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Receita</h1>
          <p className="text-[var(--q-text-secondary)] text-sm mt-1">Pagamentos e conversão premium</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <motion.div {...stagger(0.07)} initial="initial" animate="animate" className="space-y-6">
            {/* KPI Grid */}
            <motion.div variants={VARIANTS.cardReveal} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AdminStatCard label="Receita Total" value={`R$ ${data.totalRevenue.toFixed(0)}`} icon="💰" accent="green" />
              <AdminStatCard label="Receita 30d" value={`R$ ${data.monthlyRevenue.toFixed(0)}`} icon="📈" accent="cyan" />
              <AdminStatCard label="Conversão" value={`${data.conversionRate}%`} icon="⭐" accent="amber" />
              <AdminStatCard label="Premium" value={`${data.premiumUsers}/${data.totalUsers}`} icon="👑" accent="purple" />
            </motion.div>

            {/* Payment Stats */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
                <p className="text-xs text-[var(--q-text-secondary)] uppercase tracking-wider mb-2">Pagamentos</p>
                <p className="text-2xl font-bold text-[var(--q-text-primary)] tabular-nums">{data.completedPayments}</p>
                <p className="text-xs text-[var(--q-text-tertiary)] mt-1">{data.totalPayments} total (incl. pendentes)</p>
              </div>
              <div className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
                <p className="text-xs text-[var(--q-text-secondary)] uppercase tracking-wider mb-2">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-[var(--q-accent-9)] tabular-nums">{data.monthlyPaymentCount}</p>
                <p className="text-xs text-[var(--q-text-tertiary)] mt-1">pagamentos completados</p>
              </div>
            </motion.div>

            {/* Recent Payments */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Pagamentos Recentes</p>
              {data.recentPayments.length === 0 ? (
                <p className="text-sm text-[var(--q-text-tertiary)]">Nenhum pagamento registrado.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--q-border-subtle)] last:border-0">
                      <div>
                        <p className="text-sm text-[var(--q-text-primary)]">{p.name || p.email}</p>
                        <p className="text-xs text-[var(--q-text-tertiary)]">
                          {p.plan === 'yearly' ? 'Anual' : 'Mensal'}{p.orderBump ? ' + Focus' : ''} · {p.completedAt ? new Date(p.completedAt).toLocaleDateString('pt-BR') : 'Pendente'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[var(--q-green-9)] tabular-nums">R$ {p.amount.toFixed(0)}</p>
                        <p className={`text-[10px] uppercase ${p.status === 'completed' ? 'text-[var(--q-green-9)]' : 'text-[var(--q-amber-9)]'}`}>{p.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
