import { useEffect, useMemo, useState } from 'react'
import { getProducts, type Product } from '../services/api'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message || 'Unable to load products'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesQuery = [product.name, product.category, product.location, product.description]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())

      return matchesCategory && matchesQuery
    })
  }, [products, query, selectedCategory])

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">Campus reuse</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-textHeading dark:text-white sm:text-5xl">
            Discover campus resources, spaces, and gear for every student need.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text dark:text-darkText">
            Browse mock campus items, reserve rooms, or connect with student services through a simple interface.
          </p>
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
    </section>
  )
}
