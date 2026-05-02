import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLE = 'kudo_ren_works'

const TYPES = ['小説', '漫画', 'Webtoon', 'アニメ', '映画', 'その他']

const STATUSES = ['気になる', '鑑賞中', '鑑賞済']

const STATUS_PALETTE = {
  '気になる': { bg: 'rgba(232,130,154,0.13)', text: '#B05070', border: 'rgba(232,130,154,0.42)', dot: '#E8829A' },
  '鑑賞中':   { bg: 'rgba(107,168,95,0.13)',  text: '#3D6E35', border: 'rgba(107,168,95,0.42)',  dot: '#6BA85F' },
  '鑑賞済':   { bg: 'rgba(78,138,66,0.13)',   text: '#2D5A27', border: 'rgba(78,138,66,0.42)',   dot: '#4E8A42' },
}

const TYPE_PALETTE = {
  '小説':    { bg: 'rgba(232,130,154,0.1)',  text: '#A05070', border: 'rgba(232,130,154,0.32)' },
  '漫画':    { bg: 'rgba(107,168,95,0.1)',   text: '#3D6E35', border: 'rgba(107,168,95,0.32)'  },
  'Webtoon': { bg: 'rgba(152,200,140,0.12)', text: '#4A7E42', border: 'rgba(152,200,140,0.38)' },
  'アニメ':  { bg: 'rgba(244,184,200,0.15)', text: '#C06080', border: 'rgba(244,184,200,0.42)' },
  '映画':    { bg: 'rgba(60,110,52,0.1)',    text: '#2D5A27', border: 'rgba(60,110,52,0.32)'   },
  'その他':  { bg: 'rgba(168,208,158,0.12)', text: '#4E8A42', border: 'rgba(168,208,158,0.38)' },
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const S = {
  sectionCard: {
    background: '#F8FCF6',
    border: '1px solid rgba(107,168,95,0.38)',
    borderRadius: 6,
    boxShadow: '2px 2px 12px rgba(45,90,39,0.07), inset 0 0 0 1px rgba(107,168,95,0.07)',
    marginBottom: 16,
    padding: '20px 22px',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #E8829A, #C4607A)',
    border: '1px solid rgba(232,130,154,0.6)',
    borderRadius: 20,
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: 14,
    letterSpacing: '0.05em',
    padding: '8px 22px',
    transition: 'all 0.2s',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid rgba(107,168,95,0.5)',
    borderRadius: 20,
    color: '#4E8A42',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: 14,
    padding: '8px 22px',
    transition: 'all 0.2s',
  },
  fieldInput: {
    background: '#F8FCF6',
    border: '1px solid rgba(107,168,95,0.45)',
    borderRadius: 4,
    color: '#2D5A27',
    fontFamily: 'Georgia, serif',
    fontSize: 14,
    outline: 'none',
    padding: '8px 12px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
  },
}

// ─── Lotus Flower SVG ─────────────────────────────────────────────────────────

function LotusFlower({ size = 60 }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
      {/* Water ripple */}
      <ellipse cx="50" cy="88" rx="30" ry="6" fill="rgba(107,168,95,0.15)" />

      {/* Stem */}
      <path d="M50 85 Q48 72 50 60" stroke="#6BA85F" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Left leaf */}
      <path d="M50 75 Q34 68 28 56 Q38 58 50 68" fill="#7ABD6E" opacity="0.85" />
      {/* Left leaf vein */}
      <path d="M50 75 Q38 64 28 56" stroke="#5A9E50" strokeWidth="0.7" fill="none" opacity="0.6" />

      {/* Right leaf */}
      <path d="M50 75 Q66 68 72 56 Q62 58 50 68" fill="#7ABD6E" opacity="0.85" />
      {/* Right leaf vein */}
      <path d="M50 75 Q62 64 72 56" stroke="#5A9E50" strokeWidth="0.7" fill="none" opacity="0.6" />

      {/* Outer petals (5) */}
      <path d="M50 60 Q38 48 36 32 Q46 40 50 55" fill="#F4B8C8" />
      <path d="M50 60 Q62 48 64 32 Q54 40 50 55" fill="#F4B8C8" />
      <path d="M50 60 Q30 52 22 38 Q36 44 50 58" fill="#EFA0B8" />
      <path d="M50 60 Q70 52 78 38 Q64 44 50 58" fill="#EFA0B8" />
      <path d="M50 60 Q28 60 18 50 Q32 52 50 62" fill="#F4B8C8" />
      <path d="M50 60 Q72 60 82 50 Q68 52 50 62" fill="#F4B8C8" />

      {/* Inner petals (3) */}
      <path d="M50 60 Q42 50 42 38 Q48 45 50 58" fill="#E8829A" />
      <path d="M50 60 Q58 50 58 38 Q52 45 50 58" fill="#E8829A" />
      <path d="M50 60 Q50 46 50 34 Q50 46 50 58" fill="#DC6A88" />

      {/* Center */}
      <circle cx="50" cy="54" r="7" fill="#F9D76E" />
      <circle cx="50" cy="54" r="4" fill="#F0C040" />
      {/* Stamen dots */}
      <circle cx="50" cy="51" r="1.2" fill="#D4A020" />
      <circle cx="53" cy="53" r="1.2" fill="#D4A020" />
      <circle cx="47" cy="53" r="1.2" fill="#D4A020" />
      <circle cx="52" cy="56" r="1.2" fill="#D4A020" />
      <circle cx="48" cy="56" r="1.2" fill="#D4A020" />
    </svg>
  )
}

