<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { supabase } from '../lib/supabase'

const isLight = inject('isLight', ref(false))

const onlineCount = ref(1)
const footerText  = ref('')
const profileName = ref('')
const year        = new Date().getFullYear()

let presence = null

onMounted(async () => {
  // ── 1. Fetch profile name, footer_text ───────────────────────────────────
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, footer_text')
      .limit(1).single()
    if (data) {
      profileName.value = data.full_name  || ''
      footerText.value  = data.footer_text || ''
    }
  } catch { /* no profile yet */ }

  // ── 2. Supabase Realtime Presence — track online visitors ─────────────────
  const vid = sessionStorage.getItem('_svid') || crypto.randomUUID()
  sessionStorage.setItem('_svid', vid)

  presence = supabase.channel('site-online-users', {
    config: { presence: { key: vid } },
  })

  presence
    .on('presence', { event: 'sync' }, () => {
      const state = presence.presenceState()
      const count = Object.keys(state).length
      onlineCount.value = count > 0 ? count : 1
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presence.track({ ts: Date.now() })
      }
    })
})

onUnmounted(async () => {
  if (presence) {
    await presence.untrack()
    supabase.removeChannel(presence)
    presence = null
  }
})

</script>

<template>
  <footer
    :class="[
      'relative z-10 mt-auto',
      isLight
        ? 'bg-white/70 backdrop-blur-xl border-t border-slate-200/80'
        : 'bg-black/25 backdrop-blur-xl border-t border-white/8',
    ]"
  >

    <!-- ── Stats Bar ─────────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">

        <!-- Online users card -->
        <div
          :class="[
            'flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-medium transition-all duration-300',
            isLight
              ? 'bg-emerald-50 border-emerald-200/80 text-emerald-800 shadow-sm shadow-emerald-100'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-900/20',
          ]"
        >
          <!-- Animated pulse dot -->
          <span class="relative flex h-3 w-3 flex-shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm"></span>
          </span>
          <span class="flex items-baseline gap-1.5">
            <span
              :class="['text-2xl font-extrabold tabular-nums leading-none', isLight ? 'text-emerald-700' : 'text-emerald-300']"
            >{{ onlineCount }}</span>
            <span :class="['text-xs font-normal', isLight ? 'text-emerald-600/80' : 'text-emerald-400/80']">
              คนกำลังออนไลน์ขณะนี้
            </span>
          </span>
        </div>

      </div>
    </div>

    <!-- ── Copyright bar ─────────────────────────────────────────────────── -->
    <div
      :class="[
        'border-t',
        isLight ? 'border-slate-200/60 bg-white/30' : 'border-white/5 bg-black/10',
      ]"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
        <p :class="['text-xs', isLight ? 'text-slate-400' : 'text-slate-500']">
          {{
            footerText ||
            `© ${year} แฟ้มสะสมผลงานวิชาชีพ${profileName ? ' · ' + profileName : ''}`
          }}
        </p>
        <p :class="['text-xs flex items-center gap-1', isLight ? 'text-slate-300' : 'text-slate-600']">
          <span :class="['font-medium', isLight ? 'text-slate-400' : 'text-slate-500']">Dev © Winai Nunkratok</span>
        </p>
      </div>
    </div>

  </footer>
</template>
