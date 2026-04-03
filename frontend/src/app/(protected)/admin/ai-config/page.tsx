"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { VARIANTS, TRANSITIONS, stagger } from "@/lib/animations";
import { useToast } from "@/components/ui/Toast";

interface ModelHealth {
  modelId: string;
  label: string;
  healthy: boolean;
  failures: number;
  skipUntil: number | null;
}

interface AiConfig {
  hasApiKey: boolean;
  apiKeyPreview: string;
  temperature: number;
  maxTokens: number;
  allowPaid: boolean;
  enabledModels: string[];
  modelHealth: ModelHealth[];
  hasElevenlabsKey: boolean;
  elevenlabsKeyPreview: string;
  elevenlabsVoiceId: string;
}

interface TestResult {
  success: boolean;
  modelUsed: string;
  isFallback: boolean;
  responseTimeMs: number;
  contentPreview: string;
}

export default function AdminAiConfigPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [newKey, setNewKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [tempValue, setTempValue] = useState<number | null>(null);
  const [tokensValue, setTokensValue] = useState<number | null>(null);
  const [newElKey, setNewElKey] = useState("");
  const [newVoiceId, setNewVoiceId] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "ai-config"],
    queryFn: () => api.get<AiConfig>("/admin/ai-config").then((r) => r.data),
    staleTime: 1000 * 15,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put("/admin/ai-config", payload),
    onSuccess: (_d, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ai-config"] });
      if (variables.apiKey) {
        setNewKey("");
        setKeyError("");
        toast.show("Chave salva. Testando conexão...", "info");
        // Auto-test after saving key
        testMutation.mutate();
      } else {
        toast.show("Configuração atualizada", "success");
      }
    },
    onError: () => {
      toast.show("Erro ao salvar configuração", "error");
    },
  });

  const testMutation = useMutation({
    mutationFn: () => api.post<TestResult>("/admin/ai-config/test").then((r) => r.data),
    onSuccess: (result) => {
      if (result.success) {
        toast.show(`IA conectada via ${result.modelUsed} (${result.responseTimeMs}ms)`, "success");
      } else {
        toast.show("Chave inválida ou modelos indisponíveis — usando conteúdo base", "error");
      }
    },
    onError: () => {
      toast.show("Falha no teste de conexão", "error");
    },
  });

  const handleSaveKey = () => {
    if (!newKey.trim()) return;
    if (!newKey.startsWith("sk-or-")) {
      setKeyError("Chave deve começar com sk-or-");
      return;
    }
    setKeyError("");
    updateMutation.mutate({ apiKey: newKey });
  };

  const toggleModel = (modelId: string) => {
    if (!data) return;
    const current = data.enabledModels ?? [];
    const next = current.includes(modelId)
      ? current.filter((id) => id !== modelId)
      : [...current, modelId];
    updateMutation.mutate({ enabledModels: next });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--q-bg-void)]">
        <p className="text-[var(--q-red-8)]">Erro ao carregar configuração AI.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--q-bg-void)] px-4 py-6 md:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div variants={VARIANTS.pageEnter} initial="initial" animate="animate" className="mb-6">
          <a href="/admin" className="text-[var(--q-text-secondary)] text-sm flex items-center gap-1 mb-4 hover:text-[var(--q-text-primary)] transition-colors w-fit">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            Admin
          </a>
          <h1 className="text-2xl font-semibold text-[var(--q-text-primary)]">Configuração IA</h1>
          <p className="text-[var(--q-text-secondary)] text-sm mt-1">Gerencie a inteligência de Sofia</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-[var(--q-bg-surface)] rounded-[var(--q-radius-lg)] border border-[var(--q-border-default)] animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <motion.div {...stagger(0.08)} initial="initial" animate="animate" className="space-y-5">
            {/* API Key Card */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider">Chave OpenRouter</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${data.hasApiKey ? "bg-[var(--q-green-8)] shadow-[0_0_6px_var(--q-green-8)]" : "bg-[var(--q-red-8)] shadow-[0_0_6px_var(--q-red-8)]"}`} />
                  <span className="text-[10px] text-[var(--q-text-tertiary)]">{data.hasApiKey ? "Conectado" : "Sem chave"}</span>
                </div>
              </div>
              {data.hasApiKey && (
                <p className="text-sm text-[var(--q-text-tertiary)] mb-3 font-mono">{data.apiKeyPreview}</p>
              )}
              <div className="flex gap-2">
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => { setNewKey(e.target.value); setKeyError(""); }}
                  placeholder={data.hasApiKey ? "Substituir chave atual" : "sk-or-v1-..."}
                  className="flex-1 h-10 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors font-mono"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveKey}
                  disabled={!newKey.trim() || updateMutation.isPending}
                  className="px-4 h-10 rounded-[var(--q-radius-md)] bg-[var(--q-accent-8)] text-white text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                  {updateMutation.isPending ? "..." : "Salvar"}
                </motion.button>
              </div>
              {keyError && <p className="text-xs text-[var(--q-red-9)] mt-2">{keyError}</p>}
              <p className="text-[10px] text-[var(--q-text-tertiary)] mt-2">Grátis: crie em openrouter.ai/keys — modelos free custam $0</p>
            </motion.div>

            {/* Model Selection + Health Card */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Modelos — Selecione quais usar</p>
              <div className="space-y-2.5">
                {data.modelHealth.map((m) => {
                  const isEnabled = data.enabledModels.length === 0 || data.enabledModels.includes(m.modelId);
                  return (
                    <div key={m.modelId} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleModel(m.modelId)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            isEnabled
                              ? "bg-[var(--q-accent-8)] text-white"
                              : "bg-[var(--q-bg-raised)] border border-[var(--q-border-default)] text-transparent"
                          }`}
                        >
                          {isEnabled && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </motion.button>
                        <div>
                          <span className="text-sm text-[var(--q-text-primary)]">{m.label}</span>
                          <span className={`ml-2 w-1.5 h-1.5 rounded-full inline-block ${m.healthy ? "bg-[var(--q-green-8)]" : "bg-[var(--q-red-8)]"}`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--q-text-tertiary)]">
                        {m.failures > 0 && <span>{m.failures} falhas</span>}
                        {!m.healthy && m.skipUntil && (
                          <span className="text-[var(--q-amber-9)]">{Math.max(0, Math.ceil((m.skipUntil - Date.now()) / 60000))}min</span>
                        )}
                        {m.modelId.includes("free") && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--q-green-dim)] text-[var(--q-green-9)] text-[9px] font-bold">FREE</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.enabledModels.length === 0 && (
                <p className="text-[10px] text-[var(--q-text-tertiary)] mt-3">Todos habilitados — Sofia usa o primeiro disponível</p>
              )}
            </motion.div>

            {/* Parameters Card */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Parâmetros de Sofia</p>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--q-text-secondary)]">Criatividade</span>
                    <span className="text-sm text-[var(--q-text-primary)] tabular-nums font-mono">{tempValue ?? data.temperature}</span>
                  </div>
                  <input type="range" min="0.1" max="1.0" step="0.1"
                    value={tempValue ?? data.temperature}
                    onChange={(e) => setTempValue(parseFloat(e.target.value))}
                    onMouseUp={() => { if (tempValue !== null) updateMutation.mutate({ temperature: tempValue }); }}
                    onTouchEnd={() => { if (tempValue !== null) updateMutation.mutate({ temperature: tempValue }); }}
                    className="w-full accent-[var(--q-accent-8)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--q-text-tertiary)] mt-1">
                    <span>Precisa</span><span>Criativa</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[var(--q-text-secondary)]">Profundidade</span>
                    <span className="text-sm text-[var(--q-text-primary)] tabular-nums font-mono">{tokensValue ?? data.maxTokens}</span>
                  </div>
                  <input type="range" min="500" max="2000" step="100"
                    value={tokensValue ?? data.maxTokens}
                    onChange={(e) => setTokensValue(parseInt(e.target.value, 10))}
                    onMouseUp={() => { if (tokensValue !== null) updateMutation.mutate({ maxTokens: tokensValue }); }}
                    onTouchEnd={() => { if (tokensValue !== null) updateMutation.mutate({ maxTokens: tokensValue }); }}
                    className="w-full accent-[var(--q-accent-8)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--q-text-tertiary)] mt-1">
                    <span>Concisa</span><span>Profunda</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--q-text-secondary)]">Modelos pagos (fallback)</p>
                    <p className="text-[10px] text-[var(--q-text-tertiary)]">GPT-4o-mini quando free falha</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateMutation.mutate({ allowPaid: !data.allowPaid })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${data.allowPaid ? "bg-[var(--q-accent-8)]" : "bg-[var(--q-bg-raised)] border border-[var(--q-border-default)]"}`}
                  >
                    <motion.div
                      animate={{ x: data.allowPaid ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 rounded-full bg-white absolute top-0.5"
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* ElevenLabs Voice Card */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider">Voz de Sofia — ElevenLabs</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${data.hasElevenlabsKey ? "bg-[var(--q-green-8)] shadow-[0_0_6px_var(--q-green-8)]" : "bg-[var(--q-text-tertiary)]"}`} />
                  <span className="text-[10px] text-[var(--q-text-tertiary)]">{data.hasElevenlabsKey ? "Ativo" : "Usando voz do navegador"}</span>
                </div>
              </div>
              <p className="text-[10px] text-[var(--q-text-tertiary)] mb-3">Opcional — sem ElevenLabs, Sofia usa a voz nativa do navegador (grátis). Com ElevenLabs, a voz é realista e multilíngue.</p>
              {data.hasElevenlabsKey && (
                <p className="text-sm text-[var(--q-text-tertiary)] mb-3 font-mono">{data.elevenlabsKeyPreview}</p>
              )}
              <div className="flex gap-2 mb-3">
                <input
                  type="password"
                  value={newElKey}
                  onChange={(e) => setNewElKey(e.target.value)}
                  placeholder={data.hasElevenlabsKey ? "Substituir chave" : "xi-..."}
                  className="flex-1 h-10 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-sm text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors font-mono"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (newElKey.trim()) {
                      updateMutation.mutate({ elevenlabsKey: newElKey });
                      setNewElKey("");
                    }
                  }}
                  disabled={!newElKey.trim() || updateMutation.isPending}
                  className="px-4 h-10 rounded-[var(--q-radius-md)] bg-[var(--q-accent-8)] text-white text-sm font-medium disabled:opacity-40 transition-opacity"
                >
                  Salvar
                </motion.button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newVoiceId || data.elevenlabsVoiceId}
                  onChange={(e) => setNewVoiceId(e.target.value)}
                  placeholder="Voice ID (ex: EXAVITQu4vr4xnSDxMaL)"
                  className="flex-1 h-9 px-3 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-default)] text-xs text-[var(--q-text-primary)] placeholder:text-[var(--q-text-tertiary)] focus:outline-none focus:border-[var(--q-accent-8)] transition-colors font-mono"
                />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (newVoiceId.trim()) {
                      updateMutation.mutate({ elevenlabsVoiceId: newVoiceId });
                    }
                  }}
                  disabled={!newVoiceId.trim() || updateMutation.isPending}
                  className="px-3 h-9 rounded-[var(--q-radius-md)] border border-[var(--q-border-default)] text-[var(--q-text-secondary)] text-xs disabled:opacity-40"
                >
                  Alterar voz
                </motion.button>
              </div>
              {data.hasElevenlabsKey && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    try {
                      toast.show("Testando voz de Sofia...", "info");
                      const res = await fetch("/api/tts/generate", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                        body: JSON.stringify({ text: "Olá, eu sou Sofia. Estou aqui para guiar sua jornada de transformação." }),
                      });
                      if (!res.ok) throw new Error(`${res.status}`);
                      const blob = await res.blob();
                      const audio = new Audio(URL.createObjectURL(blob));
                      audio.play();
                      toast.show("Voz de Sofia reproduzindo", "success");
                    } catch {
                      toast.show("Falha ao testar voz — verifique a chave", "error");
                    }
                  }}
                  className="mt-3 w-full h-9 rounded-full border border-[var(--q-accent-8)]/40 text-[var(--q-accent-9)] text-xs font-medium hover:bg-[var(--q-accent-dim)] transition-colors"
                >
                  Ouvir Sofia
                </motion.button>
              )}
              <p className="text-[10px] text-[var(--q-text-tertiary)] mt-2">Free tier: 10k chars/mês em elevenlabs.io — vozes: Sarah (padrão), Rachel, Bella</p>
            </motion.div>

            {/* Test AI Card */}
            <motion.div variants={VARIANTS.cardReveal} transition={TRANSITIONS.spring} className="bg-[var(--q-bg-surface)] border border-[var(--q-border-default)] rounded-[var(--q-radius-lg)] p-5">
              <p className="text-xs font-medium text-[var(--q-text-secondary)] uppercase tracking-wider mb-4">Testar Sofia</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                className="w-full h-11 rounded-full bg-[var(--q-accent-8)] text-white font-medium text-sm disabled:opacity-60 transition-opacity shadow-[var(--q-shadow-glow-accent)]"
              >
                {testMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Consultando modelos...
                  </span>
                ) : "Testar Geração Agora"}
              </motion.button>

              <AnimatePresence>
                {testMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-[var(--q-radius-md)] bg-[var(--q-bg-depth)] border border-[var(--q-border-subtle)] overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${testMutation.data.success ? "bg-[var(--q-green-8)] shadow-[0_0_6px_var(--q-green-8)]" : "bg-[var(--q-amber-8)]"}`} />
                      <span className="text-xs text-[var(--q-text-secondary)]">
                        {testMutation.data.success ? "Sofia respondeu" : "Conteúdo base"} · {testMutation.data.modelUsed} · {testMutation.data.responseTimeMs}ms
                      </span>
                    </div>
                    {testMutation.data.contentPreview && (
                      <p className="text-sm text-[var(--q-text-primary)] leading-relaxed font-[family-name:var(--font-instrument)] italic">
                        &ldquo;{testMutation.data.contentPreview}&rdquo;
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
