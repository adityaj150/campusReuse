import { useState, useEffect } from 'react'
import { getSavedItems } from '../services/api'
import type { Product } from '../services/api'
import ProductCard from '../components/ProductCard'

export default function LikedItems() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSavedItems().then((items) => {
      setProducts(items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleToggleSave = (productId: number, newState: boolean) => {
    if (!newState) {
      // Product was unsaved — remove from the list
      setProducts(prev => prev.filter(p => p.id !== productId))
    }
  }

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textHeading dark:text-white">
          <span className="mr-2">❤️</span> Liked Items
        </h1>
        <p className="mt-2 text-text dark:text-darkText">
          Products you've saved for later. Click the heart again to remove.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-border bg-surfaceSecondary p-12 text-center dark:border-darkBorder dark:bg-darkSurfaceMuted">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mx-auto mb-4 h-16 w-16 fill-none stroke-gray-300 dark:stroke-gray-600" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-lg font-medium text-textHeading dark:text-white">No liked items yet</p>
          <p className="mt-2 text-sm text-text dark:text-darkText">
            Browse listings and tap the heart icon to save items you're interested in.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}
    </section>
  )
}
