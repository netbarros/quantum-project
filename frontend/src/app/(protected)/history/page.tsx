"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import { useSessionHistory, type SessionHistoryItem } from "@/hooks/useSessionHistory";
import { useRouter } from "next/navigation";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

function HistoryCard({ item, index }: { item: SessionHistoryItem; index: number }): React.ReactElement {
  const router = useRouter();
  const title = item.content?.direction ?? `Dia ${item.day}`;
  const preview = item.content?.reflection ?? item.content?.explanation ?? "";

  return (
    <motion.button
      variants={VARIANTS.cardReveal}
      transition={{ ...TRANSITIONS.spring, delay: index * 0.08 }}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2, borderColor: "var(--q-border-medium)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/session?day=${item.day}`)}
      className="w-full text-left p-4 rounded-2xl bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium font-[family-name:var(--font-dm-sans)] text-[var(--q-text-tertiary)]">
          Dia {item.day} · {formatDate(item.completedAt)}
        </span>
        {item.isFavorite && <span className="text-sm">&#11088;</span>}
      </div>

      <h3 className="text-lg font-[family-name:var(--font-instrument)] text-[var(--q-text-primary)] mb-1 line-clamp-1">
        {title}
      </h3>

      {preview && (
        <p className="text-sm font-[family-name:var(--font-dm-sans)] text-[var(--q-text-secondary)] line-clamp-2">
          {preview}
        </p>
      )}
    </motion.button>
  );
}

function SkeletonCard(): React.ReactElement {
  return (
    <div className="p-4 rounded-2xl bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] animate-pulse">
      <div className="h-3 w-24 bg-[var(--q-bg-raised)] rounded mb-3" />
      <div className="h-5 w-3/4 bg-[var(--q-bg-raised)] rounded mb-2" />
      <div className="h-4 w-full bg-[var(--q-bg-raised)] rounded" />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  const router = useRouter();
  return (
    <motion.div
      variants={VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      transition={TRANSITIONS.smooth}
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full bg-[var(--q-accent-dim)] flex items-center justify-center mb-6"
      >
        <span className="text-3xl">&#10022;</span>
      </motion.div>

      <h2 className="text-xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-3">
        Sua jornada começa hoje
      </h2>
      <p className="text-sm font-[family-name:var(--font-dm-sans)] text-[var(--q-text-secondary)] max-w-xs mb-8">
        Complete sua primeira sessão diária para revelar o registro da sua transformação.
      </p>

      <motion.button
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => router.push("/session")}
        className="h-12 px-8 rounded-full bg-[var(--q-accent-8)] text-white font-medium font-[family-name:var(--font-dm-sans)]"
      >
        Completar primeira sessão
      </motion.button>
    </motion.div>
  );
}

export default function HistoryPage(): React.ReactElement {
  const { data, isLoading, error, refetch } = useSessionHistory();

  return (
    <motion.div
      variants={VARIANTS.pageEnter}
      initial="initial"
      animate="animate"
      className="min-h-screen px-4 py-6 max-w-xl mx-auto bg-nebula"
    >
      {/* Header with mandala orb — per inspiration/sua-jornada.png */}
      <div className="flex flex-col items-center text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mb-4 opacity-30"
        >
          <svg viewBox="0 0 64 64" className="w-full h-full">
            {[0, 30, 60, 90, 120, 150].map((angle, i) => (
              <circle key={i} cx={32 + Math.cos(angle * Math.PI / 180) * 18} cy={32 + Math.sin(angle * Math.PI / 180) * 18} r="12" fill="none" stroke="var(--q-accent-9)" strokeWidth="0.5" opacity="0.5" />
            ))}
            <circle cx="32" cy="32" r="12" fill="none" stroke="var(--q-accent-8)" strokeWidth="0.6" />
          </svg>
        </motion.div>
        <h1 className="text-3xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-2">
          Sua Jornada
        </h1>
        <p className="text-sm text-[var(--q-text-secondary)] max-w-xs leading-relaxed">
          O registro das suas epifanias e transformações. Cada sessão guardada para revisitar.
        </p>
        <a href="/journal" className="text-xs text-[var(--q-accent-9)] hover:text-[var(--q-text-primary)] transition-colors mt-3">
          Ver diário de reflexões →
        </a>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      )}

      {error && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-[var(--q-text-secondary)]">{error}</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => refetch()}
            className="px-6 h-11 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] text-[var(--q-text-primary)] text-sm"
          >
            Tentar novamente
          </motion.button>
        </div>
      )}

      {!isLoading && !error && data.length === 0 && <EmptyState />}

      {!isLoading && !error && data.length > 0 && (
        <motion.div {...stagger(0.08)} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {data.map((item, i) => (
              <HistoryCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
