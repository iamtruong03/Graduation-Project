import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (fetchData, options = {}) => {
  const { threshold = 100, initialPage = 0, pageSize = 10 } = options;
  
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await fetchData(page, pageSize);
      
      const newItems = response.data.content;
      const totalPages = response.data.totalPages;

      setItems(prev => [...prev, ...newItems]);
      setHasMore(page < totalPages - 1);
      setPage(prev => prev + 1);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasMore]);

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - threshold) {
      loadMore();
    }
  }, [loadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const reset = () => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  };

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
}; 