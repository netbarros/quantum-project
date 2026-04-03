"use client";

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { VARIANTS, TRANSITIONS } from '@/lib/animations';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  const paymentSuccess = searchParams.get('payment') === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Preencha os campos obrigatorios');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no minimo 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem');
      return;
    }

    setIsLoading(true);
    try {
      await register({ email, password, name });
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-nebula relative overflow-hidden">

      {/* Background Decorative Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
        className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,var(--q-accent-8),transparent_60%)] -bottom-[200px] -left-[200px] blur-3xl pointer-events-none opacity-20"
      />

      <motion.div
        variants={VARIANTS.pageEnter}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={TRANSITIONS.spring}
        className="w-full max-w-md z-10 py-10"
      >
        {/* Plan Badge */}
        {(selectedPlan || paymentSuccess) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 mx-auto w-fit px-4 py-2 rounded-full border border-[var(--q-accent-8)]/40 bg-[var(--q-accent-dim)] text-center"
          >
            <p className="text-xs text-[var(--q-accent-9)] font-medium">
              {paymentSuccess
                ? 'Pagamento confirmado — crie sua conta'
                : `Plano ${selectedPlan === 'yearly' ? 'Anual' : 'Mensal'} selecionado`}
            </p>
          </motion.div>
        )}

        <div className="mb-8 text-center">
          <h1 className="text-4xl text-[var(--q-text-primary)] font-[family-name:var(--font-instrument)] italic mb-2 tracking-tight">
            O Despertar
          </h1>
          <p className="text-[var(--q-text-secondary)] text-sm">
            Uma vida com intencao comeca com uma decisao.
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-[var(--q-bg-surface)]/80">
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-4 p-3 rounded-[var(--q-radius-md)] bg-[var(--q-amber-9)]/10 text-[var(--q-amber-8)] text-sm border border-[var(--q-amber-8)]/20 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Como devemos te chamar?"
              placeholder="Seu nome ou apelido"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              id="email"
              type="email"
              label="E-mail *"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              id="password"
              type="password"
              label="Senha *"
              placeholder="Minimo de 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirme a Senha *"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" className="w-full mt-4" isLoading={isLoading} size="lg">
              Iniciar Jornada
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--q-border-subtle)] text-center text-sm text-[var(--q-text-secondary)]">
            <p>
              Ja possui uma conta?{' '}
              <Link href="/login" className="text-[var(--q-accent-9)] hover:text-white transition-colors font-medium ml-1">
                Acesse aqui
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
