import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-[var(--q-bg-void)]">
        <Navbar />
        <main className="flex-1 pb-[72px] md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