// ─── Small Lotus Bud (for decorative use) ────────────────────────────────────

function LotusBud({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 20 Q10 16 12 10" stroke="#6BA85F" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16 Q8 13 7 9 Q11 11 12 15"  fill="#7ABD6E" opacity="0.8" />
      <path d="M12 16 Q16 13 17 9 Q13 11 12 15" fill="#7ABD6E" opacity="0.8" />
      <path d="M12 14 Q9 10 9 5 Q12 9 12 13"  fill="#F4B8C8" />
      <path d="M12 14 Q15 10 15 5 Q12 9 12 13" fill="#F4B8C8" />
      <path d="M12 14 Q12 8 12 4 Q12 9 12 13"  fill="#E8829A" />
      <circle cx="12" cy="13" r="2.5" fill="#F9D76E" />
    </svg>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ value = 0, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            color: n <= active ? '#E8829A' : '#C8E0C2',
            cursor: onChange ? 'pointer' : 'default',
            display: 'inline-block',
            fontSize: size,
            lineHeight: 1,
            textShadow: n <= active ? '0 0 6px rgba(232,130,154,0.4)' : 'none',
            transform: hovered === n ? 'scale(1.28)' : 'scale(1)',
            transition: 'all 0.12s',
          }}
        >✿</span>
      ))}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = status || '気になる'
  const c = STATUS_PALETTE[s] || STATUS_PALETTE['気になる']
  return (
    <span style={{
      alignItems: 'center',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      color: c.text,
      display: 'inline-flex',
      fontSize: 11,
      fontWeight: 'bold',
      gap: 4,
      letterSpacing: '0.04em',
      padding: '2px 9px',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ background: c.dot, borderRadius: '50%', display: 'inline-block', height: 6, width: 6 }} />
      {s}
    </span>
  )
}

// ─── Status Selector ──────────────────────────────────────────────────────────

function StatusSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {STATUSES.map(s => {
        const c = STATUS_PALETTE[s]
        const active = value === s
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            style={{
              background: active ? c.bg : 'transparent',
              border: `1px solid ${active ? c.border : 'rgba(107,168,95,0.35)'}`,
              borderRadius: 10,
              color: active ? c.text : '#4E8A42',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'Georgia, serif',
              padding: '4px 13px',
              transition: 'all 0.15s',
            }}
          >{s}</button>
        )
      })}
    </div>
  )
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const c = TYPE_PALETTE[type] || TYPE_PALETTE['その他']
  return (
    <span style={{
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      color: c.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: '0.05em',
      padding: '2px 9px',
      whiteSpace: 'nowrap',
    }}>{type}</span>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider({ label }) {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 10, margin: '20px 0 12px' }}>
      <div style={{ background: 'linear-gradient(to right, transparent, rgba(107,168,95,0.45))', flex: 1, height: 1 }} />
      <LotusBud size={16} />
      {label && (
        <span style={{ color: '#6BA85F', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
      <LotusBud size={16} />
      <div style={{ background: 'linear-gradient(to left, transparent, rgba(107,168,95,0.45))', flex: 1, height: 1 }} />
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        color: '#4E8A42',
        display: 'block',
        fontSize: 10,
        letterSpacing: '0.12em',
        marginBottom: 5,
        textTransform: 'uppercase',
      }}>{label}</label>
      {children}
      {error && (
        <div style={{ color: '#E8829A', fontSize: 11, marginTop: 3 }}>{error}</div>
      )}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader({ title, onBack, action }) {
  return (
    <header style={{
      alignItems: 'center',
      background: 'linear-gradient(135deg, #3A6E30 0%, #5A9A4E 50%, #3A6E30 100%)',
      borderBottom: '3px solid rgba(232,130,154,0.7)',
      boxShadow: '0 2px 16px rgba(45,90,39,0.3)',
      display: 'flex',
      gap: 12,
      padding: '14px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Art Nouveau corner — leaf curl left */}
      <div style={{
        borderRight: '1px solid rgba(232,130,154,0.3)',
        borderBottom: '1px solid rgba(232,130,154,0.3)',
        borderBottomRightRadius: '50%',
        bottom: 4,
        height: 18,
        left: 0,
        position: 'absolute',
        width: 18,
      }} />
      {/* Art Nouveau corner — leaf curl right */}
      <div style={{
        borderLeft: '1px solid rgba(232,130,154,0.3)',
        borderBottom: '1px solid rgba(232,130,154,0.3)',
        borderBottomLeftRadius: '50%',
        bottom: 4,
        height: 18,
        position: 'absolute',
        right: 0,
        width: 18,
      }} />

      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid rgba(232,130,154,0.5)',
            borderRadius: 20,
            color: '#F4B8C8',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '5px 11px',
            transition: 'all 0.2s',
          }}
        >←</button>
      )}
      <h1 style={{
        color: '#F2FAF0',
        flex: 1,
        fontFamily: 'Georgia, serif',
        fontSize: 19,
        fontWeight: 'normal',
        letterSpacing: '0.12em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: '0 1px 6px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}>{title}</h1>
      {action}
    </header>
  )
}

// ─── Tag Filter Pill ──────────────────────────────────────────────────────────

function TagFilterPill({ tag, active, onToggle }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active
          ? (hovered ? '#4E8A42' : '#6BA85F')
          : (hovered ? 'rgba(107,168,95,0.12)' : '#F8FCF6'),
        border: `1px solid ${active ? '#6BA85F' : 'rgba(107,168,95,0.45)'}`,
        borderRadius: 14,
        boxShadow: hovered ? '0 2px 6px rgba(107,168,95,0.25)' : 'none',
        color: active ? '#fff' : '#2D5A27',
        cursor: 'pointer',
        fontFamily: 'Georgia, serif',
        fontSize: 12,
        fontWeight: active ? 'bold' : 'normal',
        padding: '4px 14px',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >{tag}</button>
  )
}

// ─── Work Card ────────────────────────────────────────────────────────────────

