import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface JournalEntry {
  id: string;
  userId: string;
  contentId: string;
  reflection: string;
  createdAt: string;
}

export function useJournalEntries(contentId?: string) {
  return useQuery({
    queryKey: ["journal", contentId],
    queryFn: () =>
      api
        .get<{ entries: JournalEntry[] }>("/journal", {
          params: contentId ? { contentId } : undefined,
        })
        .then((r) => r.data.entries),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contentId,
      reflection,
    }: {
      contentId: string;
      reflection: string;
    }) =>
      api
        .post<{ entry: JournalEntry }>("/journal", { contentId, reflection })
        .then((r) => r.data.entry),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["journal", variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });
}
