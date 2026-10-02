'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Quote {
  id: string
  amount_usd: number
  estimated_days: number
  notes: string
  status: string
  created_at: string
  provider_id: string
  profiles?: {
    full_name: string
    phone: string
  }
}

interface JobDetails {
  id: string
  title: string
  description: string
  district: string
  city: string
  budget_min_usd: number | null
  budget_max_usd: number | null
  status: string
  media_urls: string[] | null
  created_at: string
  categories?: {
    name_ar: string
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const router = useRouter()

  const [job, setJob] = useState<JobDetails | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadJobAndQuotes() {
      if (!jobId) return

      // 1. Fetch Job Post Details
      const { data: jobData } = await supabase
        .from('job_posts')
        .select('*, categories(name_ar)')
        .eq('id', jobId)
        .single()

      if (jobData) {
        setJob(jobData)
      }

      // 2. Fetch Quotes submitted for this Job
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*, profiles(full_name, phone)')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (quotesData) {
        setQuotes(quotesData as any)
      }

      setLoading(false)
    }

    loadJobAndQuotes()
  }, [jobId])

  // Accept a Craftsman's Quote
  const handleAcceptQuote = async (quoteId: string, providerId: string) => {
    if (!confirm('هل أنت أقتنعت بهذا العرض وتريد اعتماد المعلم لورشة العمل؟')) return

    setActionLoading(true)

    // 1. Update the accepted quote status to ACCEPTED
    await supabase
      .from('quotes')
      .update({ status: 'ACCEPTED' })
      .eq('id', quoteId)

    // 2. Reject all other quotes for this job
    await supabase
      .from('quotes')
      .update({ status: 'REJECTED' })
      .eq('job_id', jobId)
      .neq('id', quoteId)

    // 3. Mark the job post as IN_PROGRESS
    await supabase
      .from('job_posts')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', jobId)

    // Refresh state
    setJob((prev) => prev ? { ...prev, status: 'IN_PROGRESS' } : null)
    setQuotes((prev) =>
      prev.map((q) => ({
        ...q,
        status: q.id === quoteId ? 'ACCEPTED' : 'REJECTED',
      }))
    )

    setActionLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">جاري تحميل تفاصيل الورشة...</div>
  }

  if (!job) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">الطلب غير موجود</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 max-w-4xl mx-auto text-right">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/customer"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          ← العودة للوحة التحكم
        </Link>
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
          job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-900 border border-blue-200'
        }`}>
          {job.status === 'OPEN' ? 'مفتوح لتلقي العروض' : 'جاري التنفيذ'}
        </span>
      </div>

      {/* Job Info Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <span className="text-xs bg-blue-50 text-blue-900 font-bold px-2.5 py-1 rounded-full inline-block mb-3">
          {job.categories?.name_ar}
        </span>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{job.title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{job.description}</p>
        
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 border-t pt-3">
          <span>المنطقة: <strong>{job.district}</strong></span>
          <span>الميزانية: <strong>{job.budget_max_usd ? `$${job.budget_min_usd || 0} - $${job.budget_max_usd}` : 'حسب الاتفاق'}</strong></span>
          <span>التاريخ: <strong>{new Date(job.created_at).toLocaleDateString('ar-LB')}</strong></span>
        </div>

        {/* Attached Photos */}
        {job.media_urls && job.media_urls.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <span className="block text-xs font-bold text-slate-700 mb-2">الصور المرفقة:</span>
            <div className="flex gap-2 overflow-x-auto">
              {job.media_urls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt="Media" className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quotes Section */}
      <h2 className="text-xl font-bold text-blue-950 mb-4">
        عروض الأسعار المقدمة من المعلمية ({quotes.length})
      </h2>

      {quotes.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
          لم يتم تقديم أي عرض سعر من المعلمية على هذا الطلب حتى الآن
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              className={`bg-white p-6 rounded-2xl border transition shadow-sm ${
                quote.status === 'ACCEPTED'
                  ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {quote.profiles?.full_name || 'معلم حرفي'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    مدة التنفيذ: {quote.estimated_days} أيام
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-2xl font-black text-emerald-600 block">
                    ${quote.amount_usd}
                  </span>
                </div>
              </div>

              {quote.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
                  "{quote.notes}"
                </p>
              )}

              {/* Status or Accept Button */}
              <div className="flex justify-between items-center border-t pt-3">
                {quote.status === 'ACCEPTED' ? (
                  <div className="w-full flex justify-between items-center bg-emerald-100 p-3 rounded-xl border border-emerald-300">
                    <span className="text-xs font-bold text-emerald-900">
                      ✓ تم اعتماد هذا المعلم!
                    </span>
                    <a
                      href={`tel:${quote.profiles?.phone}`}
                      className="bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition"
                    >
                      اتصال بالمعلم ({quote.profiles?.phone})
                    </a>
                  </div>
                ) : quote.status === 'REJECTED' ? (
                  <span className="text-xs text-slate-400">غير معتمد</span>
                ) : (
                  <button
                    onClick={() => handleAcceptQuote(quote.id, quote.provider_id)}
                    disabled={actionLoading || job.status === 'IN_PROGRESS'}
                    className="w-full bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-amber-500 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'جاري الاعتماد...' : 'اعتماد العرض والتواصل مع المعلم'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}