"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { ProfileReveal } from '@/components/onboarding/ProfileReveal';
import { PainPoint, Goal, EmotionalState, OnboardingInput } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSITIONS, VARIANTS } from '@/lib/animations';

const STEPS = [
  {
    field: 'painPoint' as const,
    title: 'O que mais te acompanha ultimamente?',
    description: 'Escolha o que mais ressoa com você neste momento.',
    options: [
      { value: 'anxiety', label: 'Ansiedade', emoji: '🌀' },
      { value: 'lack_of_purpose', label: 'Falta de propósito', emoji: '🌫️' },
      { value: 'emotional_instability', label: 'Instabilidade emocional', emoji: '🌊' },
      { value: 'spiritual_disconnection', label: 'Desconexão espiritual', emoji: '🕊️' },
      { value: 'lack_of_discipline', label: 'Falta de disciplina', emoji: '⏳' },
      { value: 'identity_crisis', label: 'Crise de identidade', emoji: '🪞' },
    ],
  },
  {
    field: 'goal' as const,
    title: 'O que você mais quer cultivar?',
    description: 'Qual fruto você quer ver crescer na sua vida.',
    options: [
      { value: 'inner_peace', label: 'Paz interior', emoji: '🌿' },
      { value: 'clarity', label: 'Clareza mental', emoji: '💡' },
      { value: 'emotional_mastery', label: 'Domínio emocional', emoji: '⚖️' },
      { value: 'spiritual_growth', label: 'Crescimento espiritual', emoji: '✨' },
      { value: 'discipline', label: 'Disciplina', emoji: '🔥' },
      { value: 'self_knowledge', label: 'Autoconhecimento', emoji: '🔍' },
    ],
  },
  {
    field: 'emotionalState' as const,
    title: 'Como você está chegando?',
    description: 'Seja honesto — não há resposta errada.',
    options: [
      { value: 'anxious', label: 'Ansioso(a)', emoji: '😰' },
      { value: 'lost', label: 'Perdido(a)', emoji: '🌑' },
      { value: 'frustrated', label: 'Frustrado(a)', emoji: '😤' },
      { value: 'hopeful', label: 'Com esperança', emoji: '🌅' },
      { value: 'neutral', label: 'Neutro(a)', emoji: '😶' },
      { value: 'motivated', label: 'Motivado(a)', emoji: '🚀' },
    ],
  },
  {
    field: 'timeAvailable' as const,
    title: 'Quanto tempo você tem por dia?',
    description: 'Respeite o seu ritmo. Todo tempo é válido.',
    options: [
      { value: '5', label: '5 min', emoji: '🌱' },
      { value: '10', label: '10 min', emoji: '🌿' },
      { value: '15', label: '15 min', emoji: '🌲' },
      { value: '20', label: '20 min', emoji: '🌳' },
      { value: '30', label: '30 min', emoji: '🏔️' },
    ],
  },
];

export default function OnboardingPage() {
  const { accessToken, user, updateUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentStep = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const selectedValue = answers[currentStep?.field] ?? null;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentStep.field]: value }));
  };

  const advance = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!answers.painPoint || !answers.goal || !answers.emotionalState || !answers.timeAvailable) {
      setError("Por favor, responda todas as perguntas antes de prosseguir.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload: OnboardingInput = {
      painPoint: answers.painPoint as PainPoint,
      goal: answers.goal as Goal,
      emotionalState: answers.emotionalState as EmotionalState,
      timeAvailable: parseInt(answers.timeAvailable, 10),
    };

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${BASE_URL}/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        let errorMessage = body.error ?? 'Algo deu errado. Tente novamente.';
        if (Array.isArray(body.error)) {
          errorMessage = body.error.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(' | ');
        }
        throw new Error(errorMessage);
      }

      const { user: freshUser } = await res.json();
      updateUser(freshUser);
      setShowReveal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.');
      setLoading(false);
    }
  };

  const handleRevealComplete = () => {
    router.push('/home');
  };

  if (showReveal) {
    const goalOption = STEPS[1].options.find(o => o.value === answers.goal);
    return (
      <ProfileReveal 
        name={user?.name?.split(' ')[0] || 'Viajante'} 
        goal={goalOption?.label || answers.goal} 
        onContinue={handleRevealComplete} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--q-bg-void)] p-safe pt-8 pb-8 px-6 overflow-hidden">
      
      {/* Progress Bar Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--q-border-subtle)]">
        <motion.div
          className="h-full bg-[var(--q-accent-8)]"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={TRANSITIONS.spring}
        />
      </div>

      <div className="w-full max-w-md relative pb-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={VARIANTS.slideHorizontal}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={TRANSITIONS.spring}
            className="flex flex-col gap-8"
          >
            <div>
              <h1 className="font-[family-name:var(--font-instrument)] italic text-4xl text-[var(--q-text-primary)] mb-3 leading-tight">
                {currentStep.title}
              </h1>
              <p className="text-[var(--q-text-secondary)] text-sm">
                {currentStep.description}
              </p>
            </div>

            <div className="space-y-3">
              {currentStep.options.map((option) => (
                <OptionCard
                  key={option.value}
                  icon={option.emoji}
                  label={option.label}
                  selected={selectedValue === option.value}
                  onSelect={() => handleSelect(option.value)}
                />
              ))}
            </div>
            
            {error && isLastStep && (
              <p className="text-sm text-red-400 mt-2 bg-red-900/20 px-4 py-3 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-[var(--q-bg-void)] via-[var(--q-bg-void)] to-transparent flex justify-between items-center z-10 mx-auto max-w-md">
        <button
          onClick={goBack}
          disabled={step === 0 || loading}
          className="w-12 h-12 flex items-center justify-center rounded-full text-[var(--q-text-tertiary)] hover:bg-[var(--q-bg-surface)] disabled:opacity-0 transition-all font-medium"
          aria-label="Voltar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        <motion.button
          onClick={advance}
          disabled={!selectedValue || loading}
          whileTap={selectedValue && !loading ? { scale: 0.97 } : {}}
          animate={{
            opacity: selectedValue ? 1 : 0.5,
            scale: selectedValue ? 1 : 0.98,
          }}
          className={`h-14 px-8 rounded-full font-medium text-base shadow-[calc(var(--q-shadow-glow-accent)*0.5)] transition-colors
            ${selectedValue ? 'bg-[var(--q-accent-8)] text-white' : 'bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] text-[var(--q-text-tertiary)]'}
          `}
        >
          {loading ? 'Preparando...' : 'Continuar'}
        </motion.button>
      </div>
    </div>
  );
}
