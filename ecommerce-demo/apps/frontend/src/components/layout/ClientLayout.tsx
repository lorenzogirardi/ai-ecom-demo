"use client";

import { useCart } from "@/hooks/useCart";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { getItemCount } = useCart();
  const cartItemCount = getItemCount();

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
