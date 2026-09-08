import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="bg-jample-dark text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-jample-gradient flex items-center justify-center">
                <span className="text-white font-black text-sm">JL</span>
              </div>
              <div>
                <span className="font-bold text-white">Jample Life</span>
                <p className="text-white/50 text-xs">Rich World Healthy World</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Premium health and wellness products combined with a transparent direct selling business opportunity.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Products</h3>
            <ul className="space-y-2 text-white/60 text-sm">
              <li>Noni Seabuckthorn Capsules</li>
              <li>Nabhi Oil</li>
              <li>Neem Karela Jamun Capsules</li>
              <li>Sanitary Pads</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-white/60 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-white/60 hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="text-white/60 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/shop" className="text-white/60 hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Jample Life. All rights reserved.</p>
          <p className="text-white/40 text-xs">Rich World Healthy World</p>
        </div>
      </div>
    </footer>
  )
}