function WorkCard({ work, onClick, delay }) {
  const [hovered, setHovered] = useState(false)
  const tags = work.tags || []

  return (
    <div
      className="card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        background: '#F8FCF6',
        border: `1px solid ${hovered ? 'rgba(232,130,154,0.6)' : 'rgba(107,168,95,0.35)'}`,
        borderRadius: 8,
        boxShadow: hovered
          ? '3px 3px 18px rgba(45,90,39,0.14), inset 0 0 0 1px rgba(232,130,154,0.12)'
          : '2px 2px 8px rgba(45,90,39,0.07)',
        cursor: 'pointer',
        overflow: 'hidden',
        padding: '16px 18px',
        position: 'relative',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Corner lotus bud ornament */}
      <div style={{
        position: 'absolute',
        right: 8,
        top: 8,
        opacity: hovered ? 0.9 : 0.45,
        transition: 'opacity 0.2s',
      }}>
        <LotusBud size={20} />
      </div>

      <div style={{ alignItems: 'flex-start', display: 'flex', gap: 8, marginBottom: 8 }}>
        <h2 style={{
          color: '#2D5A27',
          flex: 1,
          fontFamily: 'Georgia, serif',
          fontSize: 15,
          fontWeight: 'bold',
          lineHeight: 1.35,
          paddingRight: 20,
        }}>{work.title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          {work.type && <TypeBadge type={work.type} />}
          <StatusBadge status={work.status} />
        </div>
      </div>

      {work.rating > 0 && (
        <div style={{ marginBottom: 6 }}>
          <Stars value={work.rating} size={15} />
        </div>
      )}

      {work.impression && (
        <p style={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          color: '#4E8A42',
          display: '-webkit-box',
          fontStyle: 'italic',
          fontSize: 12,
          lineHeight: 1.65,
          overflow: 'hidden',
          marginBottom: tags.length ? 10 : 0,
        }}>"{work.impression}"</p>
      )}

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {tags.length > 4 && (
            <span style={{ color: '#6BA85F', fontSize: 11 }}>+{tags.length - 4}</span>
          )}
        </div>
      )}

      <div style={{ color: '#7ABD6E', fontSize: 10, marginTop: 10, opacity: 0.8 }}>
        {new Date(work.created_at).toLocaleDateString('ja-JP')}
      </div>
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

