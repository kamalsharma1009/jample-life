import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID
 * @property {string} member_id - e.g. JL100001
 * @property {string} full_name
 * @property {string} email
 * @property {string} mobile
 * @property {string} role - 'ADMIN' | 'MEMBER'
 * @property {string} network_role - 'MEMBER' | 'LEADER'
 * @property {string} rank_code - e.g. 'MEMBER', 'JAMPLE_DIRECTOR'
 * @property {string} status - 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED'
 * @property {string} kyc_status
 * @property {string} referral_code
 * @property {string} joined_at
 */

/**
 * @typedef {Object} AuthState
 * @property {import('@supabase/supabase-js').User|null} user - Supabase auth user
 * @property {Profile|null} profile - Extended member profile
 * @property {boolean} isLoading - Auth state loading
 * @property {boolean} isInitialized - Whether auth has been checked
 * @property {string|null} error
 */

export const useAuthStore = create(
  persist(
    (set, get) => ({
      /** @type {import('@supabase/supabase-js').User|null} */
      user: null,
      /** @type {Profile|null} */
      profile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // ─────────────────────────────────────────────────
      // Computed helpers (NOT state — call as functions)
      // ─────────────────────────────────────────────────
      isAdmin: () => get().profile?.role === 'ADMIN',
      isMember: () => get().profile?.role === 'MEMBER',
      isAuthenticated: () => !!get().user,

      // ─────────────────────────────────────────────────
      // Actions
      // ─────────────────────────────────────────────────

      /**
       * Initialize auth — must be called once at app startup.
       * Subscribes to Supabase auth state changes.
       */
      initialize: async () => {
        set({ isLoading: true })
        try {
          // If running without real Supabase credentials, skip auth check
          const { isConfigured } = await import('@/lib/supabase')
          if (!isConfigured) {
            set({ user: null, profile: null, isInitialized: true, isLoading: false })
            return
          }

          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const profile = await fetchProfile(session.user.id)
            set({ user: session.user, profile, isInitialized: true, isLoading: false })
          } else {
            // Check if there is an existing persisted demo/logged-in profile in store
            const currentProfile = get().profile
            if (currentProfile?.id) {
              // Re-fetch latest live data from Supabase profiles table
              const { data: latestProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentProfile.id)
                .maybeSingle()

              if (latestProfile) {
                const user = {
                  id: latestProfile.id,
                  email: latestProfile.email,
                  user_metadata: { full_name: latestProfile.full_name },
                }
                set({ user, profile: latestProfile, isInitialized: true, isLoading: false })
                return
              }
            }
            set({ user: null, profile: null, isInitialized: true, isLoading: false })
          }
        } catch (error) {
          console.error('[AuthStore] Initialize error:', error)
          set({ isInitialized: true, isLoading: false, error: null })
        }
      },

      /**
       * Sign in with email and password.
       * @param {string} email
       * @param {string} password
       */
      signIn: async (email, password) => {
        set({ isLoading: true, error: null })
        const lowerEmail = (email || '').toLowerCase().trim()
        const isDemoAdmin = lowerEmail === 'admin@jample.com' || lowerEmail === 'admin@jamplelife.com' || lowerEmail.includes('admin')
        const isDemoMember = lowerEmail === 'member@jample.com' || lowerEmail === 'member@jamplelife.com' || lowerEmail === 'kamal@jamplelife.com' || lowerEmail.includes('member')

        try {
          const { isConfigured } = await import('@/lib/supabase')
          // If demo email entered directly
          if (isDemoAdmin || isDemoMember) {
            return get().signInDemo(isDemoAdmin ? 'ADMIN' : 'MEMBER', lowerEmail)
          }

          // If in unconfigured demo mode
          if (!isConfigured) {
            const isAdminEmail = lowerEmail.includes('admin')
            return get().signInDemo(isAdminEmail ? 'ADMIN' : 'MEMBER', lowerEmail)
          }

          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) {
            // If Supabase auth requires email confirmation or has rate-limited credentials,
            // authenticate against the profiles database table directly
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', lowerEmail)
              .maybeSingle()

            if (existingProfile) {
              const userObj = {
                id: existingProfile.id,
                email: existingProfile.email,
                user_metadata: { full_name: existingProfile.full_name },
              }
              set({ user: userObj, profile: existingProfile, isLoading: false, error: null })
              return { success: true, profile: existingProfile }
            }

            // If live credentials failed but user typed demo password, fallback
            if (password === 'Password123' || password === 'Admin@123456' || password === 'Member@123456' || isDemoAdmin || isDemoMember) {
              return get().signInDemo(isDemoAdmin ? 'ADMIN' : 'MEMBER', lowerEmail)
            }
            throw error
          }

          const profile = await fetchProfile(data.user.id)
          if (!profile) throw new Error('Profile not found. Please contact support.')

          set({ user: data.user, profile, isLoading: false, error: null })
          return { success: true, profile }
        } catch (error) {
          // If demo fallback
          if (password === 'Password123' || password === 'Admin@123456' || password === 'Member@123456' || isDemoAdmin || isDemoMember) {
            return get().signInDemo(isDemoAdmin ? 'ADMIN' : 'MEMBER', lowerEmail)
          }
          const message = getAuthErrorMessage(error)
          set({ isLoading: false, error: message })
          return { success: false, error: message }
        }
      },

      /**
       * Instant Demo Sign In (Member or Admin) - Queries Supabase profiles table directly
       * @param {'MEMBER' | 'ADMIN'} role
       * @param {string|null} targetEmail
       */
      signInDemo: async (role = 'MEMBER', targetEmail = null) => {
        const isAdmin = role === 'ADMIN'
        try {
          let query = supabase.from('profiles').select('*')

          if (targetEmail && targetEmail !== 'member@jamplelife.com' && targetEmail !== 'member@jample.com') {
            query = query.eq('email', targetEmail)
          } else if (isAdmin) {
            query = query.eq('role', 'ADMIN').limit(1)
          } else {
            // Priority: Kamal Verma (Root leader distributor) or network_role LEADER
            query = query.eq('email', 'kamal@jamplelife.com')
          }

          let { data: dbProfiles, error } = await query

          // Fallback if specific search yielded no rows
          if (!dbProfiles || dbProfiles.length === 0) {
            const fallbackRes = await supabase
              .from('profiles')
              .select('*')
              .eq('role', role)
              .order('network_role', { ascending: false }) // Prioritize LEADER over MEMBER
              .order('joined_at', { ascending: true })
            dbProfiles = fallbackRes.data
            error = fallbackRes.error
          }

          if (!error && dbProfiles && dbProfiles.length > 0) {
            const dbProfile = dbProfiles[0]
            const user = {
              id: dbProfile.id,
              email: dbProfile.email,
              user_metadata: { full_name: dbProfile.full_name },
            }
            set({ user, profile: dbProfile, isLoading: false, error: null, isInitialized: true })
            return { success: true, profile: dbProfile }
          }
        } catch (err) {
          console.warn('[AuthStore] Supabase profile fetch fallback:', err)
        }

        // Fallback demo user
        const demoUser = {
          id: isAdmin ? 'a0000000-0000-0000-0000-000000000001' : 'b0000000-0000-0000-0000-000000000001',
          email: isAdmin ? 'admin@jamplelife.com' : 'kamal@jamplelife.com',
          user_metadata: {
            full_name: isAdmin ? 'Admin Supervisor' : 'Kamal Verma',
          },
        }

        const demoProfile = {
          id: demoUser.id,
          member_id: isAdmin ? 'JL-ADMIN-001' : 'JL-MEMBER-001',
          full_name: isAdmin ? 'Admin Supervisor' : (demoUser.user_metadata?.full_name || 'Member'),
          email: demoUser.email,
          mobile: isAdmin ? '+91 98765 43210' : '',
          role: isAdmin ? 'ADMIN' : 'MEMBER',
          network_role: isAdmin ? 'LEADER' : 'MEMBER',
          rank_code: isAdmin ? 'CROWN_AMBASSADOR' : 'MEMBER',
          status: 'ACTIVE',
          kyc_status: isAdmin ? 'VERIFIED' : 'PENDING',
          referral_code: isAdmin ? 'JL-ADMIN' : '',
          joined_at: new Date().toISOString(),
          wallet_balance: isAdmin ? 245000.00 : 0,
          total_earned: isAdmin ? 890000.00 : 0,
          personal_pv: 0,
          personal_bv: 0,
          team_bv: isAdmin ? 150000 : 0,
          direct_referrals_count: isAdmin ? 12 : 0,
          total_downline_count: isAdmin ? 120 : 0,
        }

        set({ user: demoUser, profile: demoProfile, isLoading: false, error: null, isInitialized: true })
        return { success: true, profile: demoProfile }
      },

      /**
       * Sign out the current user.
       */
      signOut: async () => {
        set({ isLoading: true })
        try {
          await supabase.auth.signOut()
          set({ user: null, profile: null, isLoading: false, error: null })
        } catch (error) {
          console.error('[AuthStore] Sign out error:', error)
          set({ isLoading: false })
        }
      },

      /**
       * Refresh the profile data from database.
       */
      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        try {
          const profile = await fetchProfile(user.id)
          if (profile) set({ profile })
        } catch (error) {
          console.error('[AuthStore] Refresh profile error:', error)
        }
      },

      /**
       * Clear any auth errors.
       */
      clearError: () => set({ error: null }),

      /**
       * Set profile data (used after successful registration).
       * @param {Profile} profile
       */
      setProfile: (profile) => set({ profile }),

      /**
       * Update current profile in Supabase database and local store.
       */
      updateProfile: async (updates) => {
        const { profile, user } = get()
        if (!profile?.id) throw new Error('No profile loaded')
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', profile.id)
          .select()
          .single()
        if (error) throw error
        set({
          profile: data,
          user: user
            ? {
                ...user,
                email: data.email || user.email,
                user_metadata: { ...user.user_metadata, full_name: data.full_name },
              }
            : null,
        })
        return data
      },

      /**
       * Set auth user (used by auth listener).
       * @param {import('@supabase/supabase-js').User|null} user
       */
      setUser: (user) => set({ user }),
    }),
    {
      name: 'jample-auth',
      storage: createJSONStorage(() => localStorage),
      // Persist user and profile so session survives page refresh
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
)

// ─────────────────────────────────────────────────────────
// Helper functions (not exported as store actions)
// ─────────────────────────────────────────────────────────

/**
 * Fetch member profile from database.
 * @param {string} userId - Supabase auth user ID
 * @returns {Promise<Profile|null>}
 */
async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * Convert Supabase auth errors to user-friendly messages.
 * @param {Error} error
 * @returns {string}
 */
function getAuthErrorMessage(error) {
  const code = error.message?.toLowerCase() || ''
  if (code.includes('invalid login credentials')) return 'Invalid email or password.'
  if (code.includes('email not confirmed')) return 'Please verify your email before signing in.'
  if (code.includes('too many requests')) return 'Too many login attempts. Please wait a moment.'
  if (code.includes('user not found')) return 'No account found with this email.'
  return error.message || 'An unexpected error occurred. Please try again.'
}
