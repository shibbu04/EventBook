"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Menu, X, Calendar, Settings, User, LogOut, LogIn } from "lucide-react"
import toast from "react-hot-toast"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    toast.success("Logged out successfully")
    navigate("/")
  }

  const navItems = [
    { name: "Home", path: "/", icon: Calendar },
    { name: "Events", path: "/events", icon: Calendar },
  ]

  // Add user-specific nav items
  if (user) {
    if (user.role === "admin") {
      navItems.push({ name: "Admin", path: "/admin", icon: Settings })
    } else {
      navItems.push({ name: "Dashboard", path: "/dashboard", icon: User })
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-lg shadow-lg border-b border-purple-500/20"
          : "bg-black/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-yellow-400 transition-colors duration-300"
          >
            <Calendar className="w-8 h-8 text-yellow-400" />
            <span>EventBook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActive(item.path) ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-purple-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* User Authentication */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Welcome, <span className="text-yellow-400 font-medium">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 text-sm font-medium text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-yellow-400/25"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg bg-purple-600/20 text-yellow-400 hover:bg-purple-600/30 hover:text-yellow-300 transition-all duration-300 border border-purple-500/30"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 bg-black/95 backdrop-blur-lg rounded-lg mt-2 border border-purple-500/20">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 mx-2 ${
                  isActive(item.path)
                    ? "bg-gradient-to-r from-purple-600/30 to-purple-700/30 text-yellow-400 border border-purple-500/30"
                    : "text-gray-300 hover:bg-purple-600/20 hover:text-yellow-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Mobile Authentication */}
            {user ? (
              <div className="pt-4 border-t border-purple-500/20 mx-2">
                <div className="px-4 py-2 text-sm text-gray-400">
                  Signed in as <span className="text-yellow-400 font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-purple-500/20 mx-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:text-yellow-400 rounded-lg transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-lg transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default Navbar
