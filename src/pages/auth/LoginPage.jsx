import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, TrendingUp,
  Leaf, Mail, Lock, Sparkles, Star, Shield, Building2,
  CheckCircle2, Layers, Receipt, User
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema } from '@/lib/validations'
import { cn } from '@/lib/utils'

const PERKS = [
  {
    icon: TrendingUp,
    title: '13-Level High-Yield MLM Engine',
    desc: 'Instant sponsor overrides, personal PV tracking, and weekly director bonus distributions.',
  },
  {
    icon: Layers,
    title: 'Real-Time Network Backoffice',
    desc: 'Interactive genealogy tree view, member volume tracking, and replicated referral store.',
  },
  {
    icon: Receipt,
    title: 'Automated Bank Settlements',
    desc: 'Weekly direct NEFT/RTGS transfers with full statutory TDS compliance and audit trail.',
  },
]

const TRUST_STATS = [
  { value: '₹2.4 Cr+', label: 'Bonuses Paid' },
  { value: '13 Levels', label: 'Income Depth' },
  { value: '100%', label: 'AYUSH Certified' },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const { signIn, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    let identifier = (data.identifier || data.email || '').trim()
    const digitsOnly = identifier.replace(/\D/g, '')
    if (digitsOnly.length === 10) {
      identifier = digitsOnly
    } else if (digitsOnly.length > 10 && (digitsOnly.startsWith('91') || digitsOnly.startsWith('0'))) {
      identifier = digitsOnly.slice(-10)
    }

    const result = await signIn(identifier, data.password)
    if (result.success) {
      toast.success('Welcome back to Jample Life!')
      if (result.profile?.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from, { replace: true })
      }
    } else {
      toast.error(result.error || 'Login failed. Please check your credentials.')
    }
  }


  return (
    <div className="min-h-screen flex bg-[#f8fafc]">

      {/* ── LEFT SHOWCASE PANEL (Desktop lg+) ───────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] 2xl:w-[40%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 bg-[#0f172a] text-white select-none">
        {/* Ambient Glowing Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#853953] rounded-full blur-[100px] opacity-35" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#f59e0b] rounded-full blur-[120px] opacity-20" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#612D53] rounded-full blur-[90px] opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/40 via-transparent to-[#0f172a]/80" />
          <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        {/* Logo & Brand */}
        <div className="relative flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-jample-gradient flex items-center justify-center shadow-jample transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-black text-base tracking-wider">JL</span>
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight leading-none">Jample Life</p>
              <p className="text-slate-400 text-[11px] font-medium tracking-wide mt-1">Rich World Healthy World</p>
            </div>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={13} className="text-amber-400" /> AYUSH Certified
          </span>
        </div>

        {/* Main Brand Copy */}
        <div className="relative my-auto py-8 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#853953]/30 border border-[#853953]/50 text-[#f59e0b] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={13} /> Authorized Distributor Portal
            </div>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white leading-tight tracking-tight">
              Your Business. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-amber-200">
                Your Rules.
              </span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md">
              Access your digital distributor backoffice — monitor real-time genealogy volume, track weekly settlements, and accelerate your business growth.
            </p>
          </div>

          {/* Value Perks */}
          <div className="space-y-3.5">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon
              return (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-all hover:bg-white/[0.07]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#853953] to-[#612D53] flex items-center justify-center flex-shrink-0 text-amber-300 shadow-sm mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-white text-sm font-bold leading-tight">{perk.title}</h4>
                    <p className="text-slate-400 text-xs mt-1 leading-snug">{perk.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {TRUST_STATS.map((stat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-lg xl:text-xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial Footer */}
        <div className="relative pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">Anita Mehta</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300 font-bold border border-rose-400/30">
                  Ruby Executive
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                "Within 3 months of joining, I cleared my first ₹25,000 settlement with full transparency."
              </p>
            </div>
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 xl:p-12 overflow-y-auto">
        <div className="w-full max-w-md mx-auto my-auto py-6">

          {/* Mobile Header (Hidden on lg+) */}
          <div className="flex items-center justify-between lg:hidden mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-jample-gradient flex items-center justify-center shadow-jample">
                <span className="text-white font-black text-sm">JL</span>
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm leading-tight">Jample Life</p>
                <p className="text-slate-400 text-[10px]">Rich World Healthy World</p>
              </div>
            </Link>
            <Link to="/register" className="text-xs font-bold text-[#853953] hover:underline">
              Join Now →
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-7 sm:p-10 relative overflow-hidden">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#853953] via-amber-500 to-[#612D53]" />

            {/* Card Header */}
            <div className="mb-6 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#853953] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 inline-block mb-3">
                Distributor Backoffice
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Sign in to your distributor backoffice to manage your team and volume
              </p>
            </div>


            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Distributor ID or Mobile No. */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Distributor ID or Mobile No. <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. JL-2026-0201 or 9876543210"
                    {...register('identifier')}
                    className={cn(
                      inputClass,
                      'pl-10 font-medium',
                      errors.identifier && errorClass
                    )}
                  />
                </div>
                {errors.identifier && (
                  <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    {errors.identifier.message}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter your assigned Distributor ID (e.g. JL-2026-0201) or registered Mobile Number.
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#853953] hover:underline font-bold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register('password')}
                    className={cn(
                      inputClass,
                      'pl-10 pr-12',
                      errors.password && errorClass
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#853953] focus:ring-[#853953] border-slate-300"
                  />
                  <span className="text-xs font-medium text-slate-600">
                    Keep me signed in for 30 days
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(btnClass, 'mt-3 py-3.5 text-base')}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Backoffice <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs sm:text-sm text-slate-500">
                Not an enrolled distributor yet?{' '}
                <Link to="/register" className="text-[#853953] font-bold hover:text-[#612D53] hover:underline">
                  Enroll as Distributor →
                </Link>
              </p>
            </div>
          </div>

          {/* Security reassurance footer */}
          <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5">
            <Lock size={12} /> 256-Bit SSL Encrypted • Direct Selling Compliance
          </p>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#853953]/25 focus:border-[#853953] focus:bg-white transition-all shadow-2xs'
const errorClass = 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20'
const btnClass = 'flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#853953] via-[#702e45] to-[#612D53] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
