import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Products', to: '/#products' },
  { label: 'Opportunity', to: '/#opportunity' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'FAQ', to: '/#faq' },
]

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-jample-gradient flex items-center justify-center shadow-jample">
              <span className="text-white font-black text-sm">JL</span>
            </div>
            <div>
              <span className="font-bold text-gray-900">Jample Life</span>
              <span className="hidden sm:block text-[10px] text-gray-500 leading-none">Rich World Healthy World</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link.label} href={link.to}
                className="text-sm text-gray-600 hover:text-jample-burgundy font-medium transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-jample-burgundy transition-colors">
              Sign In
            </Link>
            <Link to="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-jample-gradient text-white text-sm font-semibold shadow-jample hover:shadow-jample-lg transition-all duration-200 hover:scale-[1.02]">
              Get Started
            </Link>
            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            {navLinks.map(link => (
              <a key={link.label} href={link.to} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:text-jample-burgundy hover:bg-gray-50 rounded-lg">
                {link.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:text-jample-burgundy">
              Sign In
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
