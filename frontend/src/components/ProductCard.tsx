import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Product } from '../services/api'
import { toggleSavedItem } from '../services/api'
import { GlowingEffect } from './ui/glowing-effect'

type ProductCardProps = {
  product: Product
  isSaved?: boolean
  onToggleSave?: (productId: number, newState: boolean) => void
}

export default function ProductCard({ product, isSaved = false, onToggleSave }: ProductCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [animating, setAnimating] = useState(false)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAnimating(true)
    try {
      const result = await toggleSavedItem(product.id)
      setSaved(result.saved)
      onToggleSave?.(product.id, result.saved)
    } catch (err) {
      console.error('Failed to toggle save', err)
    }
    setTimeout(() => setAnimating(false), 400)
  }

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      {/* Heart Icon */}
      <button
        type="button"
        onClick={handleToggleSave}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white dark:bg-darkSurface/80 dark:hover:bg-darkSurface"
        aria-label={saved ? 'Remove from liked items' : 'Add to liked items'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition-all duration-300 ${
            animating ? 'scale-125' : 'scale-100'
          } ${
            saved
              ? 'fill-red-500 stroke-red-500'
              : 'fill-none stroke-gray-400 group-hover:stroke-red-400'
          }`}
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      <div className="mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-surfaceSecondary dark:bg-darkAccentSoft">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase text-accent dark:text-darkAccent">
        <span>{product.category}</span>
        <span>{product.condition.replace('_', ' ')}</span>
      </div>
      <h2 className="text-xl font-semibold text-textHeading dark:text-white">{product.title}</h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-text dark:text-darkText">{product.description}</p>
      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="rounded-md bg-surfaceSecondary px-3 py-2 text-sm font-medium text-textHeading dark:bg-darkAccentSoft dark:text-white">
          {product.price === 0 ? 'Free' : `₹${product.price}`}
        </span>
        <Link
          to={`/product/${product.id}`}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
          aria-label={`View details for ${product.title}`}
        >
          View details
        </Link>
      </div>
    </article>
  )
}
