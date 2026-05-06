// Service Worker — E-Portfolio PWA
const CACHE = 'e-portfolio-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()))

self.addEventListener('fetch', (e) => {
  const url = e.request.url
  // ข้ามคำขอที่ไม่ใช่ GET
  if (e.request.method !== 'GET') return
  // ข้าม Supabase API (cloud + local)
  if (url.includes('supabase.co')) return
  if (url.includes('127.0.0.1')) return
  if (url.includes('localhost')) return
  // ข้าม chrome-extension และ non-http
  if (!url.startsWith('http')) return

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // cache เฉพาะ static assets (png, svg, js, css, font)
        if (/\.(png|svg|js|css|woff2?)(\?.*)?$/.test(url)) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then((cached) => cached || Response.error()))
  )
})
