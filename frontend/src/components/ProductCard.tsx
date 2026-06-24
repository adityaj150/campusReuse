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
  const [flipped, setFlipped] = useState(false)

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
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-surface shadow-soft transition hover:-translate-y-0.5 dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white [perspective:1000px]">
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
        className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white dark:bg-darkSurface/80 dark:hover:bg-darkSurface"
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

      {/* Flip Wrapper */}
      <div 
        className={`relative flex h-full w-full flex-col cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        
        {/* FRONT */}
        <div className="flex h-full flex-col rounded-xl bg-surface p-5 dark:bg-darkSurfaceMuted [-webkit-backface-visibility:hidden] [backface-visibility:hidden]">
          <div className="mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-surfaceSecondary dark:bg-darkAccentSoft">
            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover transition-transform duration-500" />
          </div>
          <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase text-accent dark:text-darkAccent">
            <span>{product.category}</span>
            <span>{product.condition.replace('_', ' ')}</span>
          </div>
          <h2 className="text-xl font-semibold text-textHeading dark:text-white">{product.title}</h2>
          
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-text/60 transition-colors group-hover:text-accent dark:text-darkText/60 dark:group-hover:text-darkAccent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 1 18 5.25v6.5A2.25 2.25 0 0 1 15.75 14H13.5V6.875a1.125 1.125 0 0 0-2.25 0V14H9V4.125a1.125 1.125 0 0 0-2.25 0V14H4.5A2.25 2.25 0 0 1 2.25 11.75v-6.5a2.25 2.25 0 0 1 2.012-2.238A2.25 2.25 0 0 1 6.5 5.25v2.625a.375.375 0 0 0 .75 0V3.375a1.125 1.125 0 0 1 2.25 0v5.5a.375.375 0 0 0 .75 0V4.125a1.125 1.125 0 0 1 2.25 0v4.75a.375.375 0 0 0 .75 0V5.25a2.25 2.25 0 0 1 2.012-2.238z" clipRule="evenodd" />
            </svg>
            Click to preview description
          </p>
          
          <div className="mt-auto pt-6 flex items-center justify-between gap-4">
            <span className="rounded-md bg-surfaceSecondary px-3 py-2 text-sm font-medium text-textHeading dark:bg-darkAccentSoft dark:text-white">
              {product.price === 0 ? 'Free' : `₹${product.price}`}
            </span>
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
              aria-label={`View details for ${product.title}`}
            >
              View details
            </Link>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 flex h-full flex-col rounded-xl bg-surface p-5 dark:bg-darkSurfaceMuted [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <h3 className="mb-4 text-xl font-bold text-accent dark:text-darkAccent">{product.title}</h3>
          <p className="flex-1 overflow-y-auto pr-2 text-sm leading-6 text-text dark:text-darkText scrollbar-thin scrollbar-track-transparent scrollbar-thumb-accentSoft dark:scrollbar-thumb-darkAccentSoft">
            {product.description}
          </p>
          <div className="mt-auto pt-6 flex items-center justify-between gap-4">
            <span className="rounded-md bg-surfaceSecondary px-3 py-2 text-sm font-medium text-textHeading dark:bg-darkAccentSoft dark:text-white">
              {product.price === 0 ? 'Free' : `₹${product.price}`}
            </span>
            <Link
              to={`/product/${product.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
              aria-label={`View details for ${product.title}`}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
