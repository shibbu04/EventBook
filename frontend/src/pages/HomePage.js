"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, MapPin, Users, Star, ArrowRight, Ticket, Phone, Mail } from "lucide-react"
import { eventAPI, formatDate, formatCurrency } from "../utils/api"
import toast from "react-hot-toast"

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 24,
    hours: 13,
    minutes: 43,
    seconds: 18,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await eventAPI.getEvents({ limit: 6 })
        setFeaturedEvents(response.data)
      } catch (error) {
        toast.error("Failed to load featured events")
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book tickets for your favorite events in just a few clicks",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with like-minded people and build lasting memories",
    },
    {
      icon: Star,
      title: "Premium Events",
      description: "Curated selection of the best events in your area",
    },
  ]

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "500+", label: "Events Hosted" },
    { number: "50+", label: "Cities Covered" },
    { number: "99%", label: "Satisfaction Rate" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        {/* Contact Info Header */}
        <div className="absolute top-6 left-6 z-20 text-white/80 text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>(+91) 7878787878</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4" />
            <span>eventbook@gmail.com</span>
          </div>
        </div>

        {/* Buy Ticket Button - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-6 right-6 z-30"
        >
          <Link
            to="/events"
            className="bg-white text-purple-700 px-6 py-3 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            <Ticket className="w-5 h-5" />
            <span>Buy Ticket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-20 left-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl md:text-8xl font-bold text-yellow-400 mb-8 leading-tight">
              Code. Connect. <span className="text-yellow-300">Create.</span>
              <br />
              <span className="text-white">One Epic</span>{" "}
              <span className="relative text-yellow-400">
                Conference
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 1 }}
                  className="absolute bottom-2 left-0 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                />
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Discover amazing events, connect with incredible people, and create unforgettable memories. Your next
            adventure is just a click away.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <Link
              to="/events"
              className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg"
            >
              <Ticket className="w-6 h-6" />
              <span>Browse Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3 bg-yellow-400 text-purple-900 px-6 py-3 rounded-full font-semibold">
              <MapPin className="w-5 h-5" />
              <span>Delaware, USA</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section with Countdown */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-white mb-8">About</h2>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-5xl leading-relaxed">
              EventBook 2025 is an immersive, IT Conference over the course of three days,{" "}
              <span className="text-purple-400 font-semibold">August 13-15</span>. Our mission, the challenges, A
              person's success is measured by the way they approach it and how they approach it.
            </p>

            {/* Countdown Timer */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-900 rounded-2xl p-6 min-w-[120px] text-center border border-gray-800"
                >
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-gray-400 font-medium uppercase tracking-wide text-sm">{item.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/events"
                className="bg-white text-black px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300 shadow-lg text-lg mx-auto"
              >
                <Ticket className="w-6 h-6" />
                <span>Buy Ticket</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose EventBook?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-2xl mx-auto">
              We make event discovery and booking seamless, so you can focus on what matters most - enjoying amazing
              experiences.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="bg-gray-800 rounded-2xl p-8 text-center group hover:bg-purple-900/50 transition-all duration-300 border border-gray-700"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-6">Featured Events</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Discover the most popular and exciting events happening near you.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 animate-pulse border border-gray-700">
                  <div className="bg-gray-600 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-600 h-4 rounded mb-2"></div>
                  <div className="bg-gray-600 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className="bg-gray-800 rounded-2xl overflow-hidden group hover:bg-gray-700 transition-all duration-300 border border-gray-700"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.img || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-sm font-semibold">
                      {formatCurrency(event.price)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{event.title}</h3>

                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{event.available_seats} seats left</span>
                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center space-x-1 group"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/events"
              className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-all duration-300 shadow-lg mx-auto"
            >
              <span>View All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-purple-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Create Amazing Memories?</h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of event-goers who trust EventBook for their entertainment needs. Start your journey today!
            </p>
            <Link
              to="/events"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg mx-auto text-lg"
            >
              <Calendar className="w-6 h-6" />
              <span>Start Exploring Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
