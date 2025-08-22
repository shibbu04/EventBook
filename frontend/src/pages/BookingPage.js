"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { ArrowLeft, CreditCard, User, Mail, Phone, Lock, Calendar, MapPin, Ticket, AlertCircle } from "lucide-react"
import { eventAPI, bookingAPI, formatCurrency, validateEmail, validatePhone } from "../utils/api"
import { useSocket } from "../context/SocketContext"
import toast from "react-hot-toast"

const BookingPage = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [seatLockId, setSeatLockId] = useState(null)
  const { socket } = useSocket()

  const quantity = location.state?.quantity || 1

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      quantity: quantity,
    },
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id)
        setEvent(response.data)

        // Check if we have enough seats
        if (response.data.available_seats < quantity) {
          toast.error("Not enough seats available")
          navigate(`/events/${id}`)
          return
        }
      } catch (error) {
        toast.error("Event not found")
        navigate("/events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id, quantity, navigate])

  // Socket event handlers
  useEffect(() => {
    if (socket) {
      const handleSeatsLocked = (data) => {
        setSeatLockId(data.lockId)
      }

      const handleSeatsUnlocked = () => {
        toast.error("Your seat reservation has expired. Please try again.")
        navigate(`/events/${id}`)
      }

      socket.on("seats_locked", handleSeatsLocked)
      socket.on("seats_unlocked", handleSeatsUnlocked)

      return () => {
        socket.off("seats_locked", handleSeatsLocked)
        socket.off("seats_unlocked", handleSeatsUnlocked)
      }
    }
  }, [socket, id, navigate])

  // Cleanup seat lock on unmount
  useEffect(() => {
    return () => {
      if (socket && seatLockId) {
        socket.emit("release_seats", { lockId: seatLockId })
      }
    }
  }, [socket, seatLockId])

  // Prevent automatic scrolling on form interactions
  useEffect(() => {
    // Disable smooth scrolling to prevent automatic scroll to bottom
    const originalScrollBehavior = document.documentElement.style.scrollBehavior
    document.documentElement.style.scrollBehavior = "auto"

    return () => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior
    }
  }, [])

  const onSubmit = async (data) => {
    setSubmitting(true)

    try {
      const bookingData = {
        event_id: Number.parseInt(id),
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        quantity: quantity,
      }

      const response = await bookingAPI.createBooking(bookingData)

      // Release seat lock
      if (socket && seatLockId) {
        socket.emit("release_seats", { lockId: seatLockId })
      }

      // Navigate to success page with booking data
      navigate("/success", {
        state: {
          booking: response.data,
          event: event,
        },
      })
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Booking failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black py-8 pt-24">
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
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center py-8 pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event not found</h2>
          <button
            onClick={() => navigate("/events")}
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 py-4 px-6 rounded-lg font-semibold transition-all duration-300"
          >
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  const totalAmount = event.price * quantity

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black py-8 pt-24">
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
            className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Event Details</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Complete Your Booking</h1>
          <p className="text-gray-300 mt-2">You're just one step away from securing your tickets!</p>
        </motion.div>

        {/* Seat Lock Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-lg p-4 mb-8"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-200 font-medium">
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
            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Booking Information</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Personal Information</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input
                        type="text"
                        {...register("name", {
                          required: "Name is required",
                          minLength: { value: 2, message: "Name must be at least 2 characters" },
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-black/30 border ${
                          errors.name ? "border-red-500" : "border-purple-500/30"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          validate: (value) => validateEmail(value) || "Please enter a valid email address",
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-black/30 border ${
                          errors.email ? "border-red-500" : "border-purple-500/30"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input
                        type="tel"
                        {...register("mobile", {
                          required: "Mobile number is required",
                          validate: (value) => validatePhone(value) || "Please enter a valid mobile number",
                        })}
                        className={`w-full pl-10 pr-4 py-3 bg-black/30 border ${
                          errors.mobile ? "border-red-500" : "border-purple-500/30"
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                        placeholder="Enter your mobile number"
                      />
                    </div>
                    {errors.mobile && <p className="text-red-400 text-sm mt-1">{errors.mobile.message}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Payment Information</h3>

                <div className="bg-purple-500/10 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-white">Secure Payment</span>
                  </div>
                  <p className="text-sm text-gray-300">
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
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-yellow-400 text-black hover:from-yellow-400 hover:to-yellow-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
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
            className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-2xl h-fit sticky top-24"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

            {/* Event Details */}
            <div className="mb-6">
              <img
                src={event.img || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-32 object-cover rounded-lg mb-4 border border-purple-500/30"
              />

              <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>

              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Ticket Price</span>
                <span className="font-medium text-white">{formatCurrency(event.price)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-300">Quantity</span>
                <span className="font-medium text-white">{quantity}</span>
              </div>

              <div className="border-t border-purple-500/30 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-white">Total Amount</span>
                  <span className="text-lg font-bold text-yellow-400">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t border-purple-500/30 pt-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-1">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Instant Delivery</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
