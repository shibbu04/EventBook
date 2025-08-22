"use client"
import { motion } from "framer-motion"
import { X, LogIn, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const LoginModal = ({ isOpen, onClose, eventTitle }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    navigate("/login")
  }

  const handleRegister = () => {
    onClose()
    navigate("/register")
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 pb-8 px-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-purple-700/50 backdrop-blur-lg"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-yellow-400">Login Required</h2>
          <button onClick={onClose} className="p-2 hover:bg-purple-700/50 rounded-lg transition-all duration-200 group">
            <X className="w-5 h-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-purple-900" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Ready to attend this event?</h3>
          <p className="text-purple-200 mb-3 leading-relaxed text-sm">
            To book tickets for "<span className="font-medium text-yellow-400">{eventTitle}</span>", you need to login
            first.
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-purple-800/50 border border-purple-600/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            Demo Credentials:
          </h4>
          <div className="text-xs text-purple-200 space-y-1">
            <p>
              <strong className="text-yellow-400">Test User:</strong> test@example.com / testuser123
            </p>
            <p>
              <strong className="text-yellow-400">Admin:</strong> demo@admin.com / Demo@admin
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-purple-900 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            <span>Login to Continue</span>
          </button>

          <button
            onClick={handleRegister}
            className="w-full bg-purple-700/50 hover:bg-purple-600/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 border border-purple-600/50 hover:border-yellow-400/50 backdrop-blur-sm transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-purple-300">Secure booking system with instant ticket delivery</p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginModal
