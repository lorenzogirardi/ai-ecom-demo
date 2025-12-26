"use client";

import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth-context";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { getItemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const cartItemCount = getItemCount();

  const userName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        cartItemCount={cartItemCount}
        isAuthenticated={isAuthenticated}
        userName={userName}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
