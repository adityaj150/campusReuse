import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'
import { EncryptedText } from '../components/ui/encrypted-text'
import SearchBar from '../components/SearchBar'
import { RecentlyViewed } from '../components/Recommendations'

export default function Home() {
  const {
    filteredProducts,
    categories,
    loading,
    error,
    setQuery,
    selectedCategory,
    setSelectedCategory,
  } = useProducts()

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-end">
        <div>
          <h1 className="mt-4 max-w-3xl text-4xl bebas-neue-regular text-textHeading dark:text-white sm:text-5xl">
            Buy, Sell & Discover Campus Essentials
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text dark:text-darkText">
            <EncryptedText
              text="Find great deals, connect with students and give unused items a second life."
              encryptedClassName="text-neutral-500"
              revealedClassName="text-text dark:text-darkText"
              revealDelayMs={10}
            />
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/create-product"
              className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-emerald-800 active:scale-95 dark:bg-darkAccent dark:text-neutral-900 dark:hover:bg-emerald-300"
            >
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create a Listing
            </Link>
          </div>
        </div>

        <SearchBar onSearch={setQuery} />
      </div>

      <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {loading ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center text-textHeading shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white">
          Loading products...
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
              No products matched your search.
            </div>
          )}
        </div>
      )}

      <RecentlyViewed />
    </section>
  )
}
