"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { User } from '@/types';
import { motion } from 'framer-motion';
import { VARIANTS, TRANSITIONS, stagger } from '@/lib/animations';

const PROFILE_TYPE_LABELS: Record<string, { label: string; description: string; emoji: string }> = {
  REACTIVE: { label: 'Reativo', emoji: '🌊', description: 'Você sente as emoções com intensidade. Este espaço vai te ajudar a encontrar calma.' },
  LOST: { label: 'Em Busca', emoji: '🌫️', description: 'Você está buscando direção. A jornada aqui é sobre clareza e reconexão com o propósito.' },
  INCONSISTENT: { label: 'Inconsistente', emoji: '⏳', description: 'A constância é seu desafio. Vamos construir ritmo juntos, passo a passo.' },
  SEEKING: { label: 'Buscador', emoji: '✨', description: 'Você tem esperança e curiosidade espiritual. Isso é o começo de tudo.' },
  STRUCTURED: { label: 'Estruturado', emoji: '🏔️', description: 'Você tem energia e tempo. Vamos canalizar isso em crescimento profundo.' },
};

const LEVEL_LABELS: Record<string, { label: string; progress: number }> = {
  BEGINNER: { label: 'Iniciante', progress: 10 },
  AWARE: { label: 'Consciente', progress: 30 },
  CONSISTENT: { label: 'Consistente', progress: 55 },
  ALIGNED: { label: 'Alinhado', progress: 78 },
  INTEGRATED: { label: 'Integrado', progress: 100 },
};

const PAIN_POINT_LABELS: Record<string, string> = {
  anxiety: 'Ansiedade', lack_of_purpose: 'Falta de propósito', emotional_instability: 'Instabilidade emocional',
  spiritual_disconnection: 'Desconexão espiritual', lack_of_discipline: 'Falta de disciplina', identity_crisis: 'Crise de identidade',
};

const GOAL_LABELS: Record<string, string> = {
  inner_peace: 'Paz interior', clarity: 'Clareza mental', emotional_mastery: 'Domínio emocional',
  spiritual_growth: 'Crescimento espiritual', discipline: 'Disciplina', self_knowledge: 'Autoconhecimento',
};

