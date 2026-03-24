'use client';

import { useEffect, useRef, useState } from 'react';
import { watchlistApi, WatchlistItem } from '@/infrastructure/api/watchlistApi';
import { stockApi, StockSearchResult } from '@/infrastructure/api/stockApi';

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    watchlistApi
      .getList()
      .then(setItems)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await stockApi.search(value);
        setResults(data);
        setShowDropdown(data.length > 0);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelect = async (stock: StockSearchResult) => {
    setShowDropdown(false);
    setQuery('');
    setResults([]);
    setError(null);
    try {
      const added = await watchlistApi.add(stock.symbol, stock.name);
      setItems((prev) => [...prev, added]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await watchlistApi.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">관심종목</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 text-red-700 rounded-lg dark:bg-red-950 dark:border-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 검색 추가 */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-2 text-gray-700 dark:text-gray-300">종목 검색</h2>
        <div ref={wrapperRef} className="relative">
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white dark:bg-gray-900 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="종목명 또는 코드로 검색 (예: 삼성전자, 005930)"
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-gray-400"
            />
            {searching && (
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>

          {/* 검색 드롭다운 */}
          {showDropdown && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {results.map((stock) => (
                <li key={stock.symbol}>
                  <button
                    type="button"
                    onClick={() => handleSelect(stock)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gray-400 w-14">{stock.symbol}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stock.name}</span>
                    </div>
                    {stock.market && (
                      <span className="text-xs text-gray-400 shrink-0">{stock.market}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-xs text-gray-400">검색 결과를 클릭하면 바로 관심종목에 추가됩니다.</p>
      </section>

      {/* 목록 */}
      <section>
        <h2 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
          등록된 관심종목
          <span className="ml-2 text-sm font-normal text-gray-400">({items.length})</span>
        </h2>

        {loading ? (
          <p className="text-gray-500 py-8 text-center">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 py-10 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-700 text-sm">
            관심종목을 검색해서 추가해보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex gap-3 items-center">
                  <span className="font-mono text-xs text-gray-400 w-14">{item.symbol}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
