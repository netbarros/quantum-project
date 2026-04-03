"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { SofiaOrb } from "@/components/session/SofiaOrb";
import { TRANSITIONS, VARIANTS, stagger } from "@/lib/animations";
import { useToast } from "@/components/ui/Toast";

export default function PublicPlansPage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [orderBump, setOrderBump] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: prices } = useQuery({
    queryKey: ["subscription", "prices"],
    queryFn: () =>
      api
        .get<{
          yearly: { amount: number };
          monthly: { amount: number };
          orderBump: { amount: number };
        }>("/subscription/prices")
        .then((r) => r.data),
    staleTime: 1000 * 60 * 30,
  });

  const yearlyPrice = prices?.yearly?.amount ?? 297;
  const monthlyPrice = prices?.monthly?.amount ?? 47;
  const bumpPrice = prices?.orderBump?.amount ?? 27;
  const price = selectedPlan === "yearly" ? yearlyPrice : monthlyPrice;
  const period = selectedPlan === "yearly" ? "ano" : "mes";

  const handleCheckout = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated) {
        // Not logged in — try checkout as guest or redirect to register
        try {
          const res = await api.post<{
            mode: string;
            url?: string;
            message?: string;
          }>("/subscription/checkout", { plan: selectedPlan, orderBump });

          if (res.data.mode === "stripe" && res.data.url) {
            // Stripe checkout — success_url should point to /register?payment=success
            window.location.href = res.data.url;
            return;
          }
        } catch {
          // No auth / demo mode — redirect to register with plan info
        }

        // Demo mode or no Stripe — redirect to register
        const params = new URLSearchParams({
          plan: selectedPlan,
          bump: orderBump ? "1" : "0",
        });
        router.push(`/register?${params.toString()}`);
        return;
      }

      // Authenticated user — full checkout
      const res = await api.post<{
        mode: string;
        url?: string;
        user?: typeof user;
        message?: string;
      }>("/subscription/checkout", { plan: selectedPlan, orderBump });

      if (res.data.mode === "stripe" && res.data.url) {
        window.location.href = res.data.url;
        return;
      }

      // Demo mode — activated directly
      if (res.data.user) updateUser(res.data.user);
      setShowSuccess(true);
      toast.show(res.data.message || "Premium ativado!", "success");
      setTimeout(() => router.push("/home"), 2500);
    } catch {
      toast.show("Erro ao processar. Tente novamente.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--q-bg-void)]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <SofiaOrb blockType="affirmation" size="lg" level="ALIGNED" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mt-6 mb-2"
        >
          Bem-vinda ao Premium
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--q-text-secondary)] text-sm"
        >
          365 dias de transformacao te esperam.
        </motion.p>
      </div>
    );
  }

  const ctaLabel = isAuthenticated
    ? `Ativar Premium — R$ ${price + (orderBump ? bumpPrice : 0)}/${period}`
    : `Criar conta e ativar — R$ ${price + (orderBump ? bumpPrice : 0)}/${period}`;

  return (
    <div className="min-h-screen bg-nebula flex flex-col items-center p-6 pb-12 overflow-x-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--q-accent-8)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" />

      <motion.div
        {...stagger(0.1)}
        initial="initial"
        animate="animate"
        className="w-full max-w-md z-10 flex flex-col items-center"
      >
        {/* Back */}
        <motion.div variants={VARIANTS.fadeIn} className="w-full mb-4">
          <button
            onClick={() => router.push("/")}
            className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 hover:text-[var(--q-text-primary)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Voltar
          </button>
        </motion.div>

        {/* Header */}
        <motion.div variants={VARIANTS.slideUp} className="text-center mb-6">
          <p className="text-[10px] text-[var(--q-accent-9)] uppercase tracking-[0.2em] mb-2">
            Soulful Premium Checkout
          </p>
          <h1 className="font-[family-name:var(--font-instrument)] italic text-3xl text-[var(--q-text-primary)] mb-2">
            Sua consciencia esta despertando.
          </h1>
          <p className="text-[var(--q-text-secondary)] text-sm">
            Escolha seu plano e comece a transformacao.
          </p>
        </motion.div>

        {/* Plan Selection */}
        <motion.div variants={VARIANTS.slideUp} className="w-full grid grid-cols-2 gap-3 mb-4">
          {(
            [
              {
                key: "yearly" as const,
                label: "Anual",
                price: `R$ ${yearlyPrice}`,
                sub: "/ano",
                save: "Economize 48%",
              },
              {
                key: "monthly" as const,
                label: "Mensal",
                price: `R$ ${monthlyPrice}`,
                sub: "/mes",
                save: "",
              },
            ] as const
          ).map((plan) => (
            <motion.button
              key={plan.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPlan(plan.key)}
              className={`p-4 rounded-[var(--q-radius-lg)] border text-left transition-all ${
                selectedPlan === plan.key
                  ? "border-[var(--q-accent-8)] bg-[var(--q-accent-dim)] shadow-[var(--q-shadow-glow-accent)]"
                  : "border-[var(--q-border-default)] bg-[var(--q-bg-surface)]"
              }`}
            >
              <p className="text-xs text-[var(--q-text-tertiary)] uppercase tracking-wider mb-1">
                {plan.label}
              </p>
              <p className="text-xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)]">
                {plan.price}
              </p>
              <p className="text-[10px] text-[var(--q-text-secondary)]">{plan.sub}</p>
              {plan.save && (
                <p className="text-[10px] text-[var(--q-green-9)] mt-1 font-medium">
                  {plan.save}
                </p>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={VARIANTS.slideUp}
          className="w-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5 mb-4"
        >
          <ul className="space-y-3">
            {[
              "Sessoes adaptativas ilimitadas com Sofia IA",
              "Personalizacao comportamental em tempo real",
              "Reflexoes e jornal integrados",
              "Todos os niveis de consciencia (BEGINNER→INTEGRATED)",
              "Musica ambiente e voz de Sofia",
            ].map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-[var(--q-text-secondary)]"
              >
                <span className="text-[var(--q-accent-9)] mt-0.5">✓</span> {b}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Order Bump */}
        <motion.div variants={VARIANTS.slideUp} className="w-full mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setOrderBump(!orderBump)}
            className={`w-full p-4 rounded-[var(--q-radius-lg)] border text-left transition-all ${
              orderBump
                ? "border-[var(--q-amber-8)] bg-[var(--q-amber-dim)]"
                : "border-[var(--q-border-subtle)] bg-[var(--q-bg-surface)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded flex items-center justify-center ${
                  orderBump
                    ? "bg-[var(--q-amber-8)] text-white"
                    : "border border-[var(--q-border-default)]"
                }`}
              >
                {orderBump && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--q-text-primary)]">
                  Adicionar Modo Focus + Integracao
                </p>
                <p className="text-xs text-[var(--q-text-tertiary)]">
                  Meditacoes guiadas exclusivas + exercicios de integracao corporal
                </p>
              </div>
              <span className="text-sm font-bold text-[var(--q-amber-9)]">
                +R$ {bumpPrice}
              </span>
            </div>
          </motion.button>
        </motion.div>

        {/* Checkout Summary */}
        <motion.div
          variants={VARIANTS.slideUp}
          className="w-full bg-[var(--q-bg-raised)] rounded-[var(--q-radius-lg)] p-4 mb-4"
        >
          <div className="flex justify-between text-sm text-[var(--q-text-secondary)] mb-1">
            <span>Plano {selectedPlan === "yearly" ? "Anual" : "Mensal"}</span>
            <span className="text-[var(--q-text-primary)]">R$ {price}</span>
          </div>
          {orderBump && (
            <div className="flex justify-between text-sm text-[var(--q-text-secondary)] mb-1">
              <span>Modo Focus</span>
              <span className="text-[var(--q-text-primary)]">R$ {bumpPrice}</span>
            </div>
          )}
          <div className="border-t border-[var(--q-border-subtle)] mt-2 pt-2 flex justify-between">
            <span className="text-sm font-medium text-[var(--q-text-primary)]">Total</span>
            <span className="text-lg font-bold text-[var(--q-accent-9)] font-[family-name:var(--font-instrument)] italic">
              R$ {price + (orderBump ? bumpPrice : 0)}
            </span>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div variants={VARIANTS.slideUp} className="w-full mb-4">
          <p className="text-[10px] text-[var(--q-text-tertiary)] uppercase tracking-wider text-center mb-3">
            Formas de Pagamento
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-8 rounded-md bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] flex items-center justify-center">
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="18"
                    height="12"
                    rx="2"
                    stroke="var(--q-text-tertiary)"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="1"
                    y1="5"
                    x2="19"
                    y2="5"
                    stroke="var(--q-text-tertiary)"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
              <span className="text-[9px] text-[var(--q-text-tertiary)]">Cartao</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-8 rounded-md bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--q-cyan-9)]">PIX</span>
              </div>
              <span className="text-[9px] text-[var(--q-text-tertiary)]">Pix</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-8 rounded-md bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2C4.686 2 2 4.686 2 8s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10.5c-2.485 0-4.5-2.015-4.5-4.5S5.515 3.5 8 3.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"
                    fill="var(--q-text-tertiary)"
                  />
                  <path d="M7 6h2v1H7zm0 2h2v3H7z" fill="var(--q-text-tertiary)" />
                </svg>
              </div>
              <span className="text-[9px] text-[var(--q-text-tertiary)]">Boleto</span>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={VARIANTS.slideUp} className="w-full">
          <motion.button
            onClick={handleCheckout}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="w-full h-14 rounded-full bg-[var(--q-accent-8)] text-white font-medium shadow-[var(--q-shadow-glow-accent)] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Processando...
              </span>
            ) : (
              ctaLabel
            )}
          </motion.button>
        </motion.div>

        <motion.div variants={VARIANTS.fadeIn} className="mt-6 text-center space-y-1">
          <p className="text-[10px] text-[var(--q-text-tertiary)]">
            Pagamento seguro · Cancele quando quiser
          </p>
          <p className="text-[10px] text-[var(--q-text-tertiary)]">
            4.200+ pessoas em transformacao
          </p>
        </motion.div>

        {/* Login link for visitors */}
        {!isAuthenticated && (
          <motion.div variants={VARIANTS.fadeIn} className="mt-4 text-center">
            <p className="text-sm text-[var(--q-text-secondary)]">
              Ja tem conta?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-[var(--q-accent-9)] hover:text-white transition-colors font-medium"
              >
                Entrar
              </button>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
