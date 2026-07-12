import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTrips, getJoinedTrips } from '../services/api';
import type { Trip } from '../services/api';
import { getUser } from '../services/auth';
import { GlowingEffect } from '../components/ui/glowing-effect';

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
        <Link to="/rideshare/discover" className="rounded-lg bg-accent px-4 py-2 font-semibold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 shadow-sm dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300">
          Discover Trips
        </Link>
        <Link to="/rideshare/create" className="rounded-lg border border-accent text-accent px-4 py-2 font-semibold transition-all duration-150 hover:bg-accent/10 active:scale-95 dark:border-darkAccent dark:text-darkAccent dark:hover:bg-darkAccent/10">
          Create a Trip
        </Link>
      </div>
      
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="group relative rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm transition hover:-translate-y-0.5">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <h2 className="relative z-10 text-xl font-semibold mb-4 border-b border-border pb-2">My Trips</h2>
            {activeMyTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No active trips created.</p>
            ) : (
              <ul className="relative z-10 space-y-3">
                {activeMyTrips.map(trip => (
                  <li key={trip.tripId} className="flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm">
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
                      className="relative z-20 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
                    >
                      Manage
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="group relative rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm transition hover:-translate-y-0.5">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <h2 className="relative z-10 text-xl font-semibold mb-4 border-b border-border pb-2">Joined Trips</h2>
            {activeJoinedTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No active joined trips.</p>
            ) : (
              <ul className="relative z-10 space-y-3">
                {activeJoinedTrips.map(trip => (
                  <li key={trip.tripId} className="flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-lg backdrop-blur-sm">
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
                      className="relative z-20 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-emerald-800 active:scale-95 dark:bg-darkAccent dark:text-darkSurface dark:hover:bg-emerald-300"
                    >
                      Open Chat
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ride History Section taking full width if possible, or just another cell */}
          <div className="group relative md:col-span-2 rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm mt-4 transition hover:-translate-y-0.5">
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <h2 className="relative z-10 text-xl font-semibold mb-4 border-b border-border pb-2">Ride History</h2>
            {expiredTrips.length === 0 ? (
              <p className="text-text dark:text-darkText text-sm">No past rides.</p>
            ) : (
              <ul className="relative z-10 space-y-3">
                {expiredTrips.map(trip => {
                  const isCreator = user && trip.createdBy === user.id;
                  return (
                    <li key={trip.tripId} className="flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-lg opacity-80 backdrop-blur-sm">
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
                        className="relative z-20 rounded-lg bg-surfaceSecondary px-3 py-1.5 text-sm font-semibold text-textHeading transition-all duration-150 hover:bg-gray-300 active:scale-95 dark:bg-darkAccentSoft dark:text-white dark:hover:bg-gray-700"
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
