"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, Search } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";

interface HeaderProps {
  cartItemCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
}

export function Header({
  cartItemCount = 0,
  isAuthenticated = false,
  userName,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">
              E-commerce Demo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Categories
            </Link>
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Mobile Search Toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{userName}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn btn-outline btn-sm">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search (expandable) */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <SearchBar />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container-custom py-4 space-y-4">
            {/* Mobile Search */}
            <div className="lg:hidden">
              <SearchBar />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              <Link
                href="/products"
                className="py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/cart"
                className="py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cart
                {cartItemCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-600 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="btn btn-outline w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn btn-outline w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn btn-primary w-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
