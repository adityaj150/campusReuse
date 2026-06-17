import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById, createInquiry, logProductView, type Product } from '../services/api'
import { RecommendedForYou } from '../components/Recommendations'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiryStatus, setInquiryStatus] = useState<{loading: boolean, success?: string, error?: string}>({ loading: false })

  useEffect(() => {
    if (!id) return;
    getProductById(Number(id))
      .then((p) => {
        setProduct(p);
        // Log view for recommendations (fail silently so it doesn't break UI)
        logProductView(p.id).catch(() => {});
      })
      .catch((err) => setError(err.message || 'Unable to load listing'))
      .finally(() => setLoading(false))
  }, [id]);

  const handleInterested = async () => {
    if (!product) return;
    setInquiryStatus({ loading: true });
    try {
      await createInquiry(product.id);
      setInquiryStatus({ loading: false, success: "Request sent! Check your Dashboard for updates." });
    } catch (err: any) {
      setInquiryStatus({ loading: false, error: err.message });
    }
  };

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
    <>
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
        <div className="flex aspect-[16/9] items-center justify-center bg-surfaceSecondary dark:bg-darkAccentSoft">
          <img src={product.imageUrl} alt="" className="h-48 w-48 object-contain opacity-80" aria-hidden="true" />
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase text-accent dark:text-darkAccent">{product.category}</p>
            {product.status !== 'AVAILABLE' && (
              <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-800">
                {product.status}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-semibold text-textHeading dark:text-white">{product.title}</h1>
          <p className="text-sm text-text dark:text-darkText">Posted by: {product.seller.name}</p>
          <p className="text-base leading-7 text-text dark:text-darkText">{product.description}</p>
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface p-6 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-textHeading dark:text-white">Condition</dt>
            <dd className="mt-1 text-text dark:text-darkText">{product.condition.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="font-semibold text-textHeading dark:text-white">Price</dt>
            <dd className="mt-1 text-text dark:text-darkText">{product.price === 0 ? 'Free' : `₹${product.price}`}</dd>
          </div>
        </dl>
        
        <div className="mt-6">
          {inquiryStatus.success ? (
            <div className="rounded bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
              {inquiryStatus.success}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleInterested}
                disabled={inquiryStatus.loading || product.status !== 'AVAILABLE'}
                className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50 dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
              >
                {inquiryStatus.loading ? 'Sending...' : "I'm Interested"}
              </button>
              {inquiryStatus.error && (
                <p className="mt-2 text-sm text-red-600">{inquiryStatus.error}</p>
              )}
            </>
          )}
        </div>
      </aside>
    </section>
    <RecommendedForYou />
    </>
  )
}
