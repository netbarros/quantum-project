import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Settings {
  notificationTime: string | null;
  pushSubscriptionActive: boolean;
  language: string;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/settings").then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateNotificationTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationTime: string) =>
      api.put("/settings/notification-time", { notificationTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (language: string) =>
      api.put("/settings/language", { language }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
