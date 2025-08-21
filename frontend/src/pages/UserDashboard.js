import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  Filter,
  Clock,
  Ticket,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, formatCurrency, formatDate } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [user, setUser] = useState(null);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    // Redirect admin users to admin panel
    if (parsedUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    setUser(parsedUser);
    fetchEvents();
  }, [navigate]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleNewEvent = (newEvent) => {
        setEvents(prev => [newEvent, ...prev]);
        toast.success('New event added!');
      };

      const handleEventUpdated = (updatedEvent) => {
        setEvents(prev =>
          prev.map(event =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
      };

      const handleEventDeleted = (data) => {
        setEvents(prev => prev.filter(event => event.id !== data.id));
      };

      socket.on('new_event', handleNewEvent);
      socket.on('event_updated', handleEventUpdated);
      socket.on('event_deleted', handleEventDeleted);

      return () => {
        socket.off('new_event', handleNewEvent);
        socket.off('event_updated', handleEventUpdated);
        socket.off('event_deleted', handleEventDeleted);
      };
    }
  }, [socket]);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getEvents({ limit: 100 });
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const locations = [...new Set(events.map(event => event.location))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8"
        >
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Discover amazing events happening around you
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3 bg-white dark:bg-dark-800 rounded-lg px-4 py-2 shadow-md w-full sm:w-auto">
              <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="input-field pl-10 min-w-[200px]"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-dark-800 rounded-xl p-8 shadow-lg">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || locationFilter ? 'Try adjusting your search criteria' : 'No events available at the moment'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleEventClick(event.id)}
                >
                  {/* Event Image */}
                  <div className="relative">
                    <img
                      src={event.img}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {formatCurrency(event.price)}
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.available_seats} / {event.total_seats} seats available</span>
                      </div>
                    </div>

                    {/* Availability Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Availability</span>
                        <span>{Math.round((event.available_seats / event.total_seats) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(event.available_seats / event.total_seats) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event.id);
                      }}
                      disabled={event.available_seats === 0}
                      className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                        event.available_seats === 0
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>
                        {event.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
