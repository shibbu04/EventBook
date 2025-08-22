"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Clock, ArrowLeft, Ticket, Star, Share2, Heart, ExternalLink } from "lucide-react"
import { eventAPI, formatDate, formatCurrency, formatTime } from "../utils/api"
import { useSocket } from "../context/SocketContext"
import LoginModal from "../components/LoginModal"
import toast from "react-hot-toast"

const EventDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [user, setUser] = useState(null)
  const { socket, lockSeats } = useSocket()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
  }, [])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventAPI.getEvent(id)
        setEvent(response.data)

        // Check if event is favorited
        const favorites = JSON.parse(localStorage.getItem("favoriteEvents") || "[]")
        setIsFavorited(favorites.includes(Number.parseInt(id)))
      } catch (error) {
        toast.error("Event not found")
        navigate("/events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id, navigate])

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket && event) {
      const handleSeatAvailabilityChanged = (data) => {
        if (data.eventId === event.id) {
          setEvent((prevEvent) => ({
            ...prevEvent,
            available_seats: Math.max(0, prevEvent.available_seats),
          }))
        }
      }

      const handleEventUpdated = (updatedEvent) => {
        if (updatedEvent.id === event.id) {
          setEvent(updatedEvent)
        }
      }

      socket.on("seat_availability_changed", handleSeatAvailabilityChanged)
      socket.on("event_updated", handleEventUpdated)

      return () => {
        socket.off("seat_availability_changed", handleSeatAvailabilityChanged)
        socket.off("event_updated", handleEventUpdated)
      }
    }
  }, [socket, event])

  const handleBookNow = () => {
    // Check if user is logged in
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (event.available_seats < ticketQuantity) {
      toast.error("Not enough seats available")
      return
    }

    // Lock seats for booking process
    lockSeats(event.id, ticketQuantity)

    // Navigate to booking page
    navigate(`/booking/${event.id}`, {
      state: { quantity: ticketQuantity },
    })
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteEvents") || "[]")
    const eventId = Number.parseInt(id)

    if (isFavorited) {
      const updatedFavorites = favorites.filter((fav) => fav !== eventId)
      localStorage.setItem("favoriteEvents", JSON.stringify(updatedFavorites))
      toast.success("Removed from favorites")
    } else {
      favorites.push(eventId)
      localStorage.setItem("favoriteEvents", JSON.stringify(favorites))
      toast.success("Added to favorites")
    }

    setIsFavorited(!isFavorited)
  }

  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const openGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(event.location)
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
    window.open(url, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black pt-24 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-purple-300/20 h-8 w-32 rounded mb-8"></div>
            <div className="bg-purple-300/20 h-96 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-purple-300/20 h-8 w-3/4 rounded"></div>
                <div className="bg-purple-300/20 h-32 rounded"></div>
              </div>
              <div className="bg-purple-300/20 h-96 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Event not found</h2>
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
          >
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  const isEventPast = new Date(event.date) < new Date()
  const isEventSoldOut = event.available_seats === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black pt-24 py-8">
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
            className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200 font-medium"
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
          className="relative overflow-hidden rounded-2xl mb-8 h-96 bg-gray-800 shadow-2xl"
        >
          <img src={event.img || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-full backdrop-blur-lg transition-all duration-200 transform hover:scale-110 ${
                isFavorited
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={shareEvent}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-lg transition-all duration-200 transform hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-6 right-6 bg-yellow-400 text-black px-6 py-3 rounded-full shadow-lg">
            <span className="text-2xl font-bold">{formatCurrency(event.price)}</span>
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">{event.title}</h1>

              {/* Event Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{formatTime(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{event.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{event.available_seats} seats available</span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3 mb-8">
                {isEventPast && (
                  <span className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-full text-sm font-medium backdrop-blur-sm">
                    Event Ended
                  </span>
                )}
                {isEventSoldOut && !isEventPast && (
                  <span className="px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-medium backdrop-blur-sm border border-red-500/30">
                    Sold Out
                  </span>
                )}
                {event.available_seats < 10 && !isEventSoldOut && !isEventPast && (
                  <span className="px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-full text-sm font-medium backdrop-blur-sm border border-yellow-400/30">
                    Few Seats Left
                  </span>
                )}
                {event.available_seats >= 10 && !isEventPast && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium backdrop-blur-sm border border-green-500/30">
                    Available
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6 mb-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                <p className="text-gray-300 leading-relaxed">{event.description}</p>
              </div>

              {/* Location Map */}
              <div className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Event Location</h2>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-300">{event.location}</p>
                  <button
                    onClick={openGoogleMaps}
                    className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Embedded Map Placeholder */}
                <div className="bg-gray-800/50 rounded-lg h-64 flex items-center justify-center border border-purple-500/10">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                    <p className="text-gray-400">Click "View on Maps" to see the exact location</p>
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
              className="sticky top-32"
            >
              <div className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-xl p-6 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">Book Your Tickets</h3>

                {/* Ticket Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Tickets</label>
                  <select
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(Number.parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                    disabled={isEventPast || isEventSoldOut}
                  >
                    {[...Array(Math.min(10, event.available_seats))].map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">
                        {i + 1} Ticket{i > 0 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-500/20">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ticket Price × {ticketQuantity}</span>
                    <span className="font-medium text-white">{formatCurrency(event.price * ticketQuantity)}</span>
                  </div>
                  <div className="border-t border-purple-500/20 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-lg font-bold text-yellow-400">
                        {formatCurrency(event.price * ticketQuantity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookNow}
                  disabled={isEventPast || isEventSoldOut}
                  className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                    isEventPast || isEventSoldOut
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-300 hover:scale-105 shadow-lg shadow-yellow-400/25"
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>{isEventPast ? "Event Ended" : isEventSoldOut ? "Sold Out" : "Book Now"}</span>
                </button>

                {/* Availability Info */}
                <div className="mt-4 text-center">
                  {!isEventPast && !isEventSoldOut && (
                    <p className="text-sm text-gray-400">
                      {event.available_seats} seat{event.available_seats !== 1 ? "s" : ""} remaining
                    </p>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-purple-500/20">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        eventTitle={event?.title || "this event"}
      />
    </div>
  )
}

export default EventDetailsPage
