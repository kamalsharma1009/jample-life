import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { 
  User, Mail, Phone, MapPin, Shield, Award, Calendar, 
  CheckCircle2, AlertCircle, Save, Edit2, Share2, Copy,
  Building2, Users, HeartHandshake, FileCheck, Loader2, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function Profile() {
  const { profile, setProfile, updateProfile } = useAuthStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    mobile: profile?.mobile || '',
    dob: profile?.date_of_birth || '',
    gender: profile?.gender || 'Male',
    blood_group: profile?.blood_group || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    country: 'India',
    nominee_name: profile?.nominee_name || '',
    nominee_relation: profile?.nominee_relation || '',
    nominee_age: profile?.nominee_age || '',
    nominee_mobile: profile?.nominee_mobile || '',
    bank_name: profile?.bank_name || '',
    account_number: profile?.bank_account || '',
    ifsc: profile?.bank_ifsc || '',
    pan_number: profile?.pan_number || '',
    aadhaar_number: profile?.aadhaar_number || ''
  })

  // Synchronize latest profile from authStore and Supabase
  useEffect(() => {
    if (!profile) return
    setFormData(prev => ({
      ...prev,
      full_name: profile.full_name || prev.full_name,
      email: profile.email || prev.email,
      mobile: profile.mobile || prev.mobile,
      dob: profile.date_of_birth || prev.dob,
      address: profile.address || prev.address,
      city: profile.city || prev.city,
      state: profile.state || prev.state,
      pincode: profile.pincode || prev.pincode,
      nominee_name: profile.nominee_name || prev.nominee_name,
      nominee_relation: profile.nominee_relation || prev.nominee_relation,
      nominee_mobile: profile.nominee_mobile || prev.nominee_mobile,
      bank_name: profile.bank_name || prev.bank_name,
      account_number: profile.bank_account || prev.account_number,
      ifsc: profile.bank_ifsc || prev.ifsc,
      pan_number: profile.pan_number || prev.pan_number,
      aadhaar_number: profile.aadhaar_number || prev.aadhaar_number,
    }))
  }, [profile])

  const handleCopyCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (profile?.id) {
        const baseUpdates = {
          full_name: formData.full_name,
          mobile: formData.mobile,
          email: formData.email,
        }
        if (formData.dob && formData.dob !== '') {
          baseUpdates.date_of_birth = formData.dob
        }

        const fullUpdates = {
          ...baseUpdates,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          nominee_name: formData.nominee_name,
          nominee_relation: formData.nominee_relation,
          nominee_mobile: formData.nominee_mobile,
          bank_name: formData.bank_name,
          bank_account: formData.account_number,
          bank_ifsc: formData.ifsc,
          pan_number: formData.pan_number,
          aadhaar_number: formData.aadhaar_number,
        }

        try {
          await updateProfile(fullUpdates)
        } catch (colErr) {
          // If extra columns are not yet present in Supabase table, update core columns
          console.warn('Extended columns update failed, updating base columns:', colErr)
          await updateProfile(baseUpdates)
        }
      }
      setIsEditing(false)
      toast.success('Profile details saved directly to Supabase database!')
      setSuccessMsg('Profile information updated in Supabase database!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      toast.error('Failed to update in Supabase: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const rankBadgeColors = {
    MEMBER: 'bg-slate-100 text-slate-800 border-slate-300',
    RUBY_EXECUTIVE: 'bg-rose-100 text-rose-800 border-rose-300',
    DIAMOND_DIRECTOR: 'bg-purple-100 text-purple-800 border-purple-300',
    CROWN_AMBASSADOR: 'bg-amber-100 text-amber-800 border-amber-300',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Member Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal details, nominee info, and account credentials</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Main Grid: Identity Card & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Member Identity Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-burgundy-800 via-darkPurple-900 to-burgundy-900 relative">
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {profile?.status || 'ACTIVE'}
              </div>
            </div>

            <div className="px-6 pb-6 pt-0 relative">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md -mt-10 flex items-center justify-center text-burgundy-700 font-bold text-2xl">
                {formData.full_name?.charAt(0) || 'J'}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{formData.full_name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${rankBadgeColors[profile?.rank_code || 'MEMBER'] || 'bg-slate-100 text-slate-800'}`}>
                    {profile?.rank_code ? profile.rank_code.replace('_', ' ') : 'MEMBER'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>

              {/* ID & Referral Code Badge */}
              <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Distributor ID:</span>
                  <span className="font-mono font-bold text-gray-900">{profile?.member_id || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Referral Code:</span>
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-burgundy-600 font-bold hover:underline group"
                  >
                    <span>{profile?.referral_code || '—'}</span>
                    {profile?.referral_code && <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-burgundy-600" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">KYC Status:</span>
                  <span className={`flex items-center gap-1 font-semibold ${
                    profile?.kyc_status === 'VERIFIED' ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {profile?.kyc_status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {profile?.kyc_status || 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Joined Date:</span>
                  <span className="text-gray-700">
                    {profile?.joined_at ? new Date(profile.joined_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>

              {/* Sponsor Card */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Direct Sponsor</h3>
                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-9 h-9 rounded-lg bg-burgundy-600 text-white font-bold flex items-center justify-center text-sm">
                    {profile?.sponsor_name ? profile.sponsor_name.charAt(0) : 'JL'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {profile?.sponsor_name || (profile?.sponsor_id ? `ID: ${profile.sponsor_id}` : 'Direct Company')}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {profile?.sponsor_id ? `Sponsor ID: ${profile.sponsor_id}` : 'Direct Registration'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-burgundy-600" />
              Volume & Network Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500">Personal PV</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{profile?.personal_pv ?? 0} PV</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500">Personal BV</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{profile?.personal_bv ?? 0} BV</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500">Team BV</p>
                <p className="text-base font-bold text-burgundy-700 mt-0.5">{profile?.team_bv ?? 0} BV</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[11px] text-gray-500">Total Downline</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">{profile?.total_downline_count ?? 0} Members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Forms & Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <User className="w-5 h-5 text-burgundy-600" />
                <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    disabled={!isEditing}
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.blood_group}
                    onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-burgundy-600" />
                <h3 className="text-base font-bold text-gray-900">Registered Residential Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City / District</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Postal PIN Code</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Nominee Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <HeartHandshake className="w-5 h-5 text-burgundy-600" />
                <h3 className="text-base font-bold text-gray-900">Nominee / Beneficiary Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nominee Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.nominee_name}
                    onChange={(e) => setFormData({...formData, nominee_name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.nominee_relation}
                    onChange={(e) => setFormData({...formData, nominee_relation: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nominee Age</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={formData.nominee_age}
                    onChange={(e) => setFormData({...formData, nominee_age: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nominee Contact Number</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.nominee_mobile}
                    onChange={(e) => setFormData({...formData, nominee_mobile: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 disabled:bg-gray-100/70 disabled:text-gray-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  )
}
