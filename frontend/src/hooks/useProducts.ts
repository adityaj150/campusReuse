// src/hooks/useProducts.ts
import { useEffect, useState, useMemo } from 'react';
import { getProducts, type Product } from '../services/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message ?? 'Unable to load products'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
      const queryMatch = [p.name, p.category, p.location, p.description]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase());
      return catMatch && queryMatch;
    });
  }, [products, selectedCategory, query]);

  return {
    products,
    categories,
    filteredProducts,
    loading,
    error,
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
  };
}
