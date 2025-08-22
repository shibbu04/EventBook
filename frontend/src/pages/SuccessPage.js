"use client"

import { useEffect, useState } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Confetti from "react-confetti"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle, Download, Calendar, MapPin, Ticket, Share2, ArrowRight, Home } from "lucide-react"
import { formatCurrency, formatDate } from "../utils/api"
import toast from "react-hot-toast"

const SuccessPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const booking = location.state?.booking
  const event = location.state?.event

  useEffect(() => {
    if (!booking || !event) {
      toast.error("Booking information not found")
      navigate("/events")
      return
    }

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    // Handle window resize for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", handleResize)
    }
  }, [booking, event, navigate])

  if (!booking || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Booking information not found</h2>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    )
  }

  const downloadQRCode = () => {
    const canvas = document.createElement("canvas")
    const svg = document.querySelector("#qr-code-svg")
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)

      const link = document.createElement("a")
      link.download = `ticket-${booking.id}-qr.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      URL.revokeObjectURL(svgUrl)
      toast.success("QR code downloaded successfully!")
    }
    img.src = svgUrl
  }

  const shareBooking = async () => {
    const shareData = {
      title: `My ticket for ${event.title}`,
      text: `I just booked tickets for ${event.title}! Join me at this amazing event.`,
      url: window.location.origin + `/events/${event.id}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      toast.success("Event link copied to clipboard!")
    }
  }

  const qrCodeData = {
    bookingId: booking.id,
    eventTitle: event.title,
    customerName: booking.name,
    eventDate: event.date,
    location: event.location,
    quantity: booking.quantity,
    totalAmount: booking.total_amount,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black py-8 pt-24 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          colors={["#fbbf24", "#a855f7", "#8b5cf6", "#f59e0b", "#facc15"]}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-purple-900" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">Booking Confirmed! 🎉</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Great news! Your tickets have been successfully booked. We've sent a confirmation email with all the
            details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Booking Details</h2>

            {/* Event Information */}
            <div className="mb-6">
              <img
                src={event.img || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-40 object-cover rounded-lg mb-4 border-2 border-purple-500/30"
              />
              <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
            </div>

            {/* Booking Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <span className="text-gray-300">Booking ID</span>
                <span className="font-semibold text-yellow-400">#{booking.id}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <span className="text-gray-300">Customer Name</span>
                <span className="font-semibold text-white">{booking.name}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <span className="text-gray-300">Email</span>
                <span className="font-semibold text-white">{booking.email}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <span className="text-gray-300">Mobile</span>
                <span className="font-semibold text-white">{booking.mobile}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Event Date</span>
                </div>
                <span className="font-semibold text-white">{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Location</span>
                </div>
                <span className="font-semibold text-white text-right">{event.location}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-purple-500/30">
                <div className="flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Tickets</span>
                </div>
                <span className="font-semibold text-white">
                  {booking.quantity} × {formatCurrency(event.price)}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-lg font-semibold text-white">Total Paid</span>
                <span className="text-lg font-bold text-yellow-400">{formatCurrency(booking.total_amount)}</span>
              </div>
            </div>
          </motion.div>

          {/* QR Code & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-black/40 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">Your Ticket</h2>

            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white rounded-lg shadow-2xl border-2 border-purple-500/50">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={JSON.stringify(qrCodeData)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-300 mt-3">Show this QR code at the event entrance</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadQRCode}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-yellow-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download QR Code</span>
              </button>

              <button
                onClick={shareBooking}
                className="w-full bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-yellow-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Event</span>
              </button>
            </div>

            {/* Important Notes */}
            <div className="mt-6 p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">Important Notes:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Please arrive 30 minutes before the event</li>
                <li>• Bring a valid ID for verification</li>
                <li>• Keep your QR code safe and accessible</li>
                <li>• Check your email for additional instructions</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Navigation Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-yellow-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Book More Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/"
              className="bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-yellow-400 font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Homepage</span>
            </Link>
          </div>

          <p className="text-sm text-gray-300">
            A confirmation email has been sent to <strong className="text-yellow-400">{booking.email}</strong>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SuccessPage
