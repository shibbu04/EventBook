import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Ticket, 
  Star,
  Share2,
  Heart,
  ExternalLink
} from 'lucide-react';
import { eventAPI, formatDate, formatCurrency, formatTime } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const { socket, lockSeats } = useSocket();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id);
        setEvent(response.data);
        
        // Check if event is favorited
        const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
        setIsFavorited(favorites.includes(parseInt(id)));
      } catch (error) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && event) {
      const handleSeatAvailabilityChanged = (data) => {
        if (data.eventId === event.id) {
          setEvent(prevEvent => ({
            ...prevEvent,
            available_seats: Math.max(0, prevEvent.available_seats)
          }));
        }
      };

      const handleEventUpdated = (updatedEvent) => {
        if (updatedEvent.id === event.id) {
          setEvent(updatedEvent);
        }
      };

      socket.on('seat_availability_changed', handleSeatAvailabilityChanged);
      socket.on('event_updated', handleEventUpdated);

      return () => {
        socket.off('seat_availability_changed', handleSeatAvailabilityChanged);
        socket.off('event_updated', handleEventUpdated);
      };
    }
  }, [socket, event]);

  const handleBookNow = () => {
    if (event.available_seats < ticketQuantity) {
      toast.error('Not enough seats available');
      return;
    }

    // Lock seats for booking process
    lockSeats(event.id, ticketQuantity);
    
    // Navigate to booking page
    navigate(`/booking/${event.id}`, {
      state: { quantity: ticketQuantity }
    });
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteEvents') || '[]');
    const eventId = parseInt(id);
    
    if (isFavorited) {
      const updatedFavorites = favorites.filter(fav => fav !== eventId);
      localStorage.setItem('favoriteEvents', JSON.stringify(updatedFavorites));
      toast.success('Removed from favorites');
    } else {
      favorites.push(eventId);
      localStorage.setItem('favoriteEvents', JSON.stringify(favorites));
      toast.success('Added to favorites');
    }
    
    setIsFavorited(!isFavorited);
  };

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const openGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(event.location);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded mb-8"></div>
            <div className="bg-gray-300 dark:bg-gray-600 h-96 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-300 dark:bg-gray-600 h-8 w-3/4 rounded"></div>
                <div className="bg-gray-300 dark:bg-gray-600 h-32 rounded"></div>
              </div>
              <div className="bg-gray-300 dark:bg-gray-600 h-96 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event not found</h2>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const isEventPast = new Date(event.date) < new Date();
  const isEventSoldOut = event.available_seats === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/events"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Events</span>
          </Link>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl mb-8 h-96 bg-gray-200 dark:bg-gray-700"
        >
          <img
            src={event.img}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-full backdrop-blur-lg transition-all duration-200 ${
                isFavorited 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={shareEvent}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-lg transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-6 right-6 bg-white dark:bg-dark-800 px-4 py-2 rounded-full">
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(event.price)}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {event.title}
              </h1>

              {/* Event Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{formatTime(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{event.available_seats} seats available</span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3 mb-8">
                {isEventPast && (
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                    Event Ended
                  </span>
                )}
                {isEventSoldOut && !isEventPast && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    Sold Out
                  </span>
                )}
                {event.available_seats < 10 && !isEventSoldOut && !isEventPast && (
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium">
                    Few Seats Left
                  </span>
                )}
                {event.available_seats >= 10 && !isEventPast && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                    Available
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  About This Event
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Location Map */}
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Event Location
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    {event.location}
                  </p>
                  <button
                    onClick={openGoogleMaps}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Embedded Map Placeholder */}
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Click "View on Maps" to see the exact location
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-24"
            >
              <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Book Your Tickets
                </h3>

                {/* Ticket Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Tickets
                  </label>
                  <select
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
                    className="input-field"
                    disabled={isEventPast || isEventSoldOut}
                  >
                    {[...Array(Math.min(10, event.available_seats))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Ticket{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Ticket Price × {ticketQuantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(event.price * ticketQuantity)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-dark-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(event.price * ticketQuantity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookNow}
                  disabled={isEventPast || isEventSoldOut}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    isEventPast || isEventSoldOut
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'btn-primary btn-glow'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>
                    {isEventPast 
                      ? 'Event Ended' 
                      : isEventSoldOut 
                      ? 'Sold Out' 
                      : 'Book Now'
                    }
                  </span>
                </button>

                {/* Availability Info */}
                <div className="mt-4 text-center">
                  {!isEventPast && !isEventSoldOut && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.available_seats} seat{event.available_seats !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>Secure Booking</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Ticket className="w-4 h-4" />
                      <span>Instant Tickets</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
