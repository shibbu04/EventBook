import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  Lock,
  Calendar,
  MapPin,
  Ticket,
  AlertCircle
} from 'lucide-react';
import { eventAPI, bookingAPI, formatCurrency, validateEmail, validatePhone } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seatLockId, setSeatLockId] = useState(null);
  const { socket } = useSocket();
  
  const quantity = location.state?.quantity || 1;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      mobile: '',
      quantity: quantity
    }
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id);
        setEvent(response.data);
        
        // Check if we have enough seats
        if (response.data.available_seats < quantity) {
          toast.error('Not enough seats available');
          navigate(`/events/${id}`);
          return;
        }
      } catch (error) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, quantity, navigate]);

  // Socket event handlers
  useEffect(() => {
    if (socket) {
      const handleSeatsLocked = (data) => {
        setSeatLockId(data.lockId);
      };

      const handleSeatsUnlocked = () => {
        toast.error('Your seat reservation has expired. Please try again.');
        navigate(`/events/${id}`);
      };

      socket.on('seats_locked', handleSeatsLocked);
      socket.on('seats_unlocked', handleSeatsUnlocked);

      return () => {
        socket.off('seats_locked', handleSeatsLocked);
        socket.off('seats_unlocked', handleSeatsUnlocked);
      };
    }
  }, [socket, id, navigate]);

  // Cleanup seat lock on unmount
  useEffect(() => {
    return () => {
      if (socket && seatLockId) {
        socket.emit('release_seats', { lockId: seatLockId });
      }
    };
  }, [socket, seatLockId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      const bookingData = {
        event_id: parseInt(id),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        quantity: quantity
      };

      const response = await bookingAPI.createBooking(bookingData);
      
      // Release seat lock
      if (socket && seatLockId) {
        socket.emit('release_seats', { lockId: seatLockId });
      }

      // Navigate to success page with booking data
      navigate('/success', {
        state: {
          booking: response.data,
          event: event
        }
      });
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Booking failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 dark:bg-gray-600 h-8 w-32 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 dark:bg-gray-600 h-96 rounded-xl"></div>
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
          <button onClick={() => navigate('/events')} className="btn-primary">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = event.price * quantity;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/events/${id}`)}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Event Details</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            You're just one step away from securing your tickets!
          </p>
        </motion.div>

        {/* Seat Lock Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-yellow-800 dark:text-yellow-200 font-medium">
              Your seats are reserved for 10 minutes. Please complete your booking to secure them.
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Booking Information
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        {...register('name', { 
                          required: 'Name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                        className={`input-field pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          validate: (value) => validateEmail(value) || 'Please enter a valid email address'
                        })}
                        className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        {...register('mobile', { 
                          required: 'Mobile number is required',
                          validate: (value) => validatePhone(value) || 'Please enter a valid mobile number'
                        })}
                        className={`input-field pl-10 ${errors.mobile ? 'border-red-500' : ''}`}
                        placeholder="Enter your mobile number"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Payment Information
                </h3>
                
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-gray-900 dark:text-white">Secure Payment</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your payment information is encrypted and secure. This is a demo booking system.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  submitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'btn-primary btn-glow'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Complete Booking</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg h-fit sticky top-24"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Order Summary
            </h2>

            {/* Event Details */}
            <div className="mb-6">
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {event.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Ticket Price
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(event.price)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Quantity
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-dark-600 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Ticket className="w-4 h-4" />
                  <span>Instant Delivery</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
