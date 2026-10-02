'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  code: string
  name_en: string
  name_ar: string
  icon_name: string
}

export default function PostJobPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [district, setDistrict] = useState('Beirut (بيروت)')
  const [city, setCity] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  // Hardcoded UI presentation details mapped by category code/name
  const categoryIcons: Record<string, string> = {
    'CAT-01': '🔧',
    'CAT-02': '⚡',
    'CAT-03': '🎨',
    'CAT-04': '🪚',
    'CAT-05': '🧱',
    'CAT-06': '❄️',
    'CAT-07': '🔨',
    'CAT-08': '🏠',
  }

  const districts = [
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

  // Fetch categories from database on load
  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase.from('categories').select('*').order('code')
      if (data && data.length > 0) {
        setCategories(data)
        setSelectedCategoryId(data[0].id) // Select first available category by default
      }
    }
    loadCategories()
  }, [])

  const uploadMediaFiles = async (userId: string): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data } = await supabase.storage
        .from('job-media')
        .upload(fileName, file)

      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('job-media')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Double check that we have a valid category ID
    let finalCategoryId = selectedCategoryId

    if (!finalCategoryId) {
      // Fallback query if categories weren't loaded in state yet
      const { data: catData } = await supabase.from('categories').select('id').limit(1).single()
      if (catData?.id) {
        finalCategoryId = catData.id
      } else {
        setError('يرجى اختيار نوع الخدمة')
        setLoading(false)
        return
      }
    }

    try {
      const mediaUrls = files.length > 0 ? await uploadMediaFiles(user.id) : []

      const { error: insertError } = await supabase
        .from('job_posts')
        .insert({
          customer_id: user.id,
          category_id: finalCategoryId,
          title: title,
          description: description,
          district: district,
          city: city || district,
          budget_min_usd: budgetMin ? parseFloat(budgetMin) : null,
          budget_max_usd: budgetMax ? parseFloat(budgetMax) : null,
          media_urls: mediaUrls,
          status: 'OPEN'
        })

      if (insertError) throw insertError

      router.push('/customer/dashboard')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إضافة الطلب')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-right">
        <h1 className="text-2xl font-bold text-blue-950 mb-1">طلب معلم / إضافة ورشة جديدة</h1>
        <p className="text-sm text-slate-500 mb-6">أختر نوع الخدمة وأدخل التفاصيل للتواصل مع أفضل المعلمية</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector Cards */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              1. اختر نوع الخدمة المطلوبة / Select Trade
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id
                const icon = categoryIcons[cat.code] || '🔨'
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-center flex flex-col items-center justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl mb-2">{icon}</span>
                    <span className={`font-bold text-sm block ${isSelected ? 'text-amber-950' : 'text-slate-900'}`}>
                      {cat.name_ar}
                    </span>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {cat.name_en}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">2. عنوان الطلب / Job Title</label>
            <input
              type="text"
              required
              placeholder="مثال: تصليح حنفية المطبخ / صيانة مكيف سبليت"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">3. الوصف والتفاصيل / Description</label>
            <textarea
              required
              rows={4}
              placeholder="اشرح المشكلة بالتفصيل، مواعيد العمل المناسبة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المنطقة / District</label>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">البلدية / المنطقة بالتحديد</label>
              <input
                type="text"
                placeholder="مثال: الحمرا / سن الفيل"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الميزانية المتوقعة بالدولار ($ USD)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="الحد الأدنى ($ Min)"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="الحد الأقصى ($ Max)"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">إرفاق صور أو فيديوهات للمشكلة</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100"
            />
            {files.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">تم اختيار {files.length} ملفات</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white font-bold py-3.5 rounded-xl hover:bg-amber-500 transition disabled:opacity-50"
          >
            {loading ? 'جاري رفع الصور ونشر الطلب...' : 'نشر الطلب الآن (Post Job)'}
          </button>
        </form>
      </div>
    </div>
  )
}