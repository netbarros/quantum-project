"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { UserTable } from "@/components/admin/UserTable";
import { VARIANTS } from "@/lib/animations";

interface User {
  id: string;
  email: string;
  name: string | null;
  level: string;
  isPremium: boolean;
  streak: number;
  consciousnessScore: number;
  currentDay: number;
  createdAt: string;
  lastSessionDate: string | null;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isPremiumFilter, setIsPremiumFilter] = useState<"" | "true" | "false">("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", { search, page, isPremiumFilter }],
    queryFn: () =>
      api
        .get<UsersResponse>("/admin/users", {
          params: {
            search: search || undefined,
            page,
            isPremium: isPremiumFilter || undefined,
            limit: 20,
          },
        })
        .then((r) => r.data),
    staleTime: 1000 * 30,
  });

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] p-6">
      {/* Header */}
      <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
        <a
          href="/admin"
          className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Admin
        </a>
        <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Usuários</h1>
        {data && (
          <p className="text-[var(--q-text-secondary)] text-sm mt-1">
            {data.total.toLocaleString()} usuários cadastrados
          </p>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={VARIANTS.cardReveal}
        initial="initial"
        animate="animate"
        className="flex flex-wrap gap-3 mb-5"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por email ou nome..."
          className="flex-1 min-w-[200px] h-10 px-4 rounded-[var(--q-radius-md)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors"
        />
        <select
          value={isPremiumFilter}
          onChange={(e) => { setIsPremiumFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
          className="h-10 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-secondary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors"
        >
          <option value="">Todos os tiers</option>
          <option value="true">Premium</option>
          <option value="false">Free</option>
        </select>
      </motion.div>

      {/* Table */}
      {error ? (
        <div className="p-4 rounded-[var(--q-radius-lg)] bg-[var(--q-red-dim)] border border-[var(--q-red-8)]/20 text-center">
          <p className="text-[var(--q-red-9)] text-sm">Erro ao carregar usuários.</p>
        </div>
      ) : isLoading ? (
        <div className="h-64 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
      ) : data ? (
        <>
          <UserTable users={data.users} onUserClick={(id) => router.push(`/admin/users/${id}`)} />

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-[var(--q-radius-md)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-secondary)] disabled:opacity-40 hover:border-[var(--q-border-strong)] transition-colors"
              >
                Anterior
              </motion.button>
              <span className="text-sm text-[var(--q-text-secondary)] tabular-nums">
                {page} / {data.totalPages}
              </span>
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-[var(--q-radius-md)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-secondary)] disabled:opacity-40 hover:border-[var(--q-border-strong)] transition-colors"
              >
                Próxima
              </motion.button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
