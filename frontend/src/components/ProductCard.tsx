import { Link } from 'react-router-dom'
import type { Product } from '../services/api'

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accentBorder dark:border-darkBorder dark:bg-darkSurfaceMuted dark:text-white">
      <div className="mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-surfaceSecondary dark:bg-darkAccentSoft">
        <img src={product.imageUrl} alt="" className="h-20 w-20 object-contain opacity-80" aria-hidden="true" />
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
