"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:   "text-[var(--q-text-tertiary)]",
  AWARE:      "text-[var(--q-accent-9)]",
  CONSISTENT: "text-[var(--q-cyan-9)]",
  ALIGNED:    "text-[var(--q-green-9)]",
  INTEGRATED: "text-[var(--q-amber-9)]",
};

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

interface UserTableProps {
  users: User[];
  onUserClick?: (userId: string) => void;
}

export function UserTable({ users, onUserClick }: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sorted = [...users].sort((a, b) => {
    const av = a[sortField] ?? "";
    const bv = b[sortField] ?? "";
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof User }) => (
    <span className={`ml-1 text-xs ${sortField === field ? "text-[var(--q-accent-9)]" : "text-[var(--q-text-tertiary)]"}`}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="overflow-x-auto rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--q-border-default)] bg-[var(--q-bg-raised)]">
            {[
              { label: "Usuário", field: "email" as keyof User },
              { label: "Nível", field: "level" as keyof User },
              { label: "Score", field: "consciousnessScore" as keyof User },
              { label: "Streak", field: "streak" as keyof User },
              { label: "Dia", field: "currentDay" as keyof User },
              { label: "Tier", field: "isPremium" as keyof User },
            ].map(({ label, field }) => (
              <th
                key={field}
                onClick={() => handleSort(field)}
                className="text-left px-4 py-3 text-[var(--q-text-tertiary)] text-xs uppercase tracking-wider cursor-pointer hover:text-[var(--q-text-secondary)] transition-colors select-none"
              >
                {label}
                <SortIcon field={field} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((user, i) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onUserClick?.(user.id)}
              className="border-b border-[var(--q-border-subtle)] hover:bg-[var(--q-bg-raised)] transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <div>
                  <p className="text-[var(--q-text-primary)] font-medium truncate max-w-[180px]">
                    {user.name ?? "—"}
                  </p>
                  <p className="text-[var(--q-text-tertiary)] text-xs truncate max-w-[180px]">
                    {user.email}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium ${LEVEL_COLORS[user.level] ?? ""}`}>
                  {user.level}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--q-text-primary)] tabular-nums">
                {user.consciousnessScore}
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-1 text-[var(--q-text-primary)]">
                  {user.streak > 0 ? "🔥" : "💤"} {user.streak}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--q-text-secondary)] tabular-nums">
                {user.currentDay}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isPremium
                      ? "bg-[var(--q-accent-dim)] text-[var(--q-accent-9)] border border-[var(--q-accent-8)]"
                      : "bg-[var(--q-bg-raised)] text-[var(--q-text-tertiary)] border border-[var(--q-border-subtle)]"
                  }`}
                >
                  {user.isPremium ? "Premium" : "Free"}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="py-12 text-center text-[var(--q-text-tertiary)] text-sm">
          Nenhum usuário encontrado.
        </div>
      )}
    </div>
  );
}
