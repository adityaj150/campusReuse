// src/pages/CreateProduct.tsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    price: '',
    condition: 'GOOD',
    description: ''
  });

  const categories = ['Electronics', 'Books', 'Stationery', 'Hostel Essentials', 'Bicycles', 'Other'];
  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('category', formData.category);
      payload.append('price', (parseFloat(formData.price) || 0).toString());
      payload.append('condition', formData.condition);
      payload.append('description', formData.description);
      
      if (fileInputRef.current?.files?.[0]) {
        payload.append('image', fileInputRef.current.files[0]);
      } else {
        throw new Error('Please select an image or take a photo');
      }

      const newProduct = await createProduct(payload);
      navigate(`/product/${newProduct.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl bg-surface p-6 dark:bg-darkSurface">
      <div className="rounded-lg border border-border bg-white p-8 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
        <h1 className="mb-6 text-3xl font-semibold text-textHeading dark:text-white">Create Listing</h1>
        
        {error && <div className="mb-6 rounded bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textHeading dark:text-white">Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded border border-border p-2 dark:border-darkBorder dark:bg-darkSurface" placeholder="What are you selling?" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-textHeading dark:text-white">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded border border-border p-2 dark:border-darkBorder dark:bg-darkSurface">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-textHeading dark:text-white">Condition</label>
              <select name="condition" value={formData.condition} onChange={handleChange} className="mt-1 block w-full rounded border border-border p-2 dark:border-darkBorder dark:bg-darkSurface">
                {conditions.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textHeading dark:text-white">Price (₹)</label>
            <input required type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded border border-border p-2 dark:border-darkBorder dark:bg-darkSurface" placeholder="0.00" />
          </div>

          <div>
            <label className="block text-sm font-medium text-textHeading dark:text-white">Product Image</label>
            <input required type="file" accept="image/*" capture="environment" ref={fileInputRef} className="mt-1 block w-full rounded border border-border p-2 file:mr-4 file:rounded file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-800 dark:border-darkBorder dark:bg-darkSurface dark:file:bg-darkAccent" />
            <p className="mt-1 text-xs text-text dark:text-darkText">You can choose a file or take a photo with your camera.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-textHeading dark:text-white">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded border border-border p-2 dark:border-darkBorder dark:bg-darkSurface" placeholder="Describe the item..." />
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="rounded px-4 py-2 text-sm font-medium hover:bg-surfaceSecondary dark:hover:bg-darkAccentSoft">Cancel</button>
            <button type="submit" disabled={loading} className="rounded bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-darkAccent dark:hover:bg-emerald-300">
              {loading ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
