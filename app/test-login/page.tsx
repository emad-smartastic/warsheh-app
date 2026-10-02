'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/post-job')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-right">
        <h1 className="text-xl font-bold mb-4">تسجيل دخول تجريبي / Test Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="test@warsheh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white py-2 rounded-lg font-bold"
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}