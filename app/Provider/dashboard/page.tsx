'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface JobPost {
  id: string
  title: string
  description: string
  district: string
  city: string
  budget_min_usd: number | null
  budget_max_usd: number | null
  media_urls: string[] | null
  created_at: string
  categories: {
    name_ar: string
    name_en: string
    code: string
  }
}

export default function ProviderDashboard() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [categories, setCategories] = useState<any[]>([])

  // Quote Submission Modal State
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('1')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const supabase = createClient()

  const districts = [
    'ALL',
    'Beirut (بيروت)',
    'Metn (المتن)',
    'Keserwan (كسروان)',
    'Aley (عاليه)',
    'Chouf (الشوف)',
    'Baabda (بعبدا)',
    'Tripoli (طرابلس)',
    'Saida (صيدا)',
    'Zahle (زحلة)',
    'Byblos / Jbeil (جبيل)'
  ]

  // 1. Fetch Service Categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('code')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // 2. Fetch Open Job Posts based on filters
  useEffect(() => {
    async function fetchOpenJobs() {
      setLoading(true)
      let query = supabase
        .from('job_posts')
        .select('*, categories(name_ar, name_en, code)')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })

      if (selectedDistrict !== 'ALL') {
        query = query.eq('district', selectedDistrict)
      }

      if (selectedCategory !== 'ALL') {
        query = query.eq('category_id', selectedCategory)
      }

      const { data } = await query
      if (data) setJobs(data as any)
      setLoading(false)
    }

    fetchOpenJobs()
  }, [selectedDistrict, selectedCategory])

  // 3. Handle Submit Quote / Bid
  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob) return

    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError('يرجى تسجيل الدخول أولاً')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('quotes').insert({
      job_id: selectedJob.id,
      provider_id: user.id,
      amount_usd: parseFloat(quoteAmount),
      estimated_days: parseInt(estimatedDays, 10),
      notes: quoteNotes,
      status: 'PENDING'
    })

    if (error) {
      if (error.code === '23505') {
        setSubmitError('لقد قمت بتقديم عرض سعر على هذا الطلب سابقاً')
      } else {
        setSubmitError(error.message)
      }
    } else {
      setSubmitSuccess('تم تقديم العرض بنجاح!')
      setTimeout(() => {
        setSelectedJob(null)
        setSubmitSuccess(null)
        setQuoteAmount('')
        setQuoteNotes('')
      }, 1500)
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 max-w-6xl mx-auto text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950">فرص العمل والطلبات المتاحة</h1>
          <p className="text-sm text-slate-500 mt-1">تصفح طلبات الزبائن وقدم عروض أسعارك مباشرة</p>
        </div>

        <Link
          href="/"
          className="text-sm font-medium text-blue-900 border border-blue-900 px-4 py-2 rounded-xl hover:bg-blue-50 transition"
        >
          الرئيسية / Home
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">فلترة حسب المهنة / Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">جميع المهن (All Trades)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name_ar} ({cat.name_en})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">فلترة حسب المنطقة / District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="ALL">جميع المناطق في لبنان (All Lebanon)</option>
            {districts.filter(d => d !== 'ALL').map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Feed List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 font-medium">جاري البحث عن طلبات متاحة...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <p className="text-slate-600 font-bold mb-1">لا يوجد طلبات متاحة حالياً بهذه المواصفات</p>
          <p className="text-xs text-slate-400">جرب تغيير الفلاتر لمشاهدة طلبات في مناطق أو مهن أخرى</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-500 transition">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-amber-50 text-amber-900 border border-amber-200 text-xs px-2.5 py-1 rounded-full font-bold">
                    {job.categories?.name_ar}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(job.created_at).toLocaleDateString('ar-LB')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{job.title}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">{job.description}</p>

                {/* Media preview thumbnails */}
                {job.media_urls && job.media_urls.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {job.media_urls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noreferrer" className="block flex-shrink-0">
                        <img src={url} alt="Attachment" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">الميزانية المقترحة</span>
                  <span className="text-base font-extrabold text-blue-950">
                    {job.budget_max_usd ? `$${job.budget_min_usd || 0} - $${job.budget_max_usd}` : 'حسب الاتفاق'}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="bg-blue-900 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-800 transition"
                >
                  تقديم عرض سعر / Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-right shadow-xl relative">
            <h2 className="text-xl font-bold text-blue-950 mb-1">تقديم عرض سعر (Submit Quote)</h2>
            <p className="text-xs text-slate-500 mb-4">على الطلب: <span className="font-bold text-slate-800">{selectedJob.title}</span></p>

            {submitError && (
              <div className="mb-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mb-3 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSendQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المطلوب بالدولار ($ USD)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="مثال: 50"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مدة التنفيذ المتوقعة (بالأيام)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات العرض والخبرات المقترحة</label>
                <textarea
                  rows={3}
                  placeholder="اشرح العرض، الضمان المقدم، أو مواعيد الحضور..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-amber-500 transition disabled:opacity-50"
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال العرض الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-600 font-medium rounded-xl text-sm hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}