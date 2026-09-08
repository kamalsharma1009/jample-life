import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2, ShieldCheck, CreditCard, Wallet, QrCode,
  ArrowRight, ArrowLeft, Loader2, Sparkles, AlertCircle, ShoppingBag
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { shippingAddressSchema } from '@/lib/validations'
import { createOrder } from '@/services/dbService'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const {
    items,
    getItemCount,
    getSubtotal,
    getTotalBv,
    getTotalPv,
    getShippingCost,
    getTotalAmount,
    clearCart,
  } = useCartStore()

  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(null)

  const walletBalance = profile?.wallet_balance ?? 0
  const subtotal = getSubtotal()
  const shippingCost = getShippingCost()
  const totalAmount = getTotalAmount()
  const totalBv = getTotalBv()
  const totalPv = getTotalPv()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: profile?.full_name || user?.user_metadata?.full_name || '',
      phone: profile?.phone || '',
      addressLine1: profile?.address || '',
      addressLine2: '',
      city: profile?.city || '',
      state: profile?.state || '',
      pincode: profile?.pincode || '',
    },
  })

  // Redirect if cart is empty and not already completed
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No items in cart to checkout</h2>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-jample-burgundy text-white font-bold text-xs shadow-md mt-4"
        >
          Return to Shop
        </Link>
      </div>
    )
  }

  // Handle order submission
  const onSubmitOrder = async (shippingData) => {
    if (paymentMethod === 'WALLET' && walletBalance < totalAmount) {
      alert(`Insufficient wallet balance. You have ${formatCurrency(walletBalance)} but order total is ${formatCurrency(totalAmount)}. Please select another payment method.`)
      return
    }

    setIsProcessing(true)

    try {
      const memberId = profile?.id || user?.id

      const createdOrder = await createOrder({
        member_id: memberId,
        payment_method: paymentMethod === 'WALLET' ? 'WALLET' : 'ONLINE',
        subtotal,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: totalAmount,
        total_pv: totalPv,
        total_bv: totalBv,
        shipping_name: shippingData.fullName,
        shipping_address: `${shippingData.addressLine1}${shippingData.addressLine2 ? ', ' + shippingData.addressLine2 : ''}`,
        shipping_city: shippingData.city,
        shipping_state: shippingData.state,
        shipping_pincode: shippingData.pincode,
        shipping_phone: shippingData.phone,
      }, items)

      // If paid via wallet, record the transaction in wallet_transactions
      if (paymentMethod === 'WALLET' && memberId) {
        const newBalance = Math.max(0, walletBalance - totalAmount)
        try {
          await supabase.from('wallet_transactions').insert([{
            member_id: memberId,
            transaction_type: 'ORDER_PAYMENT',
            amount: totalAmount,
            balance_after: newBalance,
            description: `Payment for Order #${createdOrder.order_number || 'NEW'}`,
            reference_id: createdOrder.order_number || null,
            status: 'COMPLETED'
          }])
        } catch (e) {
          console.warn('Could not record wallet transaction:', e)
        }
      }

      // Update personal volume on profile if memberId exists
      if (memberId) {
        try {
          await supabase
            .from('profiles')
            .update({
              personal_pv: (Number(profile?.personal_pv) || 0) + totalPv,
              personal_bv: (Number(profile?.personal_bv) || 0) + totalBv,
              wallet_balance: paymentMethod === 'WALLET' ? Math.max(0, walletBalance - totalAmount) : walletBalance
            })
            .eq('id', memberId)
        } catch (e) {
          console.warn('Could not update profile volumes:', e)
        }
      }

      const orderData = {
        orderNumber: createdOrder.order_number || `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: createdOrder.created_at || new Date().toISOString(),
        items: [...items],
        subtotal,
        shippingCost,
        totalAmount,
        totalBv,
        totalPv,
        paymentMethod,
        shippingAddress: shippingData,
      }

      setOrderComplete(orderData)
      clearCart()
    } catch (err) {
      console.error('Order submission error:', err)
      alert('Order failed: ' + (err.message || 'Please check your connection and try again.'))
    } finally {
      setIsProcessing(false)
    }
  }

  // ─────────────────────────────────────────────
  // SUCCESS SCREEN
  // ─────────────────────────────────────────────
  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm animate-in zoom-in duration-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-sm text-slate-500">
              Order Number: <strong className="font-mono text-slate-900">{orderComplete.orderNumber}</strong>
            </p>
          </div>

          {/* Volume credited box */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Volume Points Credited to Account:
            </div>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-xs text-slate-500 block">Personal PV Added</span>
                <span className="text-xl font-black text-jample-burgundy">+{orderComplete.totalPv} PV</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="text-xs text-slate-500 block">Business Volume (BV)</span>
                <span className="text-xl font-black text-emerald-700">+{orderComplete.totalBv} BV</span>
              </div>
            </div>
            <p className="text-[11px] text-amber-800">
              * This volume is recorded towards your weekly qualification and 13-level sponsor override commissions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-jample-burgundy text-white font-bold text-sm hover:bg-jample-burgundy/90 transition shadow"
            >
              View Order History
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // CHECKOUT FORM
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/cart" className="hover:text-jample-burgundy flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Secure Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={handleSubmit(onSubmitOrder)} className="lg:col-span-8 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-jample-burgundy text-white font-black text-sm flex items-center justify-center">
                1
              </div>
              <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                  placeholder="Recipient Name"
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 1 (House/Flat, Street)</label>
                <input
                  type="text"
                  {...register('addressLine1')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                  placeholder="Flat No, Building Name, Street"
                />
                {errors.addressLine1 && <p className="text-xs text-rose-600 mt-1">{errors.addressLine1.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Address Line 2 (Area, Landmark - Optional)</label>
                <input
                  type="text"
                  {...register('addressLine2')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                  placeholder="Landmark or locality"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                  placeholder="City"
                />
                {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    {...register('state')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                    placeholder="State"
                  />
                  {errors.state && <p className="text-xs text-rose-600 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    {...register('pincode')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-jample-burgundy focus:outline-none"
                    placeholder="6 digits"
                  />
                  {errors.pincode && <p className="text-xs text-rose-600 mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-8 h-8 rounded-full bg-jample-burgundy text-white font-black text-sm flex items-center justify-center">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'UPI'
                    ? 'border-jample-burgundy bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-jample-burgundy" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-jample-burgundy focus:ring-jample-burgundy"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">UPI / QR Code</h4>
                  <p className="text-[11px] text-slate-500">GPay, PhonePe, Paytm, BHIM</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'WALLET'
                    ? 'border-jample-burgundy bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WALLET"
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                    className="text-jample-burgundy focus:ring-jample-burgundy"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Wallet Balance</h4>
                  <p className="text-[11px] text-emerald-600 font-bold">Avail: {formatCurrency(walletBalance)}</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                  paymentMethod === 'CARD'
                    ? 'border-jample-burgundy bg-rose-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-jample-burgundy focus:ring-jample-burgundy"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Card / NetBanking</h4>
                  <p className="text-[11px] text-slate-500">All major banks supported</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-jample-burgundy hover:bg-jample-burgundy/90 text-white rounded-2xl text-sm font-black shadow-lg shadow-jample-burgundy/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Order &amp; Recording BV...
                </>
              ) : (
                <>
                  Pay {formatCurrency(totalAmount)} &amp; Confirm Order
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            </div>
          </form>

        {/* Right: Order Details Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-900">Order Items ({items.length})</h3>

          <div className="space-y-3 divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between pt-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-slate-400">Qty: {item.quantity} &bull; {item.pv * item.quantity} PV</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(item.dp * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Member DP)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges</span>
              <span>{shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
