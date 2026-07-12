import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTrip } from '../services/api';
import { getUser } from '../services/auth';

export default function CreateTrip() {
  const navigate = useNavigate();
  const user = getUser();
  
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    tripDate: '',
    departureTime: '',
    transportType: 'Uber',
    maxMembers: 4,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'maxMembers' ? parseInt(value) || 2 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Please login to create a trip');
      
      await createTrip({
        ...formData,
        createdBy: user.id,
        maxMembers: Number(formData.maxMembers),
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/rideshare'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-textHeading dark:text-darkText">Publish a Trip</h1>
        <Link to="/rideshare" className="rounded-lg bg-surfaceSecondary px-4 py-2 text-sm font-semibold text-textHeading transition hover:bg-gray-300 dark:bg-darkAccentSoft dark:text-white dark:hover:bg-gray-700">
          ← Back to Dashboard
        </Link>
      </div>
      <div className="bg-surface dark:bg-darkSurface p-6 rounded-xl border border-border dark:border-darkBorder shadow-sm">
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
            ✅ Trip published successfully! Redirecting...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Source</label>
              <input required name="source" value={formData.source} onChange={handleChange} type="text" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Campus Main Gate" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Destination</label>
              <input required name="destination" value={formData.destination} onChange={handleChange} type="text" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Airport" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Date</label>
              <input required name="tripDate" value={formData.tripDate} onChange={handleChange} type="date" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Time</label>
              <input required name="departureTime" value={formData.departureTime} onChange={handleChange} type="time" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Preferred Transport</label>
              <select name="transportType" value={formData.transportType} onChange={handleChange} className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent">
                <option value="Uber">Uber</option>
                <option value="Ola">Ola</option>
                <option value="Auto">Auto</option>
                <option value="Rapido">Rapido</option>
                <option value="Any">Any</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Max Members (2–6)</label>
              <input required name="maxMembers" value={formData.maxMembers} onChange={handleChange} type="number" min="2" max="6" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-textHeading dark:text-darkText">Notes (Optional)</label>
            <input name="notes" value={formData.notes} onChange={handleChange} type="text" className="w-full rounded-md border border-border dark:border-darkBorder bg-transparent p-2 text-textHeading dark:text-darkText focus:border-accent focus:ring-1 focus:ring-accent" placeholder="e.g. Bringing two big bags" />
          </div>
          <button disabled={loading || success} type="submit" className="w-full bg-accent text-white py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50">
            {loading ? 'Publishing...' : success ? '✅ Published!' : 'Publish Trip'}
          </button>
        </form>
      </div>
    </div>
  );
}
