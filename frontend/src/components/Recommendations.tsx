import { useEffect, useState } from 'react';
import { getRecommendations, getRecentlyViewed, type Product } from '../services/api';
import ProductCard from './ProductCard';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Product[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    getRecommendations()
      .then(setRecommendations)
      .finally(() => setLoadingRecs(false));
      
    getRecentlyViewed()
      .then(setRecent)
      .finally(() => setLoadingRecent(false));
  }, []);

  if (loadingRecs && loadingRecent) return null;

  return (
    <div className="space-y-12">
      {/* Recently Viewed */}
      {recent.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-textHeading dark:text-white">Recently Viewed</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 3).map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-textHeading dark:text-white">Recommended for You</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((product) => (
              <ProductCard key={`rec-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
