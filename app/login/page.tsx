'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  // 1. Send SMS OTP to Lebanese Phone Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Ensure Lebanese international country code formatting
    const formattedPhone = phone.startsWith('+') ? phone : `+961${phone.replace(/^0+/, '')}`

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('OTP')
    }
    setLoading(false)
  }

// Inside handleVerifyOtp:
if (!profile || profile.full_name === 'New User') {
  router.push('/onboarding')
} else if (profile.role === 'PROVIDER') {
  router.push('/provider/dashboard')
} else {
  router.push('/customer')
}

  // 2. Verify 6-digit Code & Redirect
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formattedPhone = phone.startsWith('+') ? phone : `+961${phone.replace(/^0+/, '')}`

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      setError('رمز التحقق غير صحيح / Invalid OTP code')
      setLoading(false)
      return
    }

    // Check if user has completed onboarding profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user?.id)
      .single()

    if (!profile || profile.full_name === 'New User') {
      router.push('/onboarding')
    } else if (profile.role === 'PROVIDER') {
      router.push('/provider/dashboard')
    } else {
      router.push('/customer/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-right">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-950 mb-1">وارشة</h1>
          <p className="text-sm text-slate-500">تسجيل الدخول عبر رقم الهاتف / Login with Phone</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                رقم الهاتف (لبنان) / Phone Number
              </label>
              <div className="flex dir-ltr">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-600 text-sm">
                  +961
                </span>
                <input
                  type="tel"
                  required
                  placeholder="70 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-slate-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق (SMS)'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                أدخل رمز التحقق (OTP) / Enter 6-digit Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-2xl px-3 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-500 transition disabled:opacity-50"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد الدخول'}
            </button>

            <button
              type="button"
              onClick={() => setStep('PHONE')}
              className="w-full text-xs text-slate-500 hover:text-slate-800 text-center block mt-2"
            >
              تغيير رقم الهاتف / Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}