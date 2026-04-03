"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to /plans — single checkout page, no duplicate
export default function PaywallPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/plans"); }, [router]);
  return null;
}
