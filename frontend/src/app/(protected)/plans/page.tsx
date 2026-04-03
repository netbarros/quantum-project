'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ConsciousnessOrb } from '@/components/ui/ConsciousnessOrb';
import { SofiaOrb } from '@/components/session/SofiaOrb';
import { TRANSITIONS, VARIANTS, stagger } from '@/lib/animations';
import { useToast } from '@/components/ui/Toast';

interface SubStatus {
  isPremium: boolean;
  premiumSince: string | null;
  premiumUntil: string | null;
  daysRemaining: number | null;
  currentDay: number;
  freeLimit: number;
  paywallReached: boolean;
}

export default function PlansPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [orderBump, setOrderBump] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: subStatus } = useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: () => api.get<SubStatus>('/subscription/status').then((r) => r.data),
    staleTime: 1000 * 30,
  });

  // If already premium, show status
  if (subStatus?.isPremium) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-[var(--q-bg-void)]">
        <motion.div {...stagger(0.1)} initial="initial" animate="animate" className="max-w-md text-center">
          <motion.div variants={VARIANTS.fadeIn} className="mb-4">
            <SofiaOrb blockType="affirmation" size="md" level={user?.level ?? "BEGINNER"} />
          </motion.div>
          <motion.h1 variants={VARIANTS.slideUp} className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-3">
            Acesso Completo Ativo
          </motion.h1>
          <motion.p variants={VARIANTS.slideUp} className="text-[var(--q-text-secondary)] text-sm mb-2">
            Sua jornada Premium está ativa.
          </motion.p>
          {subStatus.daysRemaining && (
            <motion.p variants={VARIANTS.slideUp} className="text-xs text-[var(--q-accent-9)] mb-6">
              {subStatus.daysRemaining} dias restantes
            </motion.p>
          )}
          <motion.button variants={VARIANTS.slideUp} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/home')}
            className="h-12 px-8 rounded-full bg-[var(--q-accent-8)] text-white font-medium shadow-[var(--q-shadow-glow-accent)]">
            Voltar ao início
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ user: typeof user; message: string }>('/subscription/upgrade', {
        plan: selectedPlan,
        orderBump,
      });
      if (res.data.user) updateUser(res.data.user);
      setShowSuccess(true);
      toast.show('Premium ativado com sucesso!', 'success');
      setTimeout(() => router.push('/home'), 2500);
    } catch {
      toast.show('Erro ao processar. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const score = user?.consciousnessScore ?? 10;
  const level = user?.level ?? 'BEGINNER';
  const streak = user?.streak ?? 1;
  const day = subStatus?.currentDay ?? 7;
  const yearlyPrice = 297;
  const monthlyPrice = 47;
  const price = selectedPlan === 'yearly' ? yearlyPrice : monthlyPrice;
  const period = selectedPlan === 'yearly' ? 'ano' : 'mês';

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-[var(--q-bg-void)]">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <SofiaOrb blockType="affirmation" size="lg" level={level} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mt-6 mb-2">
          Bem-vinda ao Premium
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-[var(--q-text-secondary)] text-sm">
          365 dias de transformação te esperam.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] flex flex-col items-center p-6 pb-12 overflow-x-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[var(--q-accent-8)] rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none" />

      <motion.div {...stagger(0.1)} initial="initial" animate="animate" className="w-full max-w-md z-10 flex flex-col items-center">
        <motion.div variants={VARIANTS.slideUp} className="text-center mb-6">
          <h1 className="font-[family-name:var(--font-instrument)] italic text-3xl text-[var(--q-text-primary)] mb-2">
            Sua consciência está despertando.
          </h1>
          <p className="text-[var(--q-text-secondary)] text-sm">
            Em {streak} dias você alcançou {score} pontos. Imagine em 365.
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={VARIANTS.slideUp} className="w-full mb-8">
          <div className="h-1 w-full bg-[var(--q-border-subtle)] rounded-full relative">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((day / 365) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-1 bg-[var(--q-accent-8)] rounded-full" />
          </div>
          <div className="flex justify-between w-full text-xs text-[var(--q-text-tertiary)] mt-2">
            <span className="text-[var(--q-accent-9)]">Dia {day}</span>
            <span>Dia 365</span>
          </div>
        </motion.div>

        {/* Plan Selection */}
        <motion.div variants={VARIANTS.slideUp} className="w-full grid grid-cols-2 gap-3 mb-4">
          {([
            { key: 'yearly' as const, label: 'Anual', price: 'R$ 297', sub: '/ano', save: 'Economize 48%' },
            { key: 'monthly' as const, label: 'Mensal', price: 'R$ 47', sub: '/mês', save: '' },
          ]).map((plan) => (
            <motion.button
              key={plan.key}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPlan(plan.key)}
              className={`p-4 rounded-[var(--q-radius-lg)] border text-left transition-all ${
                selectedPlan === plan.key
                  ? 'border-[var(--q-accent-8)] bg-[var(--q-accent-dim)] shadow-[var(--q-shadow-glow-accent)]'
                  : 'border-[var(--q-border-default)] bg-[var(--q-bg-surface)]'
              }`}
            >
              <p className="text-xs text-[var(--q-text-tertiary)] uppercase tracking-wider mb-1">{plan.label}</p>
              <p className="text-xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)]">{plan.price}</p>
              <p className="text-[10px] text-[var(--q-text-secondary)]">{plan.sub}</p>
              {plan.save && <p className="text-[10px] text-[var(--q-green-9)] mt-1 font-medium">{plan.save}</p>}
            </motion.button>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div variants={VARIANTS.slideUp} className="w-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5 mb-4">
          <ul className="space-y-3">
            {[
              'Sessões adaptativas ilimitadas com Sofia IA',
              'Personalização comportamental em tempo real',
              'Reflexões e jornal integrados',
              'Todos os níveis de consciência (BEGINNER→INTEGRATED)',
              'Música ambiente e voz de Sofia',
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--q-text-secondary)]">
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
                ? 'border-[var(--q-amber-8)] bg-[var(--q-amber-dim)]'
                : 'border-[var(--q-border-subtle)] bg-[var(--q-bg-surface)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded flex items-center justify-center ${
                orderBump ? 'bg-[var(--q-amber-8)] text-white' : 'border border-[var(--q-border-default)]'
              }`}>
                {orderBump && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--q-text-primary)]">
                  Adicionar Modo Focus + Integração
                </p>
                <p className="text-xs text-[var(--q-text-tertiary)]">
                  Meditações guiadas exclusivas + exercícios de integração corporal
                </p>
              </div>
              <span className="text-sm font-bold text-[var(--q-amber-9)]">+R$ 27</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Checkout Summary */}
        <motion.div variants={VARIANTS.slideUp} className="w-full bg-[var(--q-bg-raised)] rounded-[var(--q-radius-lg)] p-4 mb-4">
          <div className="flex justify-between text-sm text-[var(--q-text-secondary)] mb-1">
            <span>Plano {selectedPlan === 'yearly' ? 'Anual' : 'Mensal'}</span>
            <span className="text-[var(--q-text-primary)]">R$ {price}</span>
          </div>
          {orderBump && (
            <div className="flex justify-between text-sm text-[var(--q-text-secondary)] mb-1">
              <span>Modo Focus</span>
              <span className="text-[var(--q-text-primary)]">R$ 27</span>
            </div>
          )}
          <div className="border-t border-[var(--q-border-subtle)] mt-2 pt-2 flex justify-between">
            <span className="text-sm font-medium text-[var(--q-text-primary)]">Total</span>
            <span className="text-lg font-bold text-[var(--q-accent-9)] font-[family-name:var(--font-instrument)] italic">
              R$ {price + (orderBump ? 27 : 0)}
            </span>
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
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Processando...
              </span>
            ) : `Ativar Premium — R$ ${price + (orderBump ? 27 : 0)}/${period}`}
          </motion.button>
        </motion.div>

        <motion.div variants={VARIANTS.fadeIn} className="mt-6 text-center space-y-1">
          <p className="text-[10px] text-[var(--q-text-tertiary)]">Pagamento seguro · Cancele quando quiser</p>
          <p className="text-[10px] text-[var(--q-text-tertiary)]">4.200+ pessoas em transformação</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
