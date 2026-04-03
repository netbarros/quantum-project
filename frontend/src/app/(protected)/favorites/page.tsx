"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS, stagger, TRANSITIONS } from "@/lib/animations";

interface FavoriteItem {
  id: string;
  day: number;
  content: {
    direction?: string;
    affirmation?: string;
    reflection?: string;
  };
  favoritedAt: string;
}

export default function FavoritesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.get<{ favorites: FavoriteItem[] }>("/sessions/favorites").then((r) => r.data.favorites ?? []),
    staleTime: 1000 * 60,
  });

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-[var(--q-red-8)] text-sm">Erro ao carregar favoritos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nebula px-4 py-6 md:px-6">
      <div className="max-w-xl mx-auto">
        <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
          <h1 className="text-2xl font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] mb-1">
            Sua Sabedoria
          </h1>
          <p className="text-sm text-[var(--q-text-secondary)]">Momentos que você guardou da jornada</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <motion.div {...stagger(0.08)} initial="initial" animate="animate" className="space-y-3">
            {data.map((fav) => (
              <motion.div
                key={fav.id}
                variants={VARIANTS.cardReveal}
                transition={TRANSITIONS.spring}
                className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--q-amber-9)]">✦</span>
                    <span className="text-xs text-[var(--q-text-tertiary)] uppercase tracking-wider">Dia {fav.day}</span>
                  </div>
                  <span className="text-[10px] text-[var(--q-text-tertiary)]">
                    {new Date(fav.favoritedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {fav.content.affirmation && (
                  <p className="text-sm font-[family-name:var(--font-instrument)] italic text-[var(--q-text-primary)] leading-relaxed mb-2">
                    &ldquo;{fav.content.affirmation}&rdquo;
                  </p>
                )}
                {fav.content.direction && !fav.content.affirmation && (
                  <p className="text-sm text-[var(--q-text-secondary)] leading-relaxed">
                    {fav.content.direction}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[var(--q-bg-surface)] border border-[var(--q-border-subtle)] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-[var(--q-cyan-9)]">✦</span>
            </div>
            <p className="text-[var(--q-text-secondary)] text-sm max-w-xs mx-auto mb-1">
              Nenhum favorito ainda.
            </p>
            <p className="text-[var(--q-text-tertiary)] text-xs">
              Marque momentos especiais nas sessões para salvá-los aqui.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