function ListView({ onSelect, onAdd }) {
  const [works, setWorks]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [filterType, setFilter]         = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])

  useEffect(() => { fetchWorks() }, [])

  async function fetchWorks() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    setLoading(false)
    if (error) setError(error.message)
    else setWorks(data || [])
  }

  const allTags = useMemo(
    () => [...new Set(works.flatMap(w => w.tags ?? []))].sort(),
    [works]
  )

  const filtered = useMemo(() =>
    works
      .filter(w => filterType   === 'all' || w.type === filterType)
      .filter(w => filterStatus === 'all' || (w.status || '気になる') === filterStatus)
      .filter(w => selectedTags.length === 0 || selectedTags.every(t => w.tags?.includes(t))),
    [works, filterType, filterStatus, selectedTags]
  )

  const toggleTag = (tag) =>
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )

  return (
    <div style={{ background: '#F2FAF0', minHeight: '100vh' }}>
      <PageHeader
        title="🪷 鑑賞録"
        action={
          <button
            onClick={onAdd}
            style={{
              background: 'rgba(232,130,154,0.2)',
              border: '1px solid rgba(232,130,154,0.55)',
              borderRadius: 20,
              color: '#F4E8EC',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: 13,
              letterSpacing: '0.04em',
              padding: '7px 16px',
              transition: 'all 0.2s',
            }}
          >＋ 記録する</button>
        }
      />

      {/* Status filter */}
      <div style={{
        background: '#F8FCF6',
        borderBottom: '1px solid rgba(107,168,95,0.18)',
        display: 'flex',
        gap: 6,
        overflowX: 'auto',
        padding: '10px 18px',
      }}>
        {['all', ...STATUSES].map(s => {
          const active = filterStatus === s
          const c = s !== 'all' ? STATUS_PALETTE[s] : null
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                alignItems: 'center',
                background: active ? (c ? c.bg : 'rgba(107,168,95,0.14)') : 'transparent',
                border: `1px solid ${active ? (c ? c.border : '#6BA85F') : 'rgba(107,168,95,0.3)'}`,
                borderRadius: 12,
                color: active ? (c ? c.text : '#2D5A27') : '#4E8A42',
                cursor: 'pointer',
                display: 'inline-flex',
                fontFamily: 'Georgia, serif',
                fontSize: 12,
                gap: 5,
                padding: '4px 13px',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {c && <span style={{ background: c.dot, borderRadius: '50%', display: 'inline-block', height: 6, width: 6 }} />}
              {s === 'all' ? 'すべて' : s}
            </button>
          )
        })}
      </div>

      {/* Type filter tabs */}
      <div style={{
        background: '#F8FCF6',
        borderBottom: '1px solid rgba(107,168,95,0.2)',
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        padding: '6px 18px 0',
      }}>
        {['all', ...TYPES].map(t => {
          const active = filterType === t
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                background: active ? 'rgba(107,168,95,0.1)' : 'none',
                border: 'none',
                borderBottom: active ? '2px solid #E8829A' : '2px solid transparent',
                color: active ? '#2D5A27' : '#6BA85F',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 12,
                padding: '7px 14px',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >{t === 'all' ? 'すべて' : t}</button>
          )
        })}
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div style={{
          background: '#F8FCF6',
          borderBottom: '1px solid rgba(107,168,95,0.15)',
          padding: '10px 18px',
        }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
            <LotusBud size={14} />
            <span style={{ color: '#4E8A42', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              タグ
            </span>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                style={{
                  background: 'none',
                  border: '1px solid rgba(107,168,95,0.4)',
                  borderRadius: 10,
                  color: '#4E8A42',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: 10,
                  padding: '1px 10px',
                }}
              >× クリア</button>
            )}
            {selectedTags.length > 0 && (
              <span style={{ color: '#6BA85F', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11 }}>
                {filtered.length} 件
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {allTags.map(tag => (
              <TagFilterPill
                key={tag}
                tag={tag}
                active={selectedTags.includes(tag)}
                onToggle={() => toggleTag(tag)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ margin: '0 auto', maxWidth: 960, padding: '22px 16px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 70 }}>
            <div className="spinner" />
          </div>
        )}

        {error && (
          <div style={{
            background: '#FDF2F5',
            border: '1px solid rgba(232,130,154,0.35)',
            borderRadius: 6,
            color: '#B05070',
            fontSize: 13,
            padding: '10px 14px',
          }}>⚠ {error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <LotusFlower size={100} />
            <p style={{ color: '#6BA85F', fontStyle: 'italic', marginTop: 16, opacity: 0.8 }}>
              {filterType === 'all' ? 'まだ記録がありません' : `${filterType}の記録がありません`}
            </p>
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
        }}>
          {filtered.map((work, i) => (
            <WorkCard
              key={work.id}
              work={work}
              onClick={() => onSelect(work)}
              delay={i * 35}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add View ─────────────────────────────────────────────────────────────────

function AddView({ onBack, onAdded }) {
  const [form, setForm] = useState({
    title: '', type: '', status: '気になる', rating: 0, impression: '',
    tags: '', characters: '', structure: '', ideas: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'タイトルは必須です'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const tags = form.tags
      ? form.tags.split(/[,、\s]+/).map(t => t.trim()).filter(Boolean)
      : []
    const { error } = await supabase.from(TABLE).insert([{
      title:      form.title.trim(),
      type:       form.type       || null,
      status:     form.status,
      rating:     form.rating     || null,
      impression: form.impression.trim() || null,
      tags,
      characters: form.characters.trim() || null,
      structure:  form.structure.trim()  || null,
      ideas:      form.ideas.trim()      || null,
    }])
    setSaving(false)
    if (!error) onAdded()
  }

  const fi = (hasErr) => ({
    ...S.fieldInput,
    borderColor: hasErr ? '#E8829A' : 'rgba(107,168,95,0.45)',
  })

  return (
    <div style={{ background: '#F2FAF0', minHeight: '100vh' }}>
      <PageHeader title="🪷 新しい記録" onBack={onBack} />
      <form onSubmit={handleSubmit} style={{ margin: '0 auto', maxWidth: 620, padding: '24px 16px' }}>

        <div style={{ ...S.sectionCard }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 16 }}>
            <LotusBud size={16} />
            <span style={{ color: '#4E8A42', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              基本情報
            </span>
          </div>

          <Field label="タイトル *" error={errors.title}>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="作品タイトル"
              style={fi(errors.title)}
            />
          </Field>

          <Field label="ステータス">
            <StatusSelector value={form.status} onChange={v => set('status', v)} />
          </Field>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <Field label="タイプ">
              <select value={form.type} onChange={e => set('type', e.target.value)} style={fi(false)}>
                <option value="">選択...</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="評価">
              <div style={{ paddingTop: 7 }}>
                <Stars value={form.rating} onChange={v => set('rating', v)} size={26} />
              </div>
            </Field>
          </div>

          <Field label="感想">
            <textarea
              value={form.impression}
              onChange={e => set('impression', e.target.value)}
              placeholder="作品への感想、印象..."
              style={{ ...fi(false), minHeight: 100 }}
            />
          </Field>

          <Field label="タグ（カンマ区切り）">
            <input
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="ファンタジー, 恋愛, 感動"
              style={fi(false)}
            />
          </Field>
        </div>

        <Divider label="任意項目" />

        <div style={S.sectionCard}>
          <Field label="キャラクター">
            <textarea
              value={form.characters}
              onChange={e => set('characters', e.target.value)}
              placeholder="印象的なキャラクターについて..."
              style={fi(false)}
            />
          </Field>
          <Field label="構成・構造">
            <textarea
              value={form.structure}
              onChange={e => set('structure', e.target.value)}
              placeholder="物語の構成、展開について..."
              style={fi(false)}
            />
          </Field>
          <Field label="着想・アイデア">
            <textarea
              value={form.ideas}
              onChange={e => set('ideas', e.target.value)}
              placeholder="インスパイアされたこと、着想..."
              style={fi(false)}
            />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" onClick={onBack} style={S.cancelBtn}>キャンセル</button>
          <button
            type="submit"
            disabled={saving}
            style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }}
          >{saving ? '保存中...' : '🪷 記録を保存'}</button>
        </div>
      </form>
    </div>
  )
}

// ─── Detail View ──────────────────────────────────────────────────────────────

function DetailView({ work, onBack }) {
  const [form, setForm] = useState({
    title:      work.title      || '',
    type:       work.type       || '',
    status:     work.status     || '気になる',
    rating:     work.rating     || 0,
    impression: work.impression || '',
    tags:       (work.tags || []).join(', '),
    characters: work.characters || '',
    structure:  work.structure  || '',
    ideas:      work.ideas      || '',
  })
  const [saving, setSaving]       = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [showEdit, setShowEdit]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    setSaving(true)
    const tags = form.tags
      ? form.tags.split(/[,、\s]+/).map(t => t.trim()).filter(Boolean)
      : []
    const { error } = await supabase.from(TABLE).update({
      title:      form.title.trim(),
      type:       form.type       || null,
      status:     form.status,
      rating:     form.rating     || null,
      impression: form.impression.trim() || null,
      tags,
      characters: form.characters.trim() || null,
      structure:  form.structure.trim()  || null,
      ideas:      form.ideas.trim()      || null,
    }).eq('id', work.id)
    setSaving(false)
    if (!error) {
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2200)
    } else {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2200)
    }
  }

  const fi = { ...S.fieldInput, lineHeight: '1.75' }

  const savedLabel =
    saveState === 'saved' ? '✓ 保存済み' :
    saveState === 'error' ? '✗ エラー'   :
    saving               ? '保存中...'   : '保存する'

  const tagList = form.tags
    ? form.tags.split(/[,、\s]+/).map(t => t.trim()).filter(Boolean)
    : []

  return (
    <div style={{ background: '#F2FAF0', minHeight: '100vh' }}>
      <PageHeader
        title={`🪷 ${form.title || work.title}`}
        onBack={onBack}
        action={
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...S.saveBtn,
              fontSize: 13,
              opacity: saving ? 0.75 : 1,
              background: saveState === 'saved'
                ? 'linear-gradient(135deg, #5A9A4E, #3A6E30)'
                : S.saveBtn.background,
            }}
          >{savedLabel}</button>
        }
      />

      <div style={{ margin: '0 auto', maxWidth: 640, padding: '24px 16px' }}>

        {/* Hero card */}
        <div style={{
          ...S.sectionCard,
          background: 'linear-gradient(150deg, #F8FCF6 0%, #EEF8EA 100%)',
          borderColor: 'rgba(232,130,154,0.35)',
        }}>
          <div style={{ alignItems: 'flex-start', display: 'flex', gap: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <LotusFlower size={60} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {form.type && <TypeBadge type={form.type} />}
                <StatusBadge status={form.status} />
                <span style={{ color: '#7ABD6E', fontSize: 11 }}>
                  {new Date(work.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <Stars value={form.rating} onChange={v => set('rating', v)} size={24} />
            </div>
          </div>

          <button
            onClick={() => setShowEdit(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: '#4E8A42',
              cursor: 'pointer',
              fontSize: 11,
              letterSpacing: '0.08em',
              marginTop: 12,
              padding: 0,
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
            }}
          >{showEdit ? '▲ 基本情報を閉じる' : '▼ 基本情報を編集'}</button>

          {showEdit ? (
            <div style={{ borderTop: '1px solid rgba(107,168,95,0.25)', marginTop: 10, paddingTop: 14 }}>
              <Field label="タイトル">
                <input value={form.title} onChange={e => set('title', e.target.value)} style={fi} />
              </Field>
              <Field label="ステータス">
                <StatusSelector value={form.status} onChange={v => set('status', v)} />
              </Field>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <Field label="タイプ">
                  <select value={form.type} onChange={e => set('type', e.target.value)} style={fi}>
                    <option value="">未設定</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="タグ（カンマ区切り）">
                  <input value={form.tags} onChange={e => set('tags', e.target.value)} style={fi} placeholder="タグ..." />
                </Field>
              </div>
              <Field label="評価">
                <div style={{ paddingTop: 6 }}>
                  <Stars value={form.rating} onChange={v => set('rating', v)} size={24} />
                </div>
              </Field>
              <Field label="感想">
                <textarea value={form.impression} onChange={e => set('impression', e.target.value)} style={{ ...fi, minHeight: 90 }} />
              </Field>
            </div>
          ) : (
            <div style={{ marginTop: 14 }}>
              {form.impression && (
                <p style={{
                  borderLeft: '2px solid rgba(232,130,154,0.45)',
                  color: '#3D6E35',
                  fontStyle: 'italic',
                  fontSize: 14,
                  lineHeight: 1.8,
                  paddingLeft: 14,
                }}>
                  {form.impression}
                </p>
              )}
              {tagList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
                  {tagList.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <Divider label="詳細メモ" />

        <div style={S.sectionCard}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 16 }}>
            <LotusBud size={16} />
            <span style={{ color: '#4E8A42', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              分析・考察
            </span>
          </div>

          <Field label="キャラクター">
            <textarea
              value={form.characters}
              onChange={e => set('characters', e.target.value)}
              placeholder="印象的なキャラクター、人物の描写について..."
              style={{ ...fi, minHeight: 110 }}
            />
          </Field>
          <Field label="構成・構造">
            <textarea
              value={form.structure}
              onChange={e => set('structure', e.target.value)}
              placeholder="物語の構成、展開のリズム、演出について..."
              style={{ ...fi, minHeight: 110 }}
            />
          </Field>
          <Field label="着想・アイデア">
            <textarea
              value={form.ideas}
              onChange={e => set('ideas', e.target.value)}
              placeholder="インスパイアされたこと、自分の創作への活かし方..."
              style={{ ...fi, minHeight: 110 }}
            />
          </Field>
        </div>

        {/* Sticky save bar */}
        <div style={{
          background: 'rgba(242,250,240,0.95)',
          borderTop: '1px solid rgba(107,168,95,0.25)',
          bottom: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '12px 0',
          position: 'sticky',
        }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              ...S.saveBtn,
              opacity: saving ? 0.75 : 1,
              background: saveState === 'saved'
                ? 'linear-gradient(135deg, #5A9A4E, #3A6E30)'
                : S.saveBtn.background,
            }}
          >{savedLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]               = useState('list')
  const [selectedWork, setSelectedWork] = useState(null)

  if (view === 'add') {
    return (
      <AddView
        onBack={() => setView('list')}
        onAdded={() => setView('list')}
      />
    )
  }

  if (view === 'detail' && selectedWork) {
    return (
      <DetailView
        work={selectedWork}
        onBack={() => { setView('list'); setSelectedWork(null) }}
      />
    )
  }

  return (
    <ListView
      onSelect={work => { setSelectedWork(work); setView('detail') }}
      onAdd={() => setView('add')}
    />
  )
}
