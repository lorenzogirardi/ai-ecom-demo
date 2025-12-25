"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
}

export function SearchBar({
  placeholder = "Search products...",
  onSearch,
  showSuggestions = true,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    if (!showSuggestions || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        // const data = await response.json();
        // setSuggestions(data.results);

        // Mock suggestions for now
        setSuggestions([]);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onSearch) {
        onSearch(query);
      } else {
        router.push(`/products?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/products/${suggestion.slug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="input pl-10 pr-10"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 overflow-hidden">
          <ul className="py-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  {suggestion.imageUrl && (
                    <img
                      src={suggestion.imageUrl}
                      alt=""
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${suggestion.price.toFixed(2)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
