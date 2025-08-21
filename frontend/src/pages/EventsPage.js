import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, MapPin, Users, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { eventAPI, formatDate, formatCurrency, debounce } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { socket } = useSocket();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (search, location, date) => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (location) params.location = location;
        if (date) params.date = date;

        const response = await eventAPI.getEvents(params);
        setEvents(response.data);
      } catch (error) {
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm, locationFilter, dateFilter);
  }, [searchTerm, locationFilter, dateFilter, debouncedSearch]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleSeatAvailabilityChanged = (data) => {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === data.eventId
              ? { ...event, available_seats: Math.max(0, event.available_seats) }
              : event
          )
        );
      };

      const handleNewEvent = (newEvent) => {
        setEvents(prevEvents => [newEvent, ...prevEvents]);
        toast.success('New event added!');
      };

      const handleEventUpdated = (updatedEvent) => {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
      };

      const handleEventDeleted = (data) => {
        setEvents(prevEvents =>
          prevEvents.filter(event => event.id !== data.id)
        );
      };

      socket.on('seat_availability_changed', handleSeatAvailabilityChanged);
      socket.on('new_event', handleNewEvent);
      socket.on('event_updated', handleEventUpdated);
      socket.on('event_deleted', handleEventDeleted);

      return () => {
        socket.off('seat_availability_changed', handleSeatAvailabilityChanged);
        socket.off('new_event', handleNewEvent);
        socket.off('event_updated', handleEventUpdated);
        socket.off('event_deleted', handleEventDeleted);
      };
    }
  }, [socket]);

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setDateFilter('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the perfect event for you. Filter by location, date, or search for specific interests.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
            
            {(searchTerm || locationFilter || dateFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          <motion.div
            initial={false}
            animate={showFilters ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-dark-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input-field pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-1/2"></div>
                  <div className="bg-gray-300 dark:bg-gray-600 h-4 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No events found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search criteria or clear the filters to see more events.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="card overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white dark:bg-dark-800 px-3 py-1 rounded-full text-sm font-semibold text-primary-600">
                    {formatCurrency(event.price)}
                  </div>
                  {event.available_seats < 10 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Few seats left!
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{event.available_seats} seats available</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${
                        event.available_seats > 50 
                          ? 'bg-green-500' 
                          : event.available_seats > 10 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {event.available_seats > 50 
                          ? 'Available' 
                          : event.available_seats > 10 
                          ? 'Filling Fast' 
                          : 'Almost Full'
                        }
                      </span>
                    </div>
                    
                    <Link
                      to={`/events/${event.id}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium flex items-center space-x-1 group"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Summary */}
        {!loading && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12 p-6 bg-white dark:bg-dark-800 rounded-xl shadow-lg"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Showing {events.length} event{events.length !== 1 ? 's' : ''}
              {(searchTerm || locationFilter || dateFilter) && ' matching your criteria'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
