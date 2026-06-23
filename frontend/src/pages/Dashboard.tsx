import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSentInquiries, getReceivedInquiries, respondToInquiry, updateProductStatus, type Product } from '../services/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'received' | 'sent'>('profile');
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // We fetch inquiries, but for 'my listings', we should fetch from /api/products/mine.
  // For simplicity here, we'll fetch products inside the tab or on load.
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [receivedData, sentData, myProductsRes, meRes] = await Promise.all([
          getReceivedInquiries(),
          getSentInquiries(),
          fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/products/mine`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('campusreuse_token')}` }
          }).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('campusreuse_token')}` }
          }).then(r => r.json())
        ]);
        setReceived(receivedData);
        setSent(sentData);
        setMyProducts(myProductsRes);
        setUserProfile(meRes);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (productId: number, newStatus: string) => {
    try {
      await updateProductStatus(productId, newStatus);
      setMyProducts(myProducts.map(p => p.id === productId ? { ...p, status: newStatus } : p));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleRespond = async (inquiryId: number, action: string) => {
    let phone = undefined;
    if (action === 'SHARE_PHONE') {
      phone = prompt("Enter your phone number to share:");
      if (!phone) return;
    }
    
    try {
      const updatedInq = await respondToInquiry(inquiryId, action, phone);
      setReceived(received.map(inq => inq.id === inquiryId ? updatedInq : inq));
    } catch (err) {
      alert("Failed to respond");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <section className="mx-auto max-w-5xl space-y-8 p-4">
      <h1 className="text-3xl bebas-neue-regular text-textHeading dark:text-white">Dashboard</h1>

      <div className="flex gap-4 border-b border-border dark:border-darkBorder">
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-accent text-accent' : 'text-text'}`}>My Profile</button>
        <button onClick={() => setActiveTab('received')} className={`px-4 py-2 font-medium ${activeTab === 'received' ? 'border-b-2 border-accent text-accent' : 'text-text'}`}>Incoming Requests</button>
        <button onClick={() => setActiveTab('sent')} className={`px-4 py-2 font-medium ${activeTab === 'sent' ? 'border-b-2 border-accent text-accent' : 'text-text'}`}>My Sent Requests</button>
        <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 font-medium ${activeTab === 'listings' ? 'border-b-2 border-accent text-accent' : 'text-text'}`}>My Listings</button>
      </div>

      <div>
        {activeTab === 'profile' && userProfile && (
          <div className="rounded border bg-white p-6 shadow-soft dark:border-darkBorder dark:bg-darkSurfaceMuted">
            <h2 className="mb-4 text-xl font-semibold text-textHeading dark:text-white">Account Details</h2>
            <div className="flex items-center gap-6">
              {userProfile.profilePicture ? (
                <img src={userProfile.profilePicture} alt={userProfile.name} className="h-24 w-24 rounded-full shadow-sm" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accentSoft text-2xl font-bold text-accent dark:bg-darkAccentSoft dark:text-darkAccent">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-medium text-textHeading dark:text-white">{userProfile.name}</p>
                <p className="text-text dark:text-darkText">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'received' && (
          <div className="space-y-4">
            {received.length === 0 ? <p>No incoming requests yet.</p> : received.map(inq => (
              <div key={inq.id} className="rounded border bg-white p-4 dark:border-darkBorder dark:bg-darkSurfaceMuted">
                <p><strong>{inq.buyerName}</strong> is interested in <strong>{inq.productTitle}</strong>.</p>
                <p className="mt-2 text-sm text-gray-500">Status: {inq.status}</p>
                {inq.status === 'PENDING' && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleRespond(inq.id, 'SHARE_EMAIL')} className="rounded bg-accent px-3 py-1 text-sm text-white transition-all duration-150 hover:bg-emerald-700 active:scale-95">Share Email</button>
                    <button onClick={() => handleRespond(inq.id, 'SHARE_PHONE')} className="rounded bg-accent px-3 py-1 text-sm text-white transition-all duration-150 hover:bg-emerald-700 active:scale-95">Share Phone</button>
                    <button disabled className="cursor-not-allowed rounded bg-gray-300 px-3 py-1 text-sm text-gray-600 opacity-50">In-Platform Chat (Coming Soon)</button>
                    <button onClick={() => handleRespond(inq.id, 'REJECT')} className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 transition-all duration-150 hover:bg-red-200 active:scale-95">Reject</button>
                  </div>
                )}
                {inq.status === 'SHARED_EMAIL' && <p className="mt-2 text-sm text-green-600">You shared your email. The buyer will contact you.</p>}
                {inq.status === 'SHARED_PHONE' && <p className="mt-2 text-sm text-green-600">You shared your phone number. The buyer will contact you.</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sent.length === 0 ? <p>You haven't requested any items.</p> : sent.map(inq => (
              <div key={inq.id} className="rounded border bg-white p-4 dark:border-darkBorder dark:bg-darkSurfaceMuted">
                <p>You requested <strong>{inq.productTitle}</strong> from {inq.sellerName}.</p>
                <div className="mt-2 p-3 bg-surfaceSecondary rounded dark:bg-darkAccentSoft">
                  <p className="text-sm font-semibold">Status: {inq.status}</p>
                  {inq.status === 'SHARED_EMAIL' && <p className="mt-1">Seller's Email: <a href={`mailto:${inq.contactEmail}`} className="text-accent underline">{inq.contactEmail}</a></p>}
                  {inq.status === 'SHARED_PHONE' && <p className="mt-1">Seller's Phone: <strong>{inq.contactPhone}</strong></p>}
                  {inq.status === 'PENDING' && <p className="mt-1 text-gray-500">Waiting for seller to respond...</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Link to="/create-product" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Add New Listing</Link>
            </div>
            {myProducts.length === 0 ? <p>You haven't posted any items yet.</p> : myProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded border bg-white p-4 dark:border-darkBorder dark:bg-darkSurfaceMuted">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl} alt="" className="h-16 w-16 object-cover rounded bg-gray-100" />
                  <div>
                    <h3 className="font-semibold text-lg">{p.title}</h3>
                    <p className="text-sm text-gray-500">₹{p.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select 
                    value={p.status} 
                    onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                    className="rounded border p-1 text-sm dark:bg-darkSurface dark:border-darkBorder"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                  <Link to={`/product/${p.id}`} className="text-sm text-accent hover:underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
