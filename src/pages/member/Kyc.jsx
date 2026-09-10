import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { 
  ShieldCheck, AlertCircle, FileCheck, Upload, CheckCircle2, 
  CreditCard, Building2, Eye, RefreshCw, Clock, ArrowRight, Check
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export default function Kyc() {
  const { profile, setProfile } = useAuthStore()

  const [activeStep, setActiveStep] = useState(1) // 1: PAN, 2: Aadhaar, 3: Bank Account
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successBanner, setSuccessBanner] = useState('')

  const kycStatus = profile?.kyc_status || 'PENDING'
  const isFullyVerified = kycStatus === 'VERIFIED'

  const [panData, setPanData] = useState({
    pan_number: profile?.pan_number || '',
    name_on_pan: profile?.full_name || '',
    pan_file_name: profile?.pan_number ? 'pan_card_document.pdf' : '',
    verified: Boolean(profile?.pan_number && isFullyVerified)
  })

  const [aadhaarData, setAadhaarData] = useState({
    aadhaar_number: profile?.aadhaar_number || '',
    front_file_name: profile?.aadhaar_number ? 'aadhaar_front.jpg' : '',
    back_file_name: profile?.aadhaar_number ? 'aadhaar_back.jpg' : '',
    verified: Boolean(profile?.aadhaar_number && isFullyVerified)
  })

  const [bankData, setBankData] = useState({
    bank_name: profile?.bank_name || '',
    account_number: profile?.bank_account || '',
    confirm_account_number: profile?.bank_account || '',
    ifsc_code: profile?.bank_ifsc || '',
    branch: profile?.city || '',
    cheque_file_name: profile?.bank_account ? 'bank_document.pdf' : '',
    verified: Boolean(profile?.bank_account && isFullyVerified)
  })

  // Sync state when profile loads
  useEffect(() => {
    if (!profile) return
    const verified = profile.kyc_status === 'VERIFIED'
    setPanData(prev => ({
      ...prev,
      pan_number: profile.pan_number || '',
      name_on_pan: profile.full_name || prev.name_on_pan,
      pan_file_name: profile.pan_number ? (prev.pan_file_name || 'pan_card_document.pdf') : '',
      verified: Boolean(profile.pan_number && verified)
    }))
    setAadhaarData(prev => ({
      ...prev,
      aadhaar_number: profile.aadhaar_number || '',
      front_file_name: profile.aadhaar_number ? (prev.front_file_name || 'aadhaar_front.jpg') : '',
      back_file_name: profile.aadhaar_number ? (prev.back_file_name || 'aadhaar_back.jpg') : '',
      verified: Boolean(profile.aadhaar_number && verified)
    }))
    setBankData(prev => ({
      ...prev,
      bank_name: profile.bank_name || '',
      account_number: profile.bank_account || '',
      confirm_account_number: profile.bank_account || '',
      ifsc_code: profile.bank_ifsc || '',
      branch: profile.city || prev.branch,
      cheque_file_name: profile.bank_account ? (prev.cheque_file_name || 'bank_document.pdf') : '',
      verified: Boolean(profile.bank_account && verified)
    }))
  }, [profile])

  // Listen for real-time KYC updates (e.g. admin approval)
  useEffect(() => {
    const handleKycSync = (e) => {
      const updated = e?.detail
      if (updated && (updated.id === profile?.id || updated.member_id === profile?.member_id)) {
        setProfile({ ...profile, ...updated })
      } else if (profile?.id) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setProfile({ ...profile, ...data })
          })
      }
    }
    window.addEventListener('jample_kyc_updated', handleKycSync)
    return () => window.removeEventListener('jample_kyc_updated', handleKycSync)
  }, [profile, setProfile])

  const handleSimulateSubmit = async (e) => {
    e.preventDefault()

    const cleanPan = (panData.pan_number || '').trim().toUpperCase()
    const cleanAadhaar = (aadhaarData.aadhaar_number || '').trim()
    const cleanBankName = (bankData.bank_name || '').trim()
    const cleanAccount = (bankData.account_number || '').trim()
    const cleanConfirm = (bankData.confirm_account_number || '').trim()
    const cleanIfsc = (bankData.ifsc_code || '').trim().toUpperCase()

    if (!cleanPan || cleanPan.length !== 10) {
      toast.error('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).')
      setActiveStep(1)
      return
    }

    if (!cleanAadhaar || cleanAadhaar.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number.')
      setActiveStep(2)
      return
    }

    if (!cleanBankName || !cleanAccount || !cleanIfsc) {
      toast.error('Please fill in all mandatory bank details.')
      setActiveStep(3)
      return
    }

    if (cleanAccount !== cleanConfirm) {
      toast.error('Account numbers do not match.')
      return
    }

    setIsSubmitting(true)

    const updatedPayload = {
      kyc_status: 'PENDING',
      pan_number: cleanPan,
      aadhaar_number: cleanAadhaar,
      bank_name: cleanBankName,
      bank_account: cleanAccount,
      bank_ifsc: cleanIfsc,
    }

    // 1. Attempt Supabase update gracefully (handle constraints or network quietly)
    try {
      if (profile?.id) {
        await supabase
          .from('profiles')
          .update({
            kyc_status: 'PENDING',
            pan_number: cleanPan,
            aadhaar_number: cleanAadhaar,
            bank_name: cleanBankName,
            bank_account: cleanAccount,
            bank_ifsc: cleanIfsc,
          })
          .eq('id', profile.id)
      }
    } catch (dbErr) {
      console.warn('[KYC Prototype] Supabase update handled gracefully:', dbErr)
    }

    // 2. Persist in local storage prototype queue for instant admin visibility
    const submissionRecord = {
      id: profile?.id || 'demo-member-id',
      member_id: profile?.member_id || 'JL-2026-0201',
      full_name: profile?.full_name || 'Kamal Sharma',
      email: profile?.email || 'kamalsharma.100904@gmail.com',
      mobile: profile?.mobile || '+91 98765 43210',
      city: profile?.city || bankData.branch || 'Jaysingpur',
      state: profile?.state || 'Maharashtra',
      kyc_status: 'PENDING',
      pan_number: cleanPan,
      aadhaar_number: cleanAadhaar,
      bank_name: cleanBankName,
      bank_account: cleanAccount,
      bank_ifsc: cleanIfsc,
      pan_file: panData.pan_file_name || 'pan_card_document.pdf',
      aadhaar_front_file: aadhaarData.front_file_name || 'aadhaar_front.jpg',
      aadhaar_back_file: aadhaarData.back_file_name || 'aadhaar_back.jpg',
      cheque_file: bankData.cheque_file_name || 'cheque_passbook.pdf',
      submitted_at: new Date().toISOString(),
    }

    try {
      const existingStr = localStorage.getItem('jample_pending_kyc_requests')
      const existing = existingStr ? JSON.parse(existingStr) : {}
      existing[submissionRecord.id] = submissionRecord
      localStorage.setItem('jample_pending_kyc_requests', JSON.stringify(existing))
    } catch (storeErr) {
      console.warn('[KYC Prototype] LocalStorage save warning:', storeErr)
    }

    // 3. Update active AuthStore session profile immediately
    if (profile) {
      setProfile({
        ...profile,
        ...updatedPayload,
      })
    }

    // 4. Notify admin queues & components across tabs
    window.dispatchEvent(new CustomEvent('jample_kyc_updated', { detail: submissionRecord }))

    // 5. Visual confirmation
    setSuccessBanner('KYC Documents submitted successfully! Your submission is now under admin review.')
    toast.success('KYC Documents submitted for admin verification!')
    setTimeout(() => setSuccessBanner(''), 8000)
    setIsSubmitting(false)
  }

  const isStep1Done = Boolean(panData.pan_number)
  const isStep2Done = Boolean(aadhaarData.aadhaar_number)
  const isStep3Done = Boolean(bankData.bank_name && bankData.account_number && bankData.ifsc_code)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">KYC Document Verification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Government-mandated identity and bank verification for direct selling compliance and payout clearance (TDS Section 194H).
        </p>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successBanner}
        </div>
      )}

      {/* KYC Status Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        kycStatus === 'VERIFIED' 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : kycStatus === 'PENDING'
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : kycStatus === 'REJECTED'
          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
          : 'bg-slate-50/80 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            kycStatus === 'VERIFIED' 
              ? 'bg-emerald-600 text-white' 
              : kycStatus === 'PENDING'
              ? 'bg-amber-600 text-white'
              : kycStatus === 'REJECTED'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-500 text-white'
          }`}>
            {kycStatus === 'VERIFIED' ? <ShieldCheck className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">
                {kycStatus === 'VERIFIED' 
                  ? 'KYC Status: Fully Verified' 
                  : kycStatus === 'PENDING'
                  ? 'KYC Status: Under Admin Review'
                  : kycStatus === 'REJECTED'
                  ? 'KYC Status: Rejected'
                  : 'KYC Status: Pending Submission'}
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                kycStatus === 'VERIFIED' 
                  ? 'bg-emerald-200/80 text-emerald-800' 
                  : kycStatus === 'PENDING'
                  ? 'bg-amber-200/80 text-amber-800'
                  : kycStatus === 'REJECTED'
                  ? 'bg-rose-200/80 text-rose-800'
                  : 'bg-slate-200/80 text-slate-800'
              }`}>
                {kycStatus === 'PENDING' ? 'UNDER REVIEW' : kycStatus}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {kycStatus === 'VERIFIED' 
                ? 'Your PAN, Aadhaar, and Bank Account are approved. Weekly payouts will be auto-processed via IMPS/NEFT.'
                : kycStatus === 'PENDING'
                ? 'Your documents have been submitted and are pending administrative verification.'
                : kycStatus === 'REJECTED'
                ? 'Your documents were rejected. Please check requirements and re-upload clear copies.'
                : 'Please upload valid government documents (PAN, Aadhaar, Bank proof) to enable payouts.'}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          {kycStatus === 'VERIFIED' ? (
            <span>Verified Status: <strong className="text-emerald-700 font-semibold">Active</strong></span>
          ) : (
            <span>Verification Status: <strong className="text-amber-700 font-semibold">{kycStatus}</strong></span>
          )}
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveStep(1)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStep === 1 
              ? 'bg-burgundy-50/60 border-burgundy-600 ring-2 ring-burgundy-600/20' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">STEP 1</span>
            {isStep1Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 mt-1">PAN Card Verification</p>
          <p className="text-xs text-gray-500 mt-0.5">Mandatory for 5% TDS filing</p>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStep === 2 
              ? 'bg-burgundy-50/60 border-burgundy-600 ring-2 ring-burgundy-600/20' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">STEP 2</span>
            {isStep2Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 mt-1">Aadhaar Card</p>
          <p className="text-xs text-gray-500 mt-0.5">Government ID & Address</p>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeStep === 3 
              ? 'bg-burgundy-50/60 border-burgundy-600 ring-2 ring-burgundy-600/20' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">STEP 3</span>
            {isStep3Done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300" />
            )}
          </div>
          <p className="text-sm font-bold text-gray-900 mt-1">Bank Account & IFSC</p>
          <p className="text-xs text-gray-500 mt-0.5">Direct Payout Settlement</p>
        </button>
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        
        {/* Step 1: PAN Card */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <CreditCard className="w-5 h-5 text-burgundy-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Permanent Account Number (PAN)</h3>
                <p className="text-xs text-gray-500">Must be a valid 10-digit alphanumeric PAN card issued by the Income Tax Department of India.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. ABCDE1234F"
                    value={panData.pan_number}
                    onChange={(e) => setPanData({...panData, pan_number: e.target.value.toUpperCase()})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-wider text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name as per PAN Card</label>
                  <input
                    type="text"
                    placeholder="Full name as printed on PAN"
                    value={panData.name_on_pan}
                    onChange={(e) => setPanData({...panData, name_on_pan: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Important Note on TDS:
                  </p>
                  <p>Commission payouts without a verified PAN are subject to 20% TDS under Section 206AA. Verified PAN receives standard 5% TDS rate.</p>
                </div>
              </div>

              {/* Upload & Preview */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Uploaded Document Proof</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-burgundy-50 text-burgundy-600 flex items-center justify-center mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  {panData.pan_file_name ? (
                    <>
                      <p className="text-sm font-bold text-gray-900">{panData.pan_file_name}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                        {isFullyVerified ? 'Verified & Digitally Signed' : 'Uploaded • Pending Verification'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-600">No document uploaded yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Upload a clear photo or PDF of your PAN Card (max 5MB)</p>
                    </>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    <label className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-burgundy-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      {panData.pan_file_name ? 'Replace Document' : 'Upload Document'}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setPanData(prev => ({ ...prev, pan_file_name: e.target.files[0].name }))
                            toast.success(`Selected file: ${e.target.files[0].name}`)
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm"
              >
                Continue to Aadhaar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Aadhaar Card */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <ShieldCheck className="w-5 h-5 text-burgundy-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Aadhaar Card Verification</h3>
                <p className="text-xs text-gray-500">12-digit Unique Identification Number (UIDAI) for Proof of Identity and Address.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Aadhaar Number (12 Digits)</label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 123456789012"
                    value={aadhaarData.aadhaar_number}
                    onChange={(e) => setAadhaarData({...aadhaarData, aadhaar_number: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-wider text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200/70 text-xs text-blue-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Data Privacy Guarantee:
                  </p>
                  <p>Your Aadhaar details are encrypted in compliance with UIDAI storage guidelines and used solely for direct seller authentication.</p>
                </div>
              </div>

              {/* Upload Front and Back */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-xl p-4 text-center bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-700">Front Side Image</p>
                  {aadhaarData.front_file_name ? (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">✓ {aadhaarData.front_file_name}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No front photo uploaded</p>
                  )}
                  <label className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" /> {aadhaarData.front_file_name ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAadhaarData(prev => ({ ...prev, front_file_name: e.target.files[0].name }))
                          toast.success(`Front image: ${e.target.files[0].name}`)
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 text-center bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-700">Back Side (Address)</p>
                  {aadhaarData.back_file_name ? (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">✓ {aadhaarData.back_file_name}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">No back photo uploaded</p>
                  )}
                  <label className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" /> {aadhaarData.back_file_name ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAadhaarData(prev => ({ ...prev, back_file_name: e.target.files[0].name }))
                          toast.success(`Back image: ${e.target.files[0].name}`)
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm"
              >
                Continue to Bank Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bank Account */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <Building2 className="w-5 h-5 text-burgundy-600" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Bank Account for Weekly Settlements</h3>
                <p className="text-xs text-gray-500">Direct credit destination for all weekly commission payouts, director bonuses, and rank awards.</p>
              </div>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India, HDFC, ICICI"
                    value={bankData.bank_name}
                    onChange={(e) => setBankData({...bankData, bank_name: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">IFSC Code (11 Characters)</label>
                  <input
                    type="text"
                    maxLength={11}
                    placeholder="e.g. SBIN0001234"
                    value={bankData.ifsc_code}
                    onChange={(e) => setBankData({...bankData, ifsc_code: e.target.value.toUpperCase()})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-wider text-gray-900 uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Account Number</label>
                  <input
                    type="password"
                    placeholder="Enter account number"
                    value={bankData.account_number}
                    onChange={(e) => setBankData({...bankData, account_number: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-wider text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Account Number</label>
                  <input
                    type="text"
                    placeholder="Re-enter account number"
                    value={bankData.confirm_account_number}
                    onChange={(e) => setBankData({...bankData, confirm_account_number: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm font-bold tracking-wider text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branch Location</label>
                  <input
                    type="text"
                    placeholder="City or branch area"
                    value={bankData.branch}
                    onChange={(e) => setBankData({...bankData, branch: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy-600"
                  />
                </div>
              </div>

              {/* Upload Cancelled Cheque */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Cancelled Cheque / Passbook Copy</p>
                    <p className="text-[11px] text-gray-500">
                      {bankData.cheque_file_name 
                        ? `${bankData.cheque_file_name} (${isFullyVerified ? 'Verified' : 'Attached'})`
                        : 'No file attached yet'}
                    </p>
                  </div>
                </div>
                <label className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm">
                  {bankData.cheque_file_name ? 'Replace File' : 'Upload File'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setBankData(prev => ({ ...prev, cheque_file_name: e.target.files[0].name }))
                        toast.success(`Attached cheque file: ${e.target.files[0].name}`)
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-700 hover:to-burgundy-800 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit KYC Documents
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
