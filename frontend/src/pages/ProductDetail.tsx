import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProducts, type Product } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then((products) => {
        const match = products.find((item) => String(item.id) === id)
        if (!match) {
          setError('Listing not found')
          return
        }

        setProduct(match)
      })
      .catch((err) => setError(err.message || 'Unable to load listing'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center text-textHeading shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white">
        Loading listing...
      </div>
    )
  }

  if (error || !product) {
    return (
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">Listing detail</p>
        <h1 className="text-4xl font-semibold text-textHeading dark:text-white">Listing not found</h1>
        <p className="text-text dark:text-darkText">{error || 'This listing is not available.'}</p>
        <Link className="inline-flex rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white dark:bg-darkAccent dark:text-darkSurface" to="/listings">
          Back to listings
        </Link>
      </section>
    )
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
        <div className="flex aspect-[16/9] items-center justify-center bg-surfaceSecondary dark:bg-darkAccentSoft">
          <img src={product.imageUrl} alt="" className="h-28 w-28 object-contain opacity-80" aria-hidden="true" />
        </div>
        <div className="space-y-4 p-6">
          <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">{product.category}</p>
          <h1 className="text-4xl font-semibold text-textHeading dark:text-white">{product.name}</h1>
          <p className="text-base leading-7 text-text dark:text-darkText">{product.description}</p>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface p-6 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-textHeading dark:text-white">Location</dt>
            <dd className="mt-1 text-text dark:text-darkText">{product.location}</dd>
          </div>
          <div>
            <dt className="font-semibold text-textHeading dark:text-white">Price</dt>
            <dd className="mt-1 text-text dark:text-darkText">{product.price === 0 ? 'Free loan' : `$${product.price}`}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
        >
          Reserve
        </button>
      </aside>
    </section>
  )
}
