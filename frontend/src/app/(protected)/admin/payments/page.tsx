"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import { useToast } from "@/components/ui/Toast";

interface AiConfig {
  hasStripeKey: boolean;
  stripeKeyPreview: string;
}

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
    id: string;
    email: string;
    name: string | null;
    amount: number;
    plan: string;
    orderBump: boolean;
    status: string;
    completedAt: string;
  }[];
}

interface Prices {
  yearly: { amount: number };
  monthly: { amount: number };
  orderBump: { amount: number };
}

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [yearlyInput, setYearlyInput] = useState("");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [bumpInput, setBumpInput] = useState("");

  // Fetch Stripe config from ai-config
  const { data: config } = useQuery({
    queryKey: ["admin", "ai-config"],
    queryFn: () => api.get<AiConfig>("/admin/ai-config").then((r) => r.data),
    staleTime: 1000 * 15,
  });

  // Fetch revenue data
  const { data: revenue, isLoading: revLoading } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: () => api.get<Revenue>("/admin/revenue").then((r) => r.data),
    staleTime: 1000 * 30,
  });

  // Fetch current prices
  const { data: prices } = useQuery({
    queryKey: ["subscription", "prices"],
    queryFn: () => api.get<Prices>("/subscription/prices").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const configMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.put("/admin/ai-config", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ai-config"] });
      toast.show("Configuracao atualizada", "success");
    },
    onError: () => toast.show("Erro ao salvar", "error"),
  });

  const priceMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.put("/admin/ai-config", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "prices"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "ai-config"] });
      toast.show("Precos atualizados", "success");
    },
    onError: () => toast.show("Erro ao atualizar precos", "error"),
  });

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          variants={VARIANTS.pageEnter}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <a
            href="/admin"
            className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Admin
          </a>
          <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">
            Pagamentos
          </h1>
          <p className="text-[var(--q-text-secondary)] text-sm mt-1">
            Stripe, pricing e historico de pagamentos
          </p>
        </motion.div>

        <motion.div
          {...stagger(0.08)}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          {/* Revenue KPIs */}
          {revLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse"
                />
              ))}
            </div>
          ) : revenue ? (
            <motion.div
              variants={VARIANTS.cardReveal}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <AdminStatCard
                label="Receita Total"
                value={`R$ ${revenue.totalRevenue.toFixed(0)}`}
                icon="💰"
                accent="green"
              />
              <AdminStatCard
                label="Receita 30d"
                value={`R$ ${revenue.monthlyRevenue.toFixed(0)}`}
                icon="📈"
                accent="cyan"
              />
              <AdminStatCard
                label="Conversao"
                value={`${revenue.conversionRate}%`}
                icon="⭐"
                accent="amber"
              />
              <AdminStatCard
                label="Premium"
                value={`${revenue.premiumUsers}/${revenue.totalUsers}`}
                icon="👑"
                accent="purple"
              />
            </motion.div>
          ) : null}

          {/* Stripe Connection */}
          <motion.div
            variants={VARIANTS.cardReveal}
            transition={TRANSITIONS.spring}
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider">
                Stripe Connection
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    config?.hasStripeKey
                      ? "bg-[var(--q-green-8)] shadow-[0_0_6px_var(--q-green-8)]"
                      : "bg-[var(--q-text-tertiary)]"
                  }`}
                />
                <span className="text-[10px] text-[var(--q-text-tertiary)]">
                  {config?.hasStripeKey
                    ? "Ativo"
                    : "Modo demo (sem cobranca)"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[var(--q-text-tertiary)] mb-3">
              Sem Stripe, o checkout ativa premium direto (modo demo). Com
              Stripe, redireciona para checkout real com cartao/PIX.
            </p>
            {config?.hasStripeKey && (
              <p className="text-sm text-[var(--q-text-tertiary)] mb-3 font-mono">
                {config.stripeKeyPreview}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="sk_live_... ou sk_test_..."
                  className="flex-1 h-9 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-xs text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        configMutation.mutate({ stripeSecretKey: val });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <span className="text-[10px] text-[var(--q-text-tertiary)] self-center">
                  Enter para salvar
                </span>
              </div>
              <input
                type="password"
                placeholder="Webhook secret (whsec_...)"
                className="w-full h-9 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-xs text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      configMutation.mutate({ stripeWebhookSecret: val });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                try {
                  toast.show("Testando Stripe...", "info");
                  const res = await api.post<{
                    connected: boolean;
                    mode: string;
                    message: string;
                  }>("/admin/ai-config/test-stripe");
                  toast.show(
                    res.data.message,
                    res.data.connected
                      ? "success"
                      : res.data.mode === "demo"
                        ? "info"
                        : "error"
                  );
                } catch {
                  toast.show("Falha ao testar Stripe", "error");
                }
              }}
              className="mt-3 w-full h-9 rounded-full border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-xs font-medium hover:border-[var(--q-border-strong)] transition-colors"
            >
              Testar Conexao Stripe
            </motion.button>
            <p className="text-[10px] text-[var(--q-text-tertiary)] mt-2">
              Crie em dashboard.stripe.com — suporta cartao, PIX, boleto
            </p>
          </motion.div>

          {/* Pricing Editor */}
          <motion.div
            variants={VARIANTS.cardReveal}
            transition={TRANSITIONS.spring}
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
          >
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">
              Pricing
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Plano Anual",
                  current: prices?.yearly?.amount ?? 297,
                  value: yearlyInput,
                  set: setYearlyInput,
                  key: "yearlyPrice",
                },
                {
                  label: "Plano Mensal",
                  current: prices?.monthly?.amount ?? 47,
                  value: monthlyInput,
                  set: setMonthlyInput,
                  key: "monthlyPrice",
                },
                {
                  label: "Order Bump",
                  current: prices?.orderBump?.amount ?? 27,
                  value: bumpInput,
                  set: setBumpInput,
                  key: "orderBumpPrice",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--q-text-secondary)] w-28 flex-shrink-0">
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs text-[var(--q-text-tertiary)]">R$</span>
                    <input
                      type="number"
                      placeholder={String(item.current)}
                      value={item.value}
                      onChange={(e) => item.set(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors tabular-nums"
                    />
                  </div>
                  <span className="text-xs text-[var(--q-text-tertiary)] tabular-nums">
                    atual: R$ {item.current}
                  </span>
                </div>
              ))}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const payload: Record<string, unknown> = {};
                  if (yearlyInput) payload.yearlyPrice = Number(yearlyInput);
                  if (monthlyInput) payload.monthlyPrice = Number(monthlyInput);
                  if (bumpInput) payload.orderBumpPrice = Number(bumpInput);
                  if (Object.keys(payload).length === 0) {
                    toast.show("Nenhum valor alterado", "info");
                    return;
                  }
                  priceMutation.mutate(payload);
                  setYearlyInput("");
                  setMonthlyInput("");
                  setBumpInput("");
                }}
                disabled={
                  priceMutation.isPending ||
                  (!yearlyInput && !monthlyInput && !bumpInput)
                }
                className="w-full h-10 rounded-[var(--q-radius-md)] bg-[var(--q-accent-8)] text-white text-sm font-medium disabled:opacity-40 transition-opacity mt-2"
              >
                {priceMutation.isPending ? "Salvando..." : "Atualizar Precos"}
              </motion.button>
            </div>
          </motion.div>

          {/* Payment History */}
          <motion.div
            variants={VARIANTS.cardReveal}
            transition={TRANSITIONS.spring}
            className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
          >
            <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">
              Pagamentos Recentes
            </p>
            {!revenue?.recentPayments?.length ? (
              <p className="text-sm text-[var(--q-text-tertiary)]">
                Nenhum pagamento registrado.
              </p>
            ) : (
              <div className="space-y-2">
                {revenue.recentPayments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--q-border-subtle)] last:border-0"
                  >
                    <div>
                      <p className="text-sm text-[var(--q-text-primary)]">
                        {p.name || p.email}
                      </p>
                      <p className="text-xs text-[var(--q-text-tertiary)]">
                        {p.plan === "yearly" ? "Anual" : "Mensal"}
                        {p.orderBump ? " + Focus" : ""} ·{" "}
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleDateString("pt-BR")
                          : "Pendente"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--q-green-9)] tabular-nums">
                        R$ {p.amount.toFixed(0)}
                      </p>
                      <p
                        className={`text-[10px] uppercase ${
                          p.status === "completed"
                            ? "text-[var(--q-green-9)]"
                            : "text-[var(--q-amber-9)]"
                        }`}
                      >
                        {p.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
