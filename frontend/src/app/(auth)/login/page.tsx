"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VARIANTS, TRANSITIONS } from '@/lib/animations';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const userResult = await login({ email, password });
      
      if (userResult.onboardingComplete) {
        router.push('/session');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[var(--q-bg-void)] relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,var(--q-accent-8),transparent_60%)] -top-[200px] -right-[200px] blur-3xl pointer-events-none opacity-20"
      />

      <motion.div
        variants={VARIANTS.pageEnter}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={TRANSITIONS.spring}
        className="w-full max-w-md z-10"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, ...TRANSITIONS.springBounce }}
            className="w-16 h-16 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-2xl">✦</span>
          </motion.div>
          <h1 className="text-4xl text-[var(--q-text-primary)] font-[family-name:var(--font-instrument)] italic mb-2 tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="text-[var(--q-text-secondary)] text-sm">
            A sua jornada de despertar continua aqui.
          </p>
        </div>

        <Card hoverable className="backdrop-blur-xl bg-[var(--q-bg-surface)]/80">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-4 p-3 rounded-[var(--q-radius-md)] bg-[var(--q-amber-9)]/10 text-[var(--q-amber-8)] text-sm border border-[var(--q-amber-8)]/20 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              type="password"
              label="Senha"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg">
              Continuar a Jornada
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--q-border-subtle)] text-center text-sm text-[var(--q-text-secondary)]">
            <p>
              Novo por aqui?{' '}
              <Link href="/register" className="text-[var(--q-accent-9)] hover:text-white transition-colors font-medium ml-1">
                Iniciar transformação
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
