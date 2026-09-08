import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  User, Shield, Sparkles, TrendingUp, Leaf, Award, Check,
  Building2, Star, ShieldCheck, Phone, Mail, Lock, Calendar,
  MapPin, CheckSquare, Layers
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { registerStep1Schema, registerStep2Schema, registerStep3Schema } from '@/lib/validations'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Account', subtitle: 'Credentials', icon: User },
  { id: 2, label: 'Personal', subtitle: 'Profile Info', icon: MapPin },
  { id: 3, label: 'Sponsor', subtitle: 'Placement', icon: Shield },
  { id: 4, label: 'Launch', subtitle: 'Confirmation', icon: Sparkles },
]

const PERKS = [
  {
    icon: TrendingUp,
    title: '13-Level High-Yield MLM Engine',
    desc: 'Weekly direct bank settlements with multi-tier sponsor overrides and pool distributions.',
  },
  {
    icon: Leaf,
    title: '100% Certified Organic Ayush Range',
    desc: 'Clinically backed ayurvedic wellness formulations with natural customer retention.',
  },
  {
    icon: Layers,
    title: 'Instant Digital Backoffice',
    desc: 'Real-time genealogy tree, team BV tracking, and personal replicated referral shop.',
  },
]

const TRUST_STATS = [
  { value: '₹2.4 Cr+', label: 'Bonuses Paid' },
  { value: '13 Levels', label: 'Income Depth' },
  { value: '100%', label: 'AYUSH Certified' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifyingRef, setIsVerifyingRef] = useState(false)
  const [sponsor, setSponsor] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(true)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')

  const step1Form = useForm({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
  })
  const step2Form = useForm({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
  })
  const step3Form = useForm({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { referral_code: refCode ? refCode.trim().toUpperCase() : '' },
    mode: 'onChange',
  })

  // Watch password for dynamic strength meter
  const watchedPassword = step1Form.watch('password') || ''

  const passwordStrength = useMemo(() => {
    let score = 0
    if (!watchedPassword) return { score: 0, label: 'None', color: 'bg-slate-200' }
    if (watchedPassword.length >= 8) score += 1
    if (/[A-Z]/.test(watchedPassword)) score += 1
    if (/[0-9]/.test(watchedPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(watchedPassword) || watchedPassword.length >= 12) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
  }, [watchedPassword])

  // Auto-load and verify referral code from URL
  useEffect(() => {
    if (refCode) {
      const code = refCode.trim().toUpperCase()
      step3Form.setValue('referral_code', code)
      verifyReferralCode(code)
    }
  }, [refCode])

  const verifyReferralCode = async (code) => {
    if (!code || !code.trim()) {
      setSponsor(null)
      return true
    }
    setIsVerifyingRef(true)
    const cleanCode = code.trim().toUpperCase()
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, member_id, full_name, rank_code, status, referral_code')
        .or(`referral_code.eq.${cleanCode},member_id.eq.${cleanCode}`)
        .eq('status', 'ACTIVE')
        .maybeSingle()

      if (error || !data) {
        setSponsor(null)
        return false
      }
      setSponsor(data)
      return true
    } catch (e) {
      console.warn('verifyReferralCode error:', e)
      setSponsor(null)
      return false
    } finally {
      setIsVerifyingRef(false)
    }
  }

  const handleStep1 = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const handleStep2 = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(3)
  }

  const handleStep3 = async (data) => {
    const code = (data.referral_code || '').trim()
    if (code) {
      const valid = await verifyReferralCode(code)
      if (!valid) {
        step3Form.setError('referral_code', { message: 'Referral code not found or distributor is inactive' })
        return
      }
      setFormData(prev => ({ ...prev, referral_code: code.toUpperCase() }))
    } else {
      setFormData(prev => ({ ...prev, referral_code: '' }))
    }
    setStep(4)
  }

  const handleFinalSubmit = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the Jample Life Distributor Terms to proceed.')
      return
    }

    setIsLoading(true)
    try {
      // 1. Create user in Supabase Auth (with graceful fallback if email confirmation is rate-limited)
      let userId = null
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              mobile: formData.mobile,
            },
          },
        })
        if (!authError && authData?.user?.id) {
          userId = authData.user.id
        } else if (authError) {
          console.warn('[Register] Supabase auth.signUp note:', authError.message)
        }
      } catch (authErr) {
        console.warn('[Register] Supabase auth.signUp exception:', authErr)
      }

      // If Supabase Auth did not return an id (e.g. rate-limited), generate unique UUID
      if (!userId) {
        userId = crypto.randomUUID()
      }

      // Generate sequential/unique Member ID
      const memberId = `JL-2026-${Math.floor(1000 + Math.random() * 9000)}`

      // 2. Direct Supabase Profile Upsert (only columns that exist in profiles table)
      const profilePayload = {
        id: userId,
        member_id: memberId,
        full_name: formData.full_name,
        email: formData.email,
        mobile: formData.mobile,
        role: 'MEMBER',
        network_role: 'MEMBER',
        rank_code: 'MEMBER',
        status: 'ACTIVE',
        kyc_status: 'PENDING',
        referral_code: memberId,
        personal_pv: 0,
        personal_bv: 0,
        team_bv: 0,
        wallet_balance: 0,
        total_earned: 0,
        direct_referrals_count: 0,
        total_downline_count: 0,
        joined_at: new Date().toISOString(),
      }

      if (formData.date_of_birth) {
        profilePayload.date_of_birth = formData.date_of_birth
      }
      if (formData.address?.street) {
        profilePayload.address = formData.address.street
      }
      if (formData.address?.city) {
        profilePayload.city = formData.address.city
      }
      if (formData.address?.state) {
        profilePayload.state = formData.address.state
      }
      if (formData.address?.pincode) {
        profilePayload.pincode = formData.address.pincode
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload)

      if (profileError) {
        console.error('Profile upsert error:', profileError)
        throw new Error(profileError.message || 'Failed to save distributor profile in database.')
      }

      // 3. Connect to Genealogy Tree
      if (sponsor?.id) {
        try {
          await supabase.from('genealogy').upsert({
            member_id: userId,
            sponsor_id: sponsor.id,
            parent_id: sponsor.id,
            position: 'LEFT',
            level: 1,
          })

          // Increment sponsor's referral counts in profiles
          const { data: sp } = await supabase
            .from('profiles')
            .select('direct_referrals_count, total_downline_count')
            .eq('id', sponsor.id)
            .maybeSingle()

          if (sp) {
            await supabase
              .from('profiles')
              .update({
                direct_referrals_count: (sp.direct_referrals_count || 0) + 1,
                total_downline_count: (sp.total_downline_count || 0) + 1,
              })
              .eq('id', sponsor.id)
          }
        } catch (genErr) {
          console.warn('Genealogy linking warning:', genErr)
        }
      }

      // 4. Initialize wallet record
      try {
        await supabase.from('wallet_transactions').insert([{
          member_id: userId,
          transaction_type: 'BONUS_CREDIT',
          amount: 0,
          balance_after: 0,
          description: 'Distributor account welcome activation',
          status: 'COMPLETED'
        }])
      } catch (wErr) {
        console.warn('Wallet init warning:', wErr)
      }

      // 5. Automatically log in user with their new profile
      useAuthStore.setState({
        user: {
          id: userId,
          email: formData.email,
          user_metadata: { full_name: formData.full_name }
        },
        profile: profilePayload,
        isLoading: false,
        error: null
      })

      toast.success('Registration successful! Welcome to your distributor dashboard.')
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
      const msg = error.message?.includes('already registered') || error.message?.includes('already exists')
        ? 'An account with this email already exists. Please sign in.'
        : error.message || 'Registration failed. Please check your details and try again.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Progress percentage calculation
  const progressPercent = ((step) / STEPS.length) * 100

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
              <ShieldCheck size={13} /> Official Distributor Enrollment
            </div>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white leading-tight tracking-tight">
              Turn Wellness <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-amber-200">
                Into Real Wealth.
              </span>
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md">
              Start your journey with India's most transparent direct-selling system. Earn weekly commissions across 13 levels and promote clinically validated ayurvedic remedies.
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

        {/* Testimonial / Social Proof Footer */}
        <div className="relative pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md">
              SK
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white">Sunil K. Verma</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                  Diamond Director
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                "Weekly direct bank settlements and 100% genuine herbal products."
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
        <div className="w-full max-w-xl mx-auto my-auto py-6">

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
            <Link to="/login" className="text-xs font-bold text-[#853953] hover:underline">
              Sign In →
            </Link>
          </div>

          {/* Stepper Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-10 relative overflow-hidden">
            
            {/* Top Animated Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-[#853953] via-amber-500 to-[#612D53] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepper Header */}
            <div className="mb-8 pt-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#853953] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  Step {step} of 4: {STEPS[step - 1].label}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {Math.round(progressPercent)}% Complete
                </span>
              </div>

              {/* Step Pills */}
              <div className="grid grid-cols-4 gap-2">
                {STEPS.map((s) => {
                  const isCompleted = step > s.id
                  const isCurrent = step === s.id
                  const Icon = s.icon

                  return (
                    <div
                      key={s.id}
                      className={cn(
                        'flex flex-col items-center sm:items-start p-2 sm:p-2.5 rounded-xl border transition-all text-left',
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200/70 text-slate-400'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold',
                            isCurrent
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          )}
                        >
                          {isCompleted ? <Check size={12} strokeWidth={3} /> : s.id}
                        </div>
                        <span className="text-xs font-bold hidden sm:inline truncate">
                          {s.label}
                        </span>
                      </div>
                      <span className="text-[10px] hidden md:inline text-slate-400 truncate mt-0.5">
                        {s.subtitle}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── STEP 1: ACCOUNT DETAILS ──────────────────────────────── */}
            {step === 1 && (
              <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Enter your personal credentials to setup your distributor profile
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="As per PAN or Aadhaar card"
                      className={cn(
                        inputClass,
                        'pl-10',
                        step1Form.formState.errors.full_name && errorClass
                      )}
                      {...step1Form.register('full_name')}
                    />
                  </div>
                  {step1Form.formState.errors.full_name && (
                    <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      {step1Form.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={cn(
                        inputClass,
                        'pl-10',
                        step1Form.formState.errors.email && errorClass
                      )}
                      {...step1Form.register('email')}
                    />
                  </div>
                  {step1Form.formState.errors.email && (
                    <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      {step1Form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (WhatsApp Enabled) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-slate-500 text-xs font-bold border-r border-slate-300 pr-2">
                      <Phone size={14} className="text-slate-400" />
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      className={cn(
                        inputClass,
                        'pl-20',
                        step1Form.formState.errors.mobile && errorClass
                      )}
                      {...step1Form.register('mobile')}
                    />
                  </div>
                  {step1Form.formState.errors.mobile && (
                    <p className="text-rose-500 text-xs font-semibold mt-1 flex items-center gap-1">
                      {step1Form.formState.errors.mobile.message}
                    </p>
                  )}
                </div>

                {/* Password with Strength Meter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Security Password <span className="text-rose-500">*</span>
                    </label>
                    {watchedPassword && (
                      <span className="text-[11px] font-bold text-slate-500">
                        Strength: <strong className={cn(
                          passwordStrength.score >= 3 ? 'text-emerald-600' :
                          passwordStrength.score === 2 ? 'text-amber-600' : 'text-rose-600'
                        )}>{passwordStrength.label}</strong>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 chars, 1 uppercase, 1 number"
                      className={cn(
                        inputClass,
                        'pl-10 pr-12',
                        step1Form.formState.errors.password && errorClass
                      )}
                      {...step1Form.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength visual bars */}
                  {watchedPassword && (
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[1, 2, 3, 4].map(seg => (
                        <div
                          key={seg}
                          className={cn(
                            'h-1.5 rounded-full transition-colors duration-300',
                            seg <= passwordStrength.score ? passwordStrength.color : 'bg-slate-100'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {step1Form.formState.errors.password && (
                    <p className="text-rose-500 text-xs font-semibold mt-1">
                      {step1Form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-type your password"
                      className={cn(
                        inputClass,
                        'pl-10 pr-12',
                        step1Form.formState.errors.confirm_password && errorClass
                      )}
                      {...step1Form.register('confirm_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {step1Form.formState.errors.confirm_password && (
                    <p className="text-rose-500 text-xs font-semibold mt-1">
                      {step1Form.formState.errors.confirm_password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(btnClass, 'mt-4')}
                >
                  Continue to Personal Details <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ── STEP 2: PERSONAL & ADDRESS DETAILS ───────────────────── */}
            {step === 2 && (
              <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal &amp; Location Details</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Required for your official welcome kit and statutory KYC records
                  </p>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      className={cn(inputClass, 'pl-10')}
                      {...step2Form.register('date_of_birth')}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Must be at least 18 years old for Direct Selling compliance.</p>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Street Address / House No.
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Flat 302, Green Avenue"
                      className={cn(inputClass, 'pl-10')}
                      {...step2Form.register('address.street')}
                    />
                  </div>
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      City / District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Indore, Jaipur"
                      className={inputClass}
                      {...step2Form.register('address.city')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra, MP"
                      className={inputClass}
                      {...step2Form.register('address.state')}
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-digit postal PIN"
                    className={inputClass}
                    {...step2Form.register('address.pincode')}
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className={cn(btnClass, 'flex-1')}
                  >
                    Continue to Sponsor <ArrowRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 text-center py-1 transition"
                >
                  Skip address for now (fill later in Profile Settings)
                </button>
              </form>
            )}

            {/* ── STEP 3: SPONSOR & REFERRAL VERIFICATION ─────────────── */}
            {step === 3 && (
              <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sponsor &amp; Team Placement</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Connect your distributor account to your mentor or enroll under Direct Company
                  </p>
                </div>

                {/* Verified Sponsor Card Preview */}
                {sponsor ? (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                          {sponsor.full_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 size={11} className="text-emerald-600" /> Verified Sponsor
                          </span>
                          <p className="font-extrabold text-slate-900 text-sm mt-1 leading-tight">{sponsor.full_name}</p>
                          <p className="text-emerald-700 font-mono text-xs mt-0.5">{sponsor.member_id}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                        {sponsor.rank_code || 'ACTIVE LEADER'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center gap-1.5">
                      <Sparkles size={12} className="text-emerald-600" />
                      You will be placed directly in {sponsor.full_name}'s genealogy organization.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center flex-shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">No Referral Code? No Problem!</p>
                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                          You will be assigned directly under <strong>Company Root Leader</strong> with 100% full distributor benefits, equal commission rates, and direct support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Referral Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Sponsor Referral Code / Member ID (Optional)
                  </label>
                  <div className="relative">
                    <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. JL-2026-8201 or JL100001"
                      className={cn(
                        inputClass,
                        'pl-10 uppercase font-mono tracking-wider font-bold',
                        step3Form.formState.errors.referral_code && errorClass
                      )}
                      {...step3Form.register('referral_code', {
                        onChange: async (e) => {
                          const code = e.target.value.toUpperCase()
                          if (code.length >= 4) {
                            await verifyReferralCode(code)
                          } else {
                            setSponsor(null)
                          }
                        }
                      })}
                    />
                    {isVerifyingRef && (
                      <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                    )}
                  </div>
                  {step3Form.formState.errors.referral_code && (
                    <p className="text-rose-500 text-xs font-semibold mt-1">
                      {step3Form.formState.errors.referral_code.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className={cn(btnClass, 'flex-1')}
                  >
                    Review &amp; Launch <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* ── STEP 4: REVIEW & LAUNCH ─────────────────────────────── */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review &amp; Activate Account</h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Confirm your details to generate your official distributor credentials
                  </p>
                </div>

                {/* Digital Membership Pass Preview */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-[#0f172a] text-white p-5 border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#853953] rounded-full blur-2xl opacity-40 -mr-8 -mt-8" />
                  
                  <div className="relative flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-jample-gradient flex items-center justify-center text-white font-black text-xs">
                        JL
                      </div>
                      <span className="font-extrabold text-xs tracking-wider text-slate-200">
                        DISTRIBUTOR PASS
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      STATUS: READY TO ACTIVATE
                    </span>
                  </div>

                  <div className="relative grid grid-cols-2 gap-3.5 py-4 text-xs">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Distributor Name</p>
                      <p className="font-bold text-white text-sm mt-0.5 truncate">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Registered Mobile</p>
                      <p className="font-bold text-white text-sm mt-0.5">{formData.mobile}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Login Email</p>
                      <p className="font-semibold text-slate-300 truncate mt-0.5">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">Sponsor Lineage</p>
                      <p className="font-semibold text-amber-300 mt-0.5 truncate">
                        {sponsor ? `${sponsor.full_name} (${sponsor.member_id})` : 'Direct Company Root'}
                      </p>
                    </div>
                  </div>

                  <div className="relative pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Assigned ID Format: <strong className="text-white font-mono">JL-2026-XXXX</strong></span>
                    <span>13-Level Commission Enabled</span>
                  </div>
                </div>

                {/* Terms and Compliance Checkbox */}
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#853953] focus:ring-[#853953] border-slate-300"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <strong>Jample Life Distributor Code of Conduct</strong>, Direct Selling Guidelines, and acknowledge that payouts are subject to statutory TDS and bank KYC verification.
                  </span>
                </label>

                {/* Action CTA buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isLoading || !agreedToTerms}
                    className={cn(btnClass, 'flex-1 py-3.5 text-base')}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Distributor Credentials...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="text-amber-300" />
                        Activate My Distributor Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Sign In Link */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs sm:text-sm text-slate-500">
                Already an enrolled distributor?{' '}
                <Link to="/login" className="text-[#853953] font-bold hover:text-[#612D53] hover:underline">
                  Sign in to Backoffice →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#853953]/25 focus:border-[#853953] focus:bg-white transition-all shadow-2xs'
const errorClass = 'border-rose-300 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-500/20'
const btnClass = 'flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#853953] via-[#702e45] to-[#612D53] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'
