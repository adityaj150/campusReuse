import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, getJoinedTrips, joinTrip } from '../services/api';
import type { Trip } from '../services/api';
import { getUser } from '../services/auth';

export default function DiscoverTrips() {
  const navigate = useNavigate();
  const user = getUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const allTrips = await getTrips();
      
      const now = new Date();
      // Filter out trips that have already departed
      const upcomingTrips = allTrips.filter(t => {
        const departureTime = new Date(`${t.tripDate}T${t.departureTime}`);
        return departureTime > now;
      });

      if (user) {
        const joinedTrips = await getJoinedTrips(user.id);
        const joinedTripIds = new Set(joinedTrips.map(t => t.tripId));
        // Filter out trips the user has already joined
        const discoverableTrips = upcomingTrips.filter(t => !joinedTripIds.has(t.tripId));
        setTrips(discoverableTrips);
      } else {
        setTrips(upcomingTrips);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (trip: Trip) => {
    if (!user) {
      alert('Please login first');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Do you want to join this trip?\n\n` +
      `📍 ${trip.source} ➔ ${trip.destination}\n` +
      `📅 ${trip.tripDate} at ${trip.departureTime}\n` +
      `🚗 ${trip.transportType}\n` +
      `👥 ${trip.currentMembers}/${trip.maxMembers} members\n\n` +
      `Remaining spots: ${trip.maxMembers - trip.currentMembers}`
    );

    if (!confirmed) return;

    try {
      setJoiningId(trip.tripId);
      await joinTrip(trip.tripId, user.id);
      // Navigate to the chat for this trip
      navigate(`/rideshare/trip/${trip.tripId}`);
    } catch (err: any) {
      if (err.message === 'You have already joined this trip') {
        // If they already joined, just let them in!
        navigate(`/rideshare/trip/${trip.tripId}`);
      } else {
        alert(err.message || 'Failed to join trip');
      }
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-textHeading dark:text-darkText">Discover Trips</h1>
      <p className="text-text dark:text-darkText">Browse available rides and join a trip.</p>
      
      {loading && <p className="text-text dark:text-darkText">Loading trips...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && trips.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text dark:text-darkText text-lg">No trips available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Be the first to create one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trips.map((trip) => {
          const spotsLeft = trip.maxMembers - trip.currentMembers;
          const isFull = trip.status === 'FULL' || spotsLeft <= 0;
          const isOwner = user && trip.createdBy === user.id;

          return (
            <div key={trip.tripId} className="rounded-xl border border-border p-6 dark:border-darkBorder bg-surface dark:bg-darkSurface shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-textHeading dark:text-white">
                      {trip.source} ➔ {trip.destination}
                    </h3>
                    <p className="text-sm text-text dark:text-darkText mt-1">
                      {trip.tripDate} • {trip.departureTime}
                    </p>
                  </div>
                  <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs font-medium">
                    {trip.transportType}
                  </span>
                </div>
                {trip.notes && (
                  <p className="text-sm text-text mt-3 italic dark:text-darkText">"{trip.notes}"</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div>
                  <span className="text-sm text-text dark:text-darkText">
                    {trip.currentMembers} / {trip.maxMembers} Members
                  </span>
                  {!isFull && (
                    <span className="text-xs text-green-500 ml-2">
                      ({spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left)
                    </span>
                  )}
                </div>
                {isOwner ? (
                  <button
                    onClick={() => navigate(`/rideshare/trip/${trip.tripId}`)}
                    className="bg-accent/10 text-accent px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent/20 transition"
                  >
                    Open Chat
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(trip)}
                    disabled={isFull || joiningId === trip.tripId}
                    className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joiningId === trip.tripId ? 'Joining...' : isFull ? 'Full' : 'Join Trip'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
