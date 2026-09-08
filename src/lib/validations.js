import { z } from 'zod'

// ─────────────────────────────────────────────────────────
// REUSABLE FIELD SCHEMAS
// ─────────────────────────────────────────────────────────

const mobileSchema = z
  .string()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(15, 'Mobile number must be at most 15 digits')
  .regex(/^[+]?[0-9]{10,15}$/, 'Invalid mobile number format')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const referralCodeSchema = z
  .string()
  .trim()
  .max(30, 'Referral code is too long')
  .regex(/^[A-Za-z0-9_-]*$/, 'Invalid referral code format (letters, numbers and hyphens only)')
  .optional()
  .or(z.literal(''))

// ─────────────────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const registerStep1Schema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  mobile: mobileSchema,
  password: passwordSchema,
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const registerStep2Schema = z.object({
  date_of_birth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
})

export const registerStep3Schema = z.object({
  referral_code: referralCodeSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

// ─────────────────────────────────────────────────────────
// PROFILE SCHEMAS
// ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  mobile: mobileSchema,
  date_of_birth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

// ─────────────────────────────────────────────────────────
// PRODUCT SCHEMAS (Admin)
// ─────────────────────────────────────────────────────────

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(2, 'Product name is required').max(200),
  short_description: z.string().max(500).optional(),
  full_description: z.string().optional(),
  category_id: z.string().uuid('Invalid category'),
  mrp: z.coerce.number().positive('MRP must be positive'),
  dp: z.coerce.number().positive('DP must be positive'),
  selling_price: z.coerce.number().positive('Selling price must be positive'),
  pv: z.coerce.number().min(0, 'PV cannot be negative').default(0),
  business_volume: z.coerce.number().min(0, 'Business volume cannot be negative').default(0),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  minimum_order_quantity: z.coerce.number().int().positive().default(1),
  maximum_order_quantity: z.coerce.number().int().positive().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
}).refine(data => data.dp <= data.mrp, {
  message: 'DP cannot be greater than MRP',
  path: ['dp'],
}).refine(data => data.selling_price <= data.mrp, {
  message: 'Selling price cannot be greater than MRP',
  path: ['selling_price'],
})

export const productCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required').max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  display_order: z.coerce.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

// ─────────────────────────────────────────────────────────
// ORDER SCHEMAS
// ─────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: mobileSchema,
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
})

export const checkoutSchema = z.object({
  shipping_address: z.object({
    full_name: z.string().min(2, 'Full name is required'),
    mobile: mobileSchema,
    street: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode'),
  }),
  payment_method: z.enum(['MANUAL', 'RAZORPAY', 'UPI', 'BANK_TRANSFER']).default('MANUAL'),
  notes: z.string().max(500).optional(),
})

// ─────────────────────────────────────────────────────────
// PAYOUT SCHEMAS
// ─────────────────────────────────────────────────────────

export const bankDetailsSchema = z.object({
  bank_account_holder: z.string().min(2, 'Account holder name is required').max(100),
  bank_name: z.string().min(2, 'Bank name is required').max(100),
  account_number: z.string().min(9, 'Invalid account number').max(20).regex(/^[0-9]+$/, 'Account number must be numeric'),
  ifsc: z.string().regex(/^[A-Z]{4}[0][A-Z0-9]{6}$/, 'Invalid IFSC code'),
  upi_id: z.string().optional(),
  preferred_method: z.enum(['BANK_TRANSFER', 'UPI']).default('BANK_TRANSFER'),
})

export const payoutRequestSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  settlement_item_id: z.string().uuid('Invalid settlement'),
  notes: z.string().max(200).optional(),
})

// ─────────────────────────────────────────────────────────
// KYC SCHEMAS
// ─────────────────────────────────────────────────────────

export const kycDocumentSchema = z.object({
  document_type: z.enum(['IDENTITY', 'ADDRESS', 'BANK', 'PHOTO']),
})

// ─────────────────────────────────────────────────────────
// ADMIN SCHEMAS
// ─────────────────────────────────────────────────────────

export const createNetworkSchema = z.object({
  network_name: z.string().min(2, 'Network name is required').max(100),
  network_code: z.string().min(2, 'Network code is required').max(20).regex(/^[A-Z0-9_]+$/, 'Network code must be uppercase letters, numbers, or underscores'),
})

export const createMemberSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Invalid email').toLowerCase(),
  mobile: mobileSchema,
  password: passwordSchema,
  referral_code: z.string().optional(),
  network_id: z.string().uuid('Invalid network').optional(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
  network_role: z.enum(['MEMBER', 'LEADER']).default('MEMBER'),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED']).default('ACTIVE'),
})

export const commissionRuleSchema = z.object({
  rule_type: z.enum(['LEVEL_INCOME', 'BDC', 'DIRECTOR_BONUS', 'EDUCATION_COMMISSION']),
  level: z.coerce.number().int().min(1).max(13).optional().nullable(),
  rate: z.coerce.number().min(0, 'Rate cannot be negative').max(100, 'Rate cannot exceed 100%'),
  active: z.boolean().default(true),
  reason: z.string().min(5, 'Please provide a reason for this change').max(500),
})

export const settlementActionSchema = z.object({
  settlement_id: z.string().uuid(),
  action: z.enum(['CLOSE', 'CALCULATE', 'REVIEW', 'FINALIZE', 'MAKE_PAYOUT_AVAILABLE', 'CANCEL']),
  reason: z.string().optional(),
})

export const payoutReviewSchema = z.object({
  payout_id: z.string().uuid(),
  action: z.enum(['APPROVE', 'REJECT', 'MARK_PAID']),
  reason: z.string().optional(),
  payment_reference: z.string().optional(),
}).refine(
  data => data.action !== 'REJECT' || (data.reason && data.reason.length >= 10),
  { message: 'Rejection reason must be at least 10 characters', path: ['reason'] }
).refine(
  data => data.action !== 'MARK_PAID' || (data.payment_reference && data.payment_reference.length >= 3),
  { message: 'Payment reference is required when marking as paid', path: ['payment_reference'] }
)

export const systemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  description: z.string().optional(),
})

export const rankSchema = z.object({
  rank_code: z.string().regex(/^[A-Z_]+$/, 'Rank code must be uppercase letters and underscores'),
  rank_name: z.string().min(2, 'Rank name is required').max(100),
  display_order: z.coerce.number().int().min(0),
  bonus_percentage: z.coerce.number().min(0).max(100),
  active: z.boolean().default(true),
  business_rule_note: z.string().optional(),
})

export const noticeSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  content: z.string().min(10, 'Content is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  audience: z.enum(['ALL', 'SPECIFIC_NETWORK', 'SPECIFIC_RANK', 'SPECIFIC_PLAN']).default('ALL'),
  audience_filter: z.any().optional(),
  start_date: z.string().optional(),
  expiry_date: z.string().optional(),
})

export const taskSchema = z.object({
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(10, 'Description is required'),
  type: z.enum(['PURCHASE', 'REFERRAL', 'PROFILE', 'ENGAGEMENT', 'CUSTOM']),
  reward_type: z.enum(['WALLET_CREDIT', 'PV', 'OTHER']),
  reward_amount: z.coerce.number().min(0),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  completion_criteria: z.any().optional(),
})
