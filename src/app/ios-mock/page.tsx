"use client";

import React, { useState } from "react";

const accent = "#007aff";

export default function IOSMockPage() {
  const [selected, setSelected] = useState<'inline'|'outline'>('inline');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <main className="min-h-screen w-full px-4 md:px-8 py-6 flex flex-col gap-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", WebkitFontSmoothing: 'antialiased' as any }}>
      {/* Large Title */}
      <div className="mt-2">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">iOS Style Mock</h1>
        <p className="text-sm text-black/60 mt-1">Preview of proposed iOS-inspired UI treatments</p>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-4">
        <div className="inline-flex p-1 rounded-2xl bg-black/5 backdrop-blur-md border border-black/10">
          {(['inline','outline'] as const).map(key => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-3 py-1.5 rounded-xl text-[13px] transition ${selected===key ? 'bg-white shadow-sm' : 'text-black/70 hover:text-black'}`}
              style={selected===key ? { border: '1px solid rgba(0,0,0,0.05)' } : {}}
            >
              {key === 'inline' ? 'Inline' : 'Outline'}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSheetOpen(true)}
          className="rounded-full px-4 py-2 shadow-sm transition"
          style={{ backgroundColor: accent, color: 'white' }}
        >
          Open Bottom Sheet
        </button>

        <button
          className="rounded-full px-4 py-2 transition"
          style={{ color: accent, backgroundColor: `${accent}1a` }}
        >
          Tinted Action
        </button>
      </div>

      {/* Cards / Surfaces */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-black/5 shadow-sm bg-white/80 backdrop-blur-md">
          <div className="p-4 border-b border-black/5">
            <h2 className="text-lg font-medium">Saved Timelines</h2>
          </div>
          <ul className="divide-y divide-black/5">
            {[{name:'Q1 Launch Plan', period:'2025-01-01 — 2025-03-31'}, {name:'Personal Goals', period:'2025-04-01 — 2025-06-30'}, {name:'Learning Path', period:'2025-07-01 — 2025-12-31'}].map((t,i)=> (
              <li key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-medium">{t.name}</div>
                  <div className="text-[13px] text-black/60">{t.period}</div>
                </div>
                <div className="text-black/30 text-xl">›</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-black/5 shadow-sm bg-white/80 backdrop-blur-md p-4">
          <h2 className="text-lg font-medium mb-3">New Activity</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] text-black/70 mb-1">Name</label>
              <input className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)', caretColor: '#111', accentColor: accent }} placeholder="Activity name" />
            </div>
            <div>
              <label className="block text-[13px] text-black/70 mb-1">Description</label>
              <textarea className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2" placeholder="Optional"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] text-black/70 mb-1">Start</label>
                <input type="date" className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-[13px] text-black/70 mb-1">End</label>
                <input type="date" className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 focus:outline-none focus:ring-2" />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="rounded-full px-4 py-2 shadow-sm" style={{ backgroundColor: accent, color: 'white' }}>Save</button>
              <button className="rounded-full px-4 py-2" style={{ color: accent, backgroundColor: `${accent}1a` }}>Cancel</button>
            </div>
          </div>
        </div>
      </section>

      {/* iOS-like timeline preview card */}
      <section className="rounded-2xl border border-black/5 shadow-sm bg-white/80 backdrop-blur-md p-4">
        <h2 className="text-lg font-medium mb-3">Timeline Preview ({selected})</h2>
        <div className="relative w-full overflow-hidden rounded-xl border border-black/5" style={{ height: 180 }}>
          <div className="absolute left-4 right-4 top-1/2 h-[2px]" style={{ backgroundColor: 'rgba(0,0,0,0.15)', transform: 'translateY(-50%)' }} />
          {[80, 200, 360, 520, 700].map((x,i)=> (
            <div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: x }}>
              <div className="relative">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.15)' }} />
              </div>
              <div className={`absolute left-1/2 w-px bg-black/10 ${i%2===0 ? 'top-[6px] h-9' : 'bottom-[6px] h-9'}`} style={{ transform: 'translateX(-50%)' }} />
              <div className={`absolute ${i%2===0 ? '-translate-y-[calc(100%+14px)]' : 'translate-y-[14px]'} -translate-x-1/2` }>
                <div className="rounded-2xl px-4 py-2 text-[15px] font-medium shadow-sm border border-black/5 bg-white/90">Activity</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-black/10 bg-white/95 backdrop-blur-md shadow-2xl p-4 animate-[sheet_250ms_ease-out]">
            <div className="mx-auto my-2 h-1.5 w-10 rounded-full bg-black/20" />
            <h3 className="text-lg font-semibold mb-2">Sheet Title</h3>
            <p className="text-[13px] text-black/70 mb-3">This is a bottom sheet mock. Use this pattern for filters or quick actions on mobile.</p>
            <div className="flex gap-3">
              <button className="rounded-full px-4 py-2 shadow-sm" style={{ backgroundColor: accent, color: 'white' }}>Primary</button>
              <button className="rounded-full px-4 py-2" style={{ color: accent, backgroundColor: `${accent}1a` }} onClick={()=>setSheetOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes sheet { from { transform: translateY(16px); opacity: .8; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </main>
  );
}
