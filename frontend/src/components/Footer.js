"use client"
import { motion } from "framer-motion"
import { Calendar, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Events", href: "/events" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
      ],
    },
    {
      title: "Contact Info",
      links: [
        { name: "info@eventbook.com", href: "mailto:info@eventbook.com", icon: Mail },
        { name: "(888) 123-4567", href: "tel:+18881234567", icon: Phone },
        { name: "Delaware, USA", href: "#", icon: MapPin },
      ],
    },
  ]

  const socialLinks = [
    { name: "Github", icon: Github, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ]

  return (
    <footer className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-500"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                EventBook
              </span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your premier destination for discovering and booking amazing events. Connect with experiences that matter
              to you.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-yellow-400/20 hover:text-yellow-400 transition-all duration-300 border border-white/20 hover:border-yellow-400/50"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 relative">
                {section.title}
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"></div>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      whileHover={{ x: 5 }}
                      className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-all duration-200 group"
                    >
                      {link.icon && (
                        <link.icon className="w-4 h-4 group-hover:text-yellow-400 transition-colors duration-200" />
                      )}
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-200 group-hover:w-full"></span>
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-white/20"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-300">© {currentYear} EventBook. All rights reserved.</p>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
              <p className="text-sm text-gray-300">
                Developed by <span className="text-yellow-400 font-semibold">Shivam</span>
              </p>
              <p className="text-sm text-gray-300">Made with ❤️ for amazing events</p>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