const EMOTIONAL_STATE_LABELS: Record<string, string> = {
  anxious: 'Ansioso(a)', lost: 'Perdido(a)', frustrated: 'Frustrado(a)', hopeful: 'Com esperança', neutral: 'Neutro(a)', motivated: 'Motivado(a)',
};

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLanguage, setEditLanguage] = useState('');

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<{ user: User }>('/profile');
      const user = res.data.user;
      setEditName(user.name ?? '');
      setEditLanguage(user.language ?? 'pt-BR');
      return user;
    },
    staleTime: 1000 * 60 * 2,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; language: string }) => {
      const res = await api.put<{ user: User }>('/profile', data);
      return res.data.user;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      updateUser(updated);
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--q-accent-8)]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-text-secondary)]">Não foi possível carregar o perfil.</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.back()} className="text-[var(--q-accent-9)] hover:text-white transition-colors">
          ← Voltar
        </motion.button>
      </div>
    );
  }

  const profileMeta = profile.profileType ? PROFILE_TYPE_LABELS[profile.profileType] ?? null : null;
  const levelMeta = profile.level ? LEVEL_LABELS[profile.level] ?? null : null;

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] p-6 pb-24">
      <motion.div {...stagger(0.1)} initial="initial" animate="animate" className="max-w-xl mx-auto space-y-4">
        <motion.div variants={VARIANTS.slideUp} className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] italic font-bold text-[var(--q-text-primary)]">
            Seu Espaço
          </h1>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.back()} className="text-[var(--q-text-secondary)] text-sm hover:text-[var(--q-text-primary)] transition-colors">
            Voltar
          </motion.button>
        </motion.div>

        {/* Profile Card */}
        {profileMeta && (
          <motion.div variants={VARIANTS.slideUp} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-accent-8)]/30 rounded-2xl p-6 shadow-[var(--q-shadow-glow-accent)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--q-accent-8)] opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             <div className="flex items-center gap-4 mb-3">
               <span className="text-4xl">{profileMeta.emoji}</span>
               <div>
                  <p className="text-[10px] text-[var(--q-accent-9)] font-bold uppercase tracking-widest mb-1">Identidade</p>
                  <p className="text-xl font-bold text-[var(--q-text-primary)]">{profileMeta.label}</p>
               </div>
             </div>
             <p className="text-sm text-[var(--q-text-secondary)]">{profileMeta.description}</p>
          </motion.div>
        )}

        {/* Level */}
        {levelMeta && (
          <motion.div variants={VARIANTS.slideUp} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] rounded-2xl p-6">
            <p className="text-[10px] text-[var(--q-text-secondary)] font-bold uppercase tracking-widest mb-4">Consciência e Nível</p>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-[var(--q-text-primary)]">{levelMeta.label}</span>
              <span className="text-sm font-bold text-[var(--q-cyan-9)]">{profile.consciousnessScore ?? 0} pts</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--q-bg-depth)] rounded-full overflow-hidden">
               <motion.div
                 initial={{ width: 0 }}
                 animate={{ width: `${levelMeta.progress}%` }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="h-full bg-gradient-to-r from-[var(--q-cyan-8)] to-[var(--q-accent-9)] rounded-full"
               />
            </div>
            {profile.streak !== undefined && (
              <p className="mt-4 text-xs font-medium text-[var(--q-text-secondary)] flex items-center gap-2">
                <span className="text-amber-500 text-sm">🔥</span> Sequência atual: <span className="text-[var(--q-text-primary)] border-b border-[var(--q-border-subtle)]">{profile.streak} dias</span>
              </p>
            )}
          </motion.div>
        )}

        {/* Form Personal Data */}
        <motion.div variants={VARIANTS.slideUp} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] rounded-2xl p-6">
           <div className="flex justify-between items-center mb-6">
              <p className="text-[10px] text-[var(--q-text-secondary)] font-bold uppercase tracking-widest">Ajustes da Alma</p>
              {!editing ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(true)} className="text-xs font-bold text-[var(--q-accent-9)]">EDITAR</motion.button>
              ) : (
                <div className="flex gap-4">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEditing(false)} className="text-xs text-[var(--q-text-tertiary)] hover:text-white transition-colors">CANCELAR</motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => updateMutation.mutate({ name: editName, language: editLanguage })}
                    disabled={updateMutation.isPending}
                    className="text-xs font-bold text-[var(--q-accent-9)] hover:opacity-80 transition-opacity"
                  >
                    {updateMutation.isPending ? 'SALVANDO...' : 'SALVAR'}
                  </motion.button>
                </div>
              )}
           </div>

           {updateMutation.error && <p className="text-xs text-red-400 mb-4">{updateMutation.error instanceof Error ? updateMutation.error.message : 'Erro inesperado.'}</p>}

           <div className="space-y-4">
             <div>
               <p className="text-xs text-[var(--q-text-tertiary)] mb-1">Email (Autenticação)</p>
               <p className="text-sm font-medium text-[var(--q-text-primary)] bg-[var(--q-bg-depth)] p-3 rounded-lg border border-[var(--q-border-subtle)]">{profile.email}</p>
             </div>
             <div>
               <p className="text-xs text-[var(--q-text-tertiary)] mb-1">Sua alcunha</p>
               {editing ? (
                 <input
                   value={editName}
                   onChange={(e) => setEditName(e.target.value)}
                   className="w-full p-3 rounded-lg border border-[var(--q-accent-8)] text-sm text-[var(--q-text-primary)] bg-[var(--q-bg-depth)] outline-none focus:ring-1 focus:ring-[var(--q-accent-9)] transition-all"
                   placeholder="Como quer ser chamado?"
                 />
               ) : (
                 <p className="text-sm font-medium text-[var(--q-text-primary)] bg-[var(--q-bg-depth)] p-3 rounded-lg border border-[var(--q-border-subtle)]">{profile.name || 'Viajante Desconhecido'}</p>
               )}
             </div>
           </div>
        </motion.div>

        {/* Answers */}
        {profile.onboardingComplete && (
          <motion.div variants={VARIANTS.slideUp} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] rounded-2xl p-6">
            <p className="text-[10px] text-[var(--q-text-secondary)] font-bold uppercase tracking-widest mb-4">Mapeamento Inicial</p>
            <div className="space-y-4">
               {[
                 { label: 'O maior desafio diário', val: profile.painPoint ? PAIN_POINT_LABELS[profile.painPoint] : null },
                 { label: 'O objetivo da jornada', val: profile.goal ? GOAL_LABELS[profile.goal] : null },
                 { label: 'Seu estado de gravidade', val: profile.emotionalState ? EMOTIONAL_STATE_LABELS[profile.emotionalState] : null },
                 { label: 'Tempo dedicado à transcendência', val: profile.timeAvailable ? `${profile.timeAvailable} minutos` : null }
               ].filter(x => x.val).map((item, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-[var(--q-border-subtle)] pb-2 last:border-0 last:pb-0">
                   <p className="text-xs text-[var(--q-text-tertiary)]">{item.label}</p>
                   <p className="text-[13px] font-medium text-[var(--q-text-secondary)]">{item.val}</p>
                 </div>
               ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
