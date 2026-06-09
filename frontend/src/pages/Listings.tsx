// src/pages/Listings.tsx
import { useProducts } from '../hooks/useProducts';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Listings() {
  const {
    filteredProducts,
    categories,
    loading,
    error,
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
  } = useProducts();

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">All listings</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-textHeading dark:text-white sm:text-5xl">
            Browse every available campus resource.
          </h1>
        </div>
        <SearchBar onSearch={setQuery} />
      </div>

      <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {loading ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-textHeading shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white">
          Loading listings...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-soft dark:border-red-500/30 dark:bg-red-900/10 dark:text-red-200">
          {error}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" id="browse">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-textHeading shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white sm:col-span-2 lg:col-span-3">
              No listings matched your search.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
