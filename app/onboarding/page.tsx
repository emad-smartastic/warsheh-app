'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER')
  const [district, setDistrict] = useState('Beirut')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const districts = [
    'Beirut (بيروت)',
    'Metn (المتن)',
    'Keserwan (كسروان)',
    'Aley (عاليه)',
    'Chouf (الرشوف)',
    'Baabda (بعبدا)',
    'Tripoli (طرابلس)',
    'Saida (صيدا)',
    'Zahle (زحلة)',
    'Byblos / Jbeil (جبيل)'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Update Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        role: role,
        district: district,
      })
      .eq('id', user.id)

    if (profileError) {
      alert(profileError.message)
      setLoading(false)
      return
    }

    // 2. If Provider, create Provider Profile record
    if (role === 'PROVIDER') {
      await supabase.from('provider_profiles').insert({
        id: user.id,
        business_name: businessName || fullName,
      })
      router.push('/provider/dashboard')
    } else {
      router.push('/customer/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-right">
        <h1 className="text-2xl font-bold text-blue-950 mb-2">إكمال الملف الشخصي / Complete Profile</h1>
        <p className="text-sm text-slate-500 mb-6">حدد نوع حسابك والمعلومات الأساسية</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نوع الحساب / Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-4 rounded-xl border text-center transition ${
                  role === 'CUSTOMER'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                🏠 صاحب بيت / زبون
                <span className="block text-xs font-normal mt-1 text-slate-500">Customer</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`p-4 rounded-xl border text-center transition ${
                  role === 'PROVIDER'
                    ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                🛠️ معلم / صاحب حرفة
                <span className="block text-xs font-normal mt-1 text-slate-500">M3allem / Provider</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الكامل / Full Name</label>
            <input
              type="text"
              required
              placeholder="مثال: جهاد خوري"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          {/* District / Region in Lebanon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المنطقة / District (Lebanon)</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Additional field for Providers */}
          {role === 'PROVIDER' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">اسم المحل أو الورشة / Business Name</label>
              <input
                type="text"
                placeholder="مثال: ورشة الخوري للصحية"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition"
          >
            {loading ? 'جاري الحفظ...' : 'متابعة إلى المنصة'}
          </button>
        </form>
      </div>
    </div>
  )
}