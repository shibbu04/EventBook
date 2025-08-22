"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Search,
  X,
  LogOut,
  UserX,
  Mail,
  Phone,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { eventAPI, adminAPI, formatCurrency, formatDate } from "../utils/api"
import { useSocket } from "../context/SocketContext"
import toast from "react-hot-toast"

const AdminDashboard = () => {
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("events") // 'events' or 'users'
  const [user, setUser] = useState(null)
  const { socket } = useSocket()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (!token || !userData) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      navigate("/dashboard")
      return
    }

    setUser(parsedUser)
    fetchEvents()
    fetchUsers()
  }, [navigate])

  // Socket listeners for real-time updates
  useEffect(() => {
    if (socket) {
      const handleNewEvent = (newEvent) => {
        setEvents((prev) => [newEvent, ...prev])
      }

      const handleEventUpdated = (updatedEvent) => {
        setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
      }

      const handleEventDeleted = (data) => {
        setEvents((prev) => prev.filter((event) => event.id !== data.id))
      }

      socket.on("new_event", handleNewEvent)
      socket.on("event_updated", handleEventUpdated)
      socket.on("event_deleted", handleEventDeleted)

      return () => {
        socket.off("new_event", handleNewEvent)
        socket.off("event_updated", handleEventUpdated)
        socket.off("event_deleted", handleEventDeleted)
      }
    }
  }, [socket])

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getEvents({ limit: 100 })
      setEvents(response.data)
    } catch (error) {
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      // Backend returns { users: [...], pagination: {...} }
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Failed to load users")
      setUsers([]) // Set empty array as fallback
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    toast.success("Logged out successfully")
    navigate("/")
  }

  const openModal = (event = null) => {
    setEditingEvent(event)
    setShowModal(true)

    if (event) {
      // Format date for input
      const date = new Date(event.date)
      const formattedDate = date.toISOString().slice(0, 16)

      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        date: formattedDate,
        total_seats: event.total_seats,
        price: event.price,
        img: event.img,
      })
    } else {
      reset({
        title: "",
        description: "",
        location: "",
        date: "",
        total_seats: "",
        price: "",
        img: "",
      })
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
    reset()
  }

  const onSubmit = async (data) => {
    try {
      const eventData = {
        ...data,
        total_seats: Number.parseInt(data.total_seats),
        price: Number.parseFloat(data.price),
      }

      if (editingEvent) {
        await eventAPI.updateEvent(editingEvent.id, eventData)
        toast.success("Event updated successfully!")
      } else {
        await eventAPI.createEvent(eventData)
        toast.success("Event created successfully!")
      }

      closeModal()
      fetchEvents()
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Operation failed"
      toast.error(errorMessage)
    }
  }

  const deleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventAPI.deleteEvent(id)
        toast.success("Event deleted successfully!")
        fetchEvents()
      } catch (error) {
        toast.error("Failed to delete event")
      }
    }
  }

  const deleteUser = async (id, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        await adminAPI.deleteUser(id)
        toast.success("User deleted successfully!")
        fetchUsers()
      } catch (error) {
        const errorMessage = error.response?.data?.error || "Failed to delete user"
        toast.error(errorMessage)
      }
    }
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const stats = {
    totalEvents: events.length,
    totalBookings: events.reduce((sum, event) => sum + (event.total_seats - event.available_seats), 0),
    totalRevenue: events.reduce((sum, event) => sum + event.price * (event.total_seats - event.available_seats), 0),
    totalUsers: Array.isArray(users) ? users.filter((user) => user.role === "user").length : 0,
    averageOccupancy:
      events.length > 0
        ? Math.round(
            events.reduce(
              (sum, event) => sum + ((event.total_seats - event.available_seats) / event.total_seats) * 100,
              0,
            ) / events.length,
          )
        : 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black pt-24 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-yellow-300/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-8"
        >
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-purple-200">Manage your events and track bookings</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-lg px-4 py-2 shadow-lg w-full sm:w-auto">
              <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 animate-pulse"></div>
              <span className="text-sm font-medium text-white truncate">Admin: {user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg w-full sm:w-auto backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-400/20 backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Events</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-400/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-400/20 backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-400/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-200">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl shadow-lg mb-8"
        >
          <div className="border-b border-purple-300/20">
            <nav className="-mb-px flex flex-col sm:flex-row">
              <button
                onClick={() => setActiveTab("events")}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 flex-1 text-center ${
                  activeTab === "events"
                    ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                    : "border-transparent text-purple-200 hover:text-white hover:bg-white/5"
                }`}
              >
                Events Management
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 flex-1 text-center ${
                  activeTab === "users"
                    ? "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                    : "border-transparent text-purple-200 hover:text-white hover:bg-white/5"
                }`}
              >
                User Management
              </button>
            </nav>
          </div>
        </motion.div>

        {/* Controls */}
        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="relative flex-1 max-w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openModal()}
                className="flex items-center justify-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Event</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
              <div className="relative flex-1 max-w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-purple-300/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Table */}
        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl shadow-lg overflow-hidden"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-300/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-purple-200">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
                <p className="text-purple-200 mb-4">
                  {searchTerm ? "Try adjusting your search criteria" : "Get started by creating your first event"}
                </p>
                {!searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal()}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg transition-all duration-300 font-medium"
                  >
                    Create Event
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-900/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Date & Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-300/20">
                    {filteredEvents.map((event) => (
                      <motion.tr
                        key={event.id}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={event.img || "/placeholder.svg"}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover mr-4 border border-purple-300/20"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">{event.title}</p>
                              <p className="text-sm text-purple-200 line-clamp-1">{event.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            <div className="flex items-center space-x-1 mb-1">
                              <Calendar className="w-4 h-4 text-purple-300" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-purple-300" />
                              <span className="text-purple-200">{event.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <span className="text-white font-medium">{event.available_seats}</span>
                            <span className="text-purple-200">/{event.total_seats}</span>
                          </div>
                          <div className="w-full bg-purple-800/50 rounded-full h-2 mt-1">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${((event.total_seats - event.available_seats) / event.total_seats) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{formatCurrency(event.price)}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openModal(event)}
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-all duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteEvent(event.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Table */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl shadow-lg overflow-hidden"
          >
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                <p className="text-purple-200">
                  {searchTerm ? "Try adjusting your search criteria" : "No users registered yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-900/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-300/20">
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center mr-3 border border-yellow-400/30">
                              <span className="text-yellow-400 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-purple-200">
                            <Mail className="w-4 h-4 mr-2 text-purple-300" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-purple-200">
                            <Phone className="w-4 h-4 mr-2 text-purple-300" />
                            <span>{user.mobile || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === "admin"
                                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                                : "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-purple-200">{formatDate(user.created_at)}</td>
                        <td className="px-6 py-4">
                          {user.role !== "admin" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteUser(user.id, user.name)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                              title="Delete User"
                            >
                              <UserX className="w-4 h-4" />
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/10 backdrop-blur-md border border-purple-300/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-purple-300" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Event Title *</label>
                  <input
                    type="text"
                    {...register("title", { required: "Title is required" })}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.title ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                    placeholder="Enter event title"
                  />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Description *</label>
                  <textarea
                    {...register("description", { required: "Description is required" })}
                    rows={4}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.description ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300 resize-none`}
                    placeholder="Enter event description"
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Location *</label>
                    <input
                      type="text"
                      {...register("location", { required: "Location is required" })}
                      className={`w-full px-4 py-3 bg-white/10 border ${errors.location ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                      placeholder="Enter event location"
                    />
                    {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Date & Time *</label>
                    <input
                      type="datetime-local"
                      {...register("date", { required: "Date is required" })}
                      className={`w-full px-4 py-3 bg-white/10 border ${errors.date ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Total Seats *</label>
                    <input
                      type="number"
                      {...register("total_seats", {
                        required: "Total seats is required",
                        min: { value: 1, message: "Must be at least 1" },
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border ${errors.total_seats ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                      placeholder="Enter total seats"
                      min="1"
                    />
                    {errors.total_seats && <p className="text-red-400 text-sm mt-1">{errors.total_seats.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("price", {
                        required: "Price is required",
                        min: { value: 0, message: "Price must be positive" },
                      })}
                      className={`w-full px-4 py-3 bg-white/10 border ${errors.price ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                      placeholder="Enter ticket price"
                      min="0"
                    />
                    {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Event Image URL *</label>
                  <input
                    type="url"
                    {...register("img", { required: "Image URL is required" })}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.img ? "border-red-400" : "border-purple-300/30"} rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                    placeholder="Enter image URL"
                  />
                  {errors.img && <p className="text-red-400 text-sm mt-1">{errors.img.message}</p>}
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-purple-300/30 px-6 py-3 rounded-lg transition-all duration-300 font-medium backdrop-blur-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
