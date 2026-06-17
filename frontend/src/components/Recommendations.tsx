import { useEffect, useState } from 'react';
import { getRecommendations, getRecentlyViewed, type Product } from '../services/api';
import ProductCard from './ProductCard';

export function RecentlyViewed() {
  const [recent, setRecent] = useState<Product[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    getRecentlyViewed()
      .then(setRecent)
      .finally(() => setLoadingRecent(false));
  }, []);

  if (loadingRecent || recent.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border dark:border-darkBorder">
      <h2 className="mb-6 text-2xl font-bold text-textHeading dark:text-white">Recently Viewed</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recent.slice(0, 3).map((product) => (
          <ProductCard key={`recent-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}

export function RecommendedForYou() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    getRecommendations()
      .then(setRecommendations)
      .finally(() => setLoadingRecs(false));
  }, []);

  if (loadingRecs || recommendations.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border dark:border-darkBorder">
      <h2 className="mb-6 text-2xl font-bold text-textHeading dark:text-white">Recommended for You</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((product) => (
          <ProductCard key={`rec-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}
