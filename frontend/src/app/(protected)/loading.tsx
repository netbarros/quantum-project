export default function ProtectedLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[var(--q-bg-void)]">
      <div className="w-10 h-10 rounded-full border-[3px] border-[var(--q-accent-7)]/30 border-t-[var(--q-accent-7)] animate-spin" />
    </div>
  );
}
