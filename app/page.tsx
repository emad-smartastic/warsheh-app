import Link from 'next/link'

export default function HomePage() {
  const categories = [
    { code: 'CAT-01', en: 'Plumbing', ar: 'صحية / سنكرية', icon: '🔧' },
    { code: 'CAT-02', en: 'Electrical', ar: 'كهرباء', icon: '⚡' },
    { code: 'CAT-03', en: 'Painting', ar: 'طرش / دهان', icon: '🎨' },
    { code: 'CAT-04', en: 'Carpentry', ar: 'نجارة', icon: '🪚' },
    { code: 'CAT-05', en: 'Tiling', ar: 'بلاط / إعمار', icon: '🧱' },
    { code: 'CAT-06', en: 'HVAC', ar: 'تبريد / أدوات منزلية', icon: '❄️' },
    { code: 'CAT-07', en: 'Simple Fixes', ar: 'تصليحات سريعة', icon: '🔨' },
    { code: 'CAT-08', en: 'Full Renovation', ar: 'ورشة كاملة', icon: '🏠' },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Header Navigation */}
      <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-900">وارشة</span>
          <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Warsheh</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-blue-900">
            تسجيل الدخول / Login
          </Link>
          <Link href="/post-job" className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition">
            أطلب معلم / Post Job
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-blue-950 leading-tight mb-4">
          كل ورشتك بـ <span className="text-amber-600">app واحد</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-8">
          أسهل طريقة لتلاقي أفضل المعلمية والمهنيين لكل تصليحات بيتك في لبنان. أسعار شافة، تقييمات حقيقية، وتواصل مباشر.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link href="/post-job" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-600/20 text-center transition">
            عندي شغلة بالبيت (أطلب معلم)
          </Link>
          <Link href="/provider/register" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-center transition">
            أنا معلم / صاحب حرفة
          </Link>
        </div>
      </section>

      {/* Trade Categories Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-right">الخدمات المتاحة / Available Trades</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.code} className="p-5 bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center group">
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="font-bold text-slate-900 text-base">{cat.ar}</span>
              <span className="text-xs text-slate-500 font-medium">{cat.en}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-8 bg-white text-center text-xs text-slate-500">
        © 2026 Warsheh (وارشة). All rights reserved. Target Market: Lebanon.
      </footer>
    </main>
  )
}