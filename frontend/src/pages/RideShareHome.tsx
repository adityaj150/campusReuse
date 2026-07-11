import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, getJoinedTrips } from '../services/api';
import type { Trip } from '../services/api';
import { getUser } from '../services/auth';

export default function RideShareHome() {
  const user = getUser();
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allTrips = await getTrips();
        if (user) {
          setMyTrips(allTrips.filter(t => t.createdBy === user.id));
          
          const joined = await getJoinedTrips(user.id);
          // Only show trips the user joined but didn't create (since they are in My Trips)
          setJoinedTrips(joined.filter(t => t.createdBy !== user.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const isTripExpired = (trip: Trip) => {
    if (trip.status === 'CANCELLED' || trip.status === 'COMPLETED') return true;
    
    let dateStr = trip.tripDate;
    if (Array.isArray(trip.tripDate)) {
      const [y, m, d] = trip.tripDate as any;
      dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    let timeStr = trip.departureTime;
    if (Array.isArray(trip.departureTime)) {
      const [h, m, s = 0] = trip.departureTime as any;
      timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    const departureDate = new Date(`${dateStr}T${timeStr}`);
    const expiryDate = new Date(departureDate.getTime() + 60 * 60 * 1000);
    return new Date() > expiryDate;
  };

  const activeMyTrips = myTrips.filter(t => !isTripExpired(t));
  const activeJoinedTrips = joinedTrips.filter(t => !isTripExpired(t));
  
  // Combine all expired trips, remove duplicates if any (though there shouldn't be), and sort them
  const expiredTrips = [...myTrips.filter(isTripExpired), ...joinedTrips.filter(isTripExpired)].sort((a, b) => {
    // Basic sort by tripId descending
    return b.tripId - a.tripId;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-textHeading dark:text-darkText">Ride Share Dashboard</h1>
      <div className="flex gap-4">
        <Link to="/rideshare/discover" className="rounded-lg bg-accent px-4 py-2 font-semibold text-white hover:bg-accent/90 transition shadow-sm">
          Discover Trips
        </Link>
        <Link to="/rideshare/create" className="rounded-lg border border-accent text-accent px-4 py-2 font-semibold hover:bg-accent/10 transition">
          Create a Trip
        </Link>
      </div>
      
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">My Trips</h2>
            {activeMyTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No active trips created.</p>
            ) : (
              <ul className="space-y-3">
                {activeMyTrips.map(trip => (
                  <li key={trip.tripId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{trip.source} to {trip.destination}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          let dateStr = trip.tripDate;
                          if (Array.isArray(trip.tripDate)) {
                            const [y, m, d] = trip.tripDate as any;
                            dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          }
                          let timeStr = trip.departureTime;
                          if (Array.isArray(trip.departureTime)) {
                            const [h, m, s = 0] = trip.departureTime as any;
                            timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                          }
                          return `${new Date(dateStr).toLocaleDateString()} at ${timeStr}`;
                        })()}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/rideshare/trip/${trip.tripId}`)}
                      className="text-accent text-sm font-medium hover:underline"
                    >
                      Manage
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Joined Trips</h2>
            {activeJoinedTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No active joined trips.</p>
            ) : (
              <ul className="space-y-3">
                {activeJoinedTrips.map(trip => (
                  <li key={trip.tripId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{trip.source} to {trip.destination}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(() => {
                          let dateStr = trip.tripDate;
                          if (Array.isArray(trip.tripDate)) {
                            const [y, m, d] = trip.tripDate as any;
                            dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          }
                          let timeStr = trip.departureTime;
                          if (Array.isArray(trip.departureTime)) {
                            const [h, m, s = 0] = trip.departureTime as any;
                            timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                          }
                          return `${new Date(dateStr).toLocaleDateString()} at ${timeStr}`;
                        })()}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/rideshare/trip/${trip.tripId}`)}
                      className="text-accent text-sm font-medium hover:underline"
                    >
                      Open Chat
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ride History Section taking full width if possible, or just another cell */}
          <div className="md:col-span-2 rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm mt-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Ride History</h2>
            {expiredTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No past rides.</p>
            ) : (
              <ul className="space-y-3">
                {expiredTrips.map(trip => {
                  const isCreator = user && trip.createdBy === user.id;
                  return (
                    <li key={trip.tripId} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg opacity-80">
                      <div>
                        <p className="font-medium text-sm">{trip.source} to {trip.destination}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            let dateStr = trip.tripDate;
                            if (Array.isArray(trip.tripDate)) {
                              const [y, m, d] = trip.tripDate as any;
                              dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            }
                            let timeStr = trip.departureTime;
                            if (Array.isArray(trip.departureTime)) {
                              const [h, m, s = 0] = trip.departureTime as any;
                              timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                            }
                            return `${new Date(dateStr).toLocaleDateString()} at ${timeStr}`;
                          })()}
                          <span className="ml-2 inline-block px-2 py-0.5 rounded text-[10px] bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {isCreator ? 'Created' : 'Joined'}
                          </span>
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(`/rideshare/trip/${trip.tripId}`)}
                        className="text-accent text-sm font-medium hover:underline"
                      >
                        {isCreator ? 'Manage / View Chat' : 'View Chat'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
