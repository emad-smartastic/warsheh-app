'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CustomerDashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('job_posts')
          .select('*, categories(name_ar, name_en)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (data) setJobs(data)
      }
      setLoading(false)
    }
    loadUserJobs()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 max-w-5xl mx-auto text-right">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-blue-950">طلباتي والورش الفعالة</h1>
        <Link
          href="/post-job"
          className="bg-blue-900 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-blue-800 transition"
        >
          + أطلب معلم جديد
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">جاري تحميل الطلبات...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-600 mb-4">ليس لديك أي طلبات ورشة سابقة حتى الآن</p>
          <Link
            href="/post-job"
            className="inline-block bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-amber-500 transition"
          >
            إضافة أول طلب
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="inline-block bg-blue-50 text-blue-900 text-xs px-2.5 py-1 rounded-full font-bold mb-2">
                  {job.categories?.name_ar}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">{job.description}</p>
                <p className="text-xs text-slate-400 mt-1">المنطقة: {job.district} | الحالة: {job.status}</p>
              </div>

              <div className="text-left">
                {job.budget_max_usd && (
                  <span className="text-lg font-extrabold text-slate-900 block">
                    ${job.budget_min_usd || 0} - ${job.budget_max_usd}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {new Date(job.created_at).toLocaleDateString('ar-LB')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}