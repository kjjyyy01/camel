"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseSearchQuery, generateSearchSuggestions } from "@/lib/utils/search-parser";
import { SearchParams } from "@/types/search";

interface UnifiedSearchBarProps {
  onSearch?: (params: SearchParams) => void;
  className?: string;
  placeholder?: string;
}

export function UnifiedSearchBar({
  onSearch,
  className,
  placeholder = "지역, 매물 한번에 검색... (예: 강남 사무실, 서초 상가)",
}: UnifiedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateSuggestions = (searchQuery: string) => {
    const newSuggestions = generateSearchSuggestions(searchQuery.trim(), 8);
    setSuggestions(newSuggestions);
  };

  // 입력값 변경 처리
  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateSuggestions(value);
    }, 300);
  };

  const handleSearch = (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    const parsedSearch = parseSearchQuery(queryToSearch.trim());

    const params: SearchParams = {
      keyword: parsedSearch.keyword,
      location: parsedSearch.location,
    };

    onSearch?.(params);
    setShowSuggestions(false);

    // 최근 검색어 저장
    if (queryToSearch.trim()) {
      const recentSearches = JSON.parse(localStorage.getItem("recentUnifiedSearches") || "[]");
      const newSearches = [
        queryToSearch.trim(),
        ...recentSearches.filter((s: string) => s !== queryToSearch.trim()),
      ].slice(0, 10);
      localStorage.setItem("recentUnifiedSearches", JSON.stringify(newSearches));
    }
  };

  // 정리 함수
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // 제안 항목 클릭 처리
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // 초기 로드시 인기 검색어 로드
  useEffect(() => {
    updateSuggestions("");
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex gap-2 bg-white rounded-lg shadow-xs border">
        {/* 통합 검색 입력창 */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyPress}
              className="pl-10 h-9 text-sm border-0 focus:ring-2 focus:ring-primary/20 bg-white"
            />
          </div>

          {/* 검색 제안 드롭다운 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 px-2">{query ? "검색 제안" : "인기 검색어"}</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    className="w-full text-left px-3 py-2.5 hover:bg-gray-50 text-sm rounded-md transition-colors"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <Search className="h-3 w-3 mr-3 text-gray-400" />
                      <span className="flex-1">
                        {query && suggestion.toLowerCase().includes(query.toLowerCase()) ? (
                          // 검색어 하이라이트
                          <>
                            {suggestion.split(new RegExp(`(${query})`, "gi")).map((part, i) =>
                              part.toLowerCase() === query.toLowerCase() ? (
                                <mark key={i} className="bg-yellow-200 text-black font-medium">
                                  {part}
                                </mark>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            )}
                          </>
                        ) : (
                          suggestion
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 검색 버튼 */}
        <Button
          onClick={() => handleSearch()}
          className="h-9 px-4 bg-primary hover:bg-primary/90 text-sm font-medium"
          disabled={!query.trim()}
        >
          검색
        </Button>
      </div>
    </div>
  );
}
