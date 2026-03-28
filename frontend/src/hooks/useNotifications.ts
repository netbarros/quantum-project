"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface NotificationState {
  permission: NotificationPermission | "unsupported";
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

function isSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>(() => {
    if (!isSupported()) {
      return { permission: "unsupported", isSubscribed: false, isLoading: false, error: null };
    }
    return {
      permission: Notification.permission,
      isSubscribed: false,
      isLoading: false,
      error: null,
    };
  });

  const subscribeMutation = useMutation({
    mutationFn: (subscription: PushSubscriptionJSON) =>
      api.post("/notifications/subscribe", { subscription }),
    onSuccess: () => {
      setState((prev) => ({ ...prev, isSubscribed: true, isLoading: false, error: null }));
    },
    onError: (err: Error) => {
      setState((prev) => ({ ...prev, isLoading: false, error: err.message }));
    },
  });

  const checkPermission = useCallback((): NotificationPermission | "unsupported" => {
    if (!isSupported()) return "unsupported";
    return Notification.permission;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) return false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission: result, isLoading: false }));
      return result === "granted";
    } catch {
      setState((prev) => ({ ...prev, isLoading: false, error: "Permissão negada" }));
      return false;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<void> => {
    if (!isSupported()) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const granted = await requestPermission();
      if (!granted) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Permissão para notificações não concedida.",
        }));
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        setState((prev) => ({ ...prev, isLoading: false, error: "VAPID key não configurada." }));
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      await subscribeMutation.mutateAsync(subscription.toJSON());
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Erro ao ativar notificações",
      }));
    }
  }, [requestPermission, subscribeMutation]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!isSupported()) return;
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false, error: null }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    ...state,
    isSupported: isSupported(),
    checkPermission,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}
