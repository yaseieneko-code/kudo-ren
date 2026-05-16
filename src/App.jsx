import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLE = 'kudo_ren_works'

const TYPES = ['小説', '漫画', 'Webtoon', 'アニメ', '映画', 'その他']

const STATUSES = ['気になる', '鑑賞中', '鑑賞済']

const STATUS_PALETTE = {
  '気になる': { bg: 'rgba(255,127,178,0.12)', text: '#c85d84', border: 'rgba(255,168,202,0.62)', dot: '#ff7fb2', mark: '♥' },
  '鑑賞中':   { bg: 'rgba(255,105,153,0.12)', text: '#d34f7e', border: 'rgba(255,153,190,0.62)', dot: '#ff6298', mark: '●' },
  '鑑賞済':   { bg: 'rgba(255,190,214,0.18)', text: '#c64f7d', border: 'rgba(255,177,209,0.66)', dot: '#ff9bc4', mark: '🎀' },
}

const TYPE_PALETTE = {
  '小説':    { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
  '漫画':    { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
  'Webtoon': { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
  'アニメ':  { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
  '映画':    { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
  'その他':  { bg: 'rgba(255,245,250,0.9)', text: '#c64f7d', border: 'rgba(255,176,209,0.7)' },
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const S = {
  sectionCard: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(255,182,212,0.55)',
    borderRadius: 6,
    boxShadow: '0 10px 26px rgba(255,143,186,0.12), inset 0 0 0 1px rgba(255,222,236,0.55)',
    marginBottom: 16,
    padding: '20px 22px',
  },
  saveBtn: {
    background: 'linear-gradient(135deg, #ff95bd, #f36f9f)',
    border: '1px solid rgba(255,160,197,0.75)',
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
    border: '1px solid rgba(255,169,204,0.7)',
    borderRadius: 20,
    color: '#c64f7d',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: 14,
    padding: '8px 22px',
    transition: 'all 0.2s',
  },
  fieldInput: {
    background: 'rgba(255,255,255,0.94)',
    border: '1px solid rgba(255,182,212,0.72)',
    borderRadius: 4,
    color: '#8f4f65',
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
      <g opacity="0.88">
        <path d="M25 88 C36 74 48 70 64 66" stroke="#9bb8a8" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M45 86 C52 74 61 69 76 64" stroke="#9bb8a8" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M39 77 C27 66 21 54 19 38" stroke="#9bb8a8" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 67 C22 64 14 59 8 50" fill="#b8d1c7" opacity="0.75" />
        <path d="M54 72 C67 69 76 62 82 50" fill="#b8d1c7" opacity="0.75" />
        <path d="M31 80 C22 79 14 74 8 66" fill="#c4d9d0" opacity="0.7" />
      </g>
      <g filter="url(#roseGlow)">
        <circle cx="34" cy="42" r="18" fill="#ffd8e6" />
        <circle cx="36" cy="42" r="12" fill="#ffb0cd" />
        <path d="M28 42 C32 33 45 34 45 43 C42 52 29 51 28 42Z" fill="#ff82ad" opacity="0.9" />
        <path d="M31 40 C36 34 43 38 42 45 C37 50 30 47 31 40Z" fill="#fff0f6" opacity="0.55" />
        <circle cx="61" cy="55" r="14" fill="#ffe2ec" />
        <circle cx="62" cy="55" r="9" fill="#ffb8d2" />
        <path d="M56 55 C59 48 68 49 69 56 C66 63 57 62 56 55Z" fill="#ff8db7" opacity="0.9" />
        <circle cx="68" cy="34" r="9" fill="#ffd8e6" />
        <circle cx="69" cy="34" r="5.5" fill="#ff9ec4" />
      </g>
      <defs>
        <filter id="roseGlow" x="0" y="0" width="100" height="100" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ff8fba" floodOpacity="0.28" />
        </filter>
      </defs>
    </svg>
  )
}

// ─── Small Lotus Bud (for decorative use) ────────────────────────────────────

function LotusBud({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 21 C12 16 13 12 16 8" stroke="#b8cfc4" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 17 C8 15 6 13 5 10 C8 11 10 13 12 16" fill="#bdd8cc" opacity="0.8" />
      <path d="M13 16 C17 15 19 13 20 10 C17 11 15 13 13 16" fill="#bdd8cc" opacity="0.8" />
      <circle cx="12" cy="8" r="4.7" fill="#ffb3cf" />
      <path d="M8 8 C10 4 15 4 16 8 C15 12 9 12 8 8Z" fill="#ff7fac" />
      <circle cx="12" cy="8" r="1.7" fill="#ffe5ef" />
    </svg>
  )
}

function RibbonBow({ className = '', size = 74 }) {
  return (
    <svg className={`ribbon-bow ${className}`} width={size} height={size * 0.58} viewBox="0 0 100 58" fill="none" aria-hidden="true">
      <path d="M49 27 C34 10 16 1 5 13 C-3 23 8 42 30 38 C38 36 45 32 49 27Z" fill="#ffd0df" stroke="#ff9abc" strokeWidth="2" />
      <path d="M51 27 C66 10 84 1 95 13 C103 23 92 42 70 38 C62 36 55 32 51 27Z" fill="#ffd0df" stroke="#ff9abc" strokeWidth="2" />
      <path d="M39 32 C31 42 25 49 17 55 C29 56 40 51 48 38" fill="#ffc0d5" opacity="0.86" />
      <path d="M61 32 C69 42 75 49 83 55 C71 56 60 51 52 38" fill="#ffc0d5" opacity="0.86" />
      <rect x="40" y="20" width="20" height="18" rx="5" fill="#ff8db5" stroke="#fff0f6" strokeWidth="2" />
      <path d="M12 15 C26 16 35 21 45 28" stroke="#fff8fb" strokeWidth="2" opacity="0.7" />
      <path d="M88 15 C74 16 65 21 55 28" stroke="#fff8fb" strokeWidth="2" opacity="0.7" />
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
            color: n <= active ? '#ff6f9f' : '#f1c8d8',
            cursor: onChange ? 'pointer' : 'default',
            display: 'inline-block',
            fontSize: size,
            lineHeight: 1,
            textShadow: n <= active ? '0 0 8px rgba(255,111,159,0.38)' : 'none',
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
      <span style={{ color: c.dot, display: 'inline-block', fontSize: 10, lineHeight: 1 }}>{c.mark || '●'}</span>
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
              border: `1px solid ${active ? c.border : 'rgba(255,179,210,0.55)'}`,
              borderRadius: 10,
              color: active ? c.text : '#c76d8f',
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
      <div style={{ background: 'linear-gradient(to right, transparent, rgba(255,159,197,0.55))', flex: 1, height: 1 }} />
      <LotusBud size={16} />
      {label && (
        <span style={{ color: '#d75b89', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
      <LotusBud size={16} />
      <div style={{ background: 'linear-gradient(to left, transparent, rgba(255,159,197,0.55))', flex: 1, height: 1 }} />
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        color: '#c64f7d',
        display: 'block',
        fontSize: 10,
        letterSpacing: '0.12em',
        marginBottom: 5,
        textTransform: 'uppercase',
      }}>{label}</label>
      {children}
      {error && (
        <div style={{ color: '#d85a8b', fontSize: 11, marginTop: 3 }}>{error}</div>
      )}
    </div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────

function PageHeader({ title, onBack, action }) {
  return (
    <header className="page-header" style={{
      alignItems: 'center',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,249,252,0.95))',
      borderBottom: '1px solid rgba(255,177,209,0.55)',
      boxShadow: '0 8px 24px rgba(255,146,187,0.12)',
      display: 'flex',
      gap: 12,
      minHeight: 128,
      overflow: 'hidden',
      padding: '34px 24px 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <RibbonBow className="header-bow header-bow-left" />
      <RibbonBow className="header-bow header-bow-right" />
      <div className="header-roses"><LotusFlower size={118} /></div>
      <div style={{
        borderRight: '2px solid rgba(255,190,216,0.75)',
        borderBottom: '2px solid rgba(255,190,216,0.75)',
        borderBottomRightRadius: 18,
        bottom: 4,
        height: 38,
        left: 0,
        position: 'absolute',
        width: 76,
      }} />
      <div style={{
        borderLeft: '2px solid rgba(255,190,216,0.75)',
        borderBottom: '2px solid rgba(255,190,216,0.75)',
        borderBottomLeftRadius: 18,
        bottom: 4,
        height: 38,
        position: 'absolute',
        right: 0,
        width: 76,
      }} />

      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid rgba(255,160,197,0.65)',
            borderRadius: 20,
            color: '#d85a8b',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: '5px 11px',
            transition: 'all 0.2s',
          }}
        >←</button>
      )}
      <h1 className="page-title" style={{
        color: '#ff6f9f',
        flex: 1,
        fontFamily: 'Georgia, serif',
        fontSize: 32,
        fontWeight: 'normal',
        letterSpacing: '0.08em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textShadow: '0 2px 10px rgba(255,120,170,0.22)',
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
          ? (hovered ? '#f36f9f' : '#ff8ab5')
          : (hovered ? 'rgba(255,201,222,0.22)' : 'rgba(255,255,255,0.86)'),
        border: `1px solid ${active ? '#ff8ab5' : 'rgba(255,179,210,0.72)'}`,
        borderRadius: 20,
        boxShadow: hovered ? '0 4px 12px rgba(255,128,174,0.18)' : 'none',
        color: active ? '#fff' : '#c64f7d',
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

function WorkCard({ work, onClick, onDelete, delay }) {
  const [hovered, setHovered] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const tags = work.tags || []

  function handleDeleteClick(e) {
    e.stopPropagation()
    setConfirmingDelete(true)
  }

  function handleConfirmDelete(e) {
    e.stopPropagation()
    onDelete?.()
  }

  function handleCancelDelete(e) {
    e.stopPropagation()
    setConfirmingDelete(false)
  }

  return (
    <div
      className="card"
      onClick={confirmingDelete ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        background: 'linear-gradient(150deg, rgba(255,255,255,0.98), rgba(255,249,252,0.96))',
        border: `1px solid ${hovered ? 'rgba(255,139,181,0.78)' : 'rgba(255,190,216,0.72)'}`,
        borderRadius: 18,
        boxShadow: hovered
          ? '0 14px 34px rgba(255,128,174,0.22), inset 0 0 0 1px rgba(255,232,241,0.9)'
          : '0 8px 20px rgba(255,146,187,0.13), inset 0 0 0 1px rgba(255,232,241,0.75)',
        cursor: confirmingDelete ? 'default' : 'pointer',
        overflow: 'hidden',
        padding: '26px 28px 22px',
        position: 'relative',
        transform: hovered && !confirmingDelete ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {!confirmingDelete && (
        <>
          <RibbonBow className="card-bow" />
          <div className="card-roses"><LotusFlower size={132} /></div>
        </>
      )}

      {/* delete button */}
      {!confirmingDelete && (
        <button
          onClick={handleDeleteClick}
          style={{
            alignItems: 'center',
            background: 'none',
            border: 'none',
            borderRadius: '50%',
            color: '#d85a8b',
            cursor: 'pointer',
            display: 'flex',
            fontSize: 15,
            height: 22,
            justifyContent: 'center',
            lineHeight: 1,
            opacity: hovered ? 0.5 : 0,
            padding: 0,
            position: 'absolute',
            left: 8,
            top: 8,
            transition: 'opacity 0.2s, color 0.2s',
            width: 22,
            zIndex: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#b43f6e' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = hovered ? '0.5' : '0'; e.currentTarget.style.color = '#d85a8b' }}
          title="削除"
        >×</button>
      )}

      {/* delete confirmation overlay */}
      {confirmingDelete && (
        <div style={{
          alignItems: 'center',
          background: 'rgba(255,249,252,0.97)',
          borderRadius: 18,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 10,
        }}>
          <p style={{ color: '#a84f70', fontFamily: 'Georgia, serif', fontSize: 13, margin: 0, textAlign: 'center' }}>
            この記録を削除しますか？
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCancelDelete} style={S.cancelBtn}>キャンセル</button>
            <button
              onClick={handleConfirmDelete}
              style={{ ...S.saveBtn, background: 'linear-gradient(135deg, #d85a8b, #b43f6e)', borderColor: 'rgba(216,90,139,0.5)' }}
            >削除する</button>
          </div>
        </div>
      )}

      <div style={{ alignItems: 'flex-start', display: 'flex', gap: 8, marginBottom: 8 }}>
        <h2 style={{
          color: '#c64f7d',
          flex: 1,
          fontFamily: 'Georgia, serif',
          fontSize: 20,
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
          color: '#b27a62',
          display: '-webkit-box',
          fontStyle: 'italic',
          fontSize: 12,
          lineHeight: 1.65,
          overflow: 'hidden',
          marginBottom: tags.length ? 14 : 0,
        }}>"{work.impression}"</p>
      )}

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tags.slice(0, 4).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {tags.length > 4 && (
            <span style={{ color: '#d85a8b', fontSize: 12 }}>+{tags.length - 4}</span>
          )}
        </div>
      )}

      <div style={{ color: '#f06f9d', fontSize: 13, fontWeight: 700, marginTop: 14, opacity: 0.9 }}>
        {new Date(work.created_at).toLocaleDateString('ja-JP')}
      </div>
    </div>
  )
}

// ─── List View ────────────────────────────────────────────────────────────────

const TAG_COLLAPSE_LIMIT = 8

function ListView({ onSelect, onAdd }) {
  const [works, setWorks]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [filterType, setFilter]         = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [tagsExpanded, setTagsExpanded] = useState(false)

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

  async function handleDelete(id) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (!error) setWorks(prev => prev.filter(w => w.id !== id))
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

  const watchedCount  = works.filter(w => (w.status || '気になる') === '鑑賞済').length
  const watchingCount = works.filter(w => (w.status || '気になる') === '鑑賞中').length

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_COLLAPSE_LIMIT)
  const hiddenCount = allTags.length - TAG_COLLAPSE_LIMIT

  return (
    <div className="app-shell" style={{ background: 'linear-gradient(180deg, #fff 0%, #fff8fb 52%, #fff 100%)', minHeight: '100vh' }}>
      <PageHeader
        title="鑑賞録"
        action={
          <div style={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={onAdd}
              style={{
                background: 'rgba(255,255,255,0.68)',
                border: '1px solid rgba(255,160,197,0.72)',
                borderRadius: 20,
                color: '#c64f7d',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif',
                fontSize: 13,
                letterSpacing: '0.04em',
                padding: '7px 16px',
                transition: 'all 0.2s',
              }}
            >＋ 記録する</button>
            <span style={{
              color: '#f06f9d',
              fontFamily: 'Georgia, serif',
              fontSize: 10,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              鑑賞済 {watchedCount}作品 / 鑑賞中 {watchingCount}作品
            </span>
          </div>
        }
      />

      {/* Status filter */}
      <div style={{
        background: 'rgba(255,255,255,0.93)',
        borderBottom: '1px solid rgba(255,190,216,0.52)',
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
                background: active ? (c ? c.bg : 'rgba(255,232,241,0.78)') : 'transparent',
                border: `1px solid ${active ? (c ? c.border : '#ff9fc4') : 'rgba(255,179,210,0.58)'}`,
                borderRadius: 22,
                color: active ? (c ? c.text : '#c64f7d') : '#a97886',
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
              {c && <span style={{ color: c.dot, display: 'inline-block', fontSize: 10, lineHeight: 1 }}>{c.mark || '●'}</span>}
              {s === 'all' ? 'すべて' : s}
            </button>
          )
        })}
      </div>

      {/* Type filter tabs */}
      <div style={{
        background: 'rgba(255,255,255,0.93)',
        borderBottom: '1px solid rgba(255,190,216,0.52)',
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
                background: active ? 'rgba(255,232,241,0.5)' : 'none',
                border: 'none',
                borderBottom: active ? '3px solid #ff7fab' : '3px solid transparent',
                color: active ? '#ff6f9f' : '#c66b8e',
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
          background: 'rgba(255,255,255,0.86)',
          borderBottom: '1px solid rgba(255,190,216,0.42)',
          padding: '10px 18px',
        }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 8 }}>
            <LotusBud size={14} />
            <span style={{ color: '#c64f7d', fontSize: 15, letterSpacing: '0.12em' }}>
              タグ
            </span>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,179,210,0.68)',
                  borderRadius: 10,
                  color: '#c64f7d',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: 10,
                  padding: '1px 10px',
                }}
              >× クリア</button>
            )}
            {selectedTags.length > 0 && (
              <span style={{ color: '#f06f9d', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11 }}>
                {filtered.length} 件
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {visibleTags.map(tag => (
              <TagFilterPill
                key={tag}
                tag={tag}
                active={selectedTags.includes(tag)}
                onToggle={() => toggleTag(tag)}
              />
            ))}
            {!tagsExpanded && hiddenCount > 0 && (
              <button
                onClick={() => setTagsExpanded(true)}
                style={{
                  background: 'rgba(255,255,255,0.86)',
                  border: '1px solid rgba(255,179,210,0.72)',
                  borderRadius: 20,
                  color: '#c64f7d',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: 12,
                  padding: '4px 14px',
                  transition: 'all 0.2s ease',
                }}
              >＋{hiddenCount}個</button>
            )}
            {tagsExpanded && allTags.length > TAG_COLLAPSE_LIMIT && (
              <button
                onClick={() => setTagsExpanded(false)}
                style={{
                  background: 'rgba(255,232,241,0.62)',
                  border: '1px solid rgba(255,179,210,0.72)',
                  borderRadius: 20,
                  color: '#c64f7d',
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: 12,
                  padding: '4px 14px',
                  transition: 'all 0.2s ease',
                }}
              >折りたたむ ▲</button>
            )}
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
            border: '1px solid rgba(255,179,210,0.55)',
            borderRadius: 6,
            color: '#B05070',
            fontSize: 13,
            padding: '10px 14px',
          }}>⚠ {error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <LotusFlower size={100} />
            <p style={{ color: '#c64f7d', fontStyle: 'italic', marginTop: 16, opacity: 0.8 }}>
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
              onDelete={() => handleDelete(work.id)}
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
    borderColor: hasErr ? '#d85a8b' : 'rgba(255,182,212,0.72)',
  })

  return (
    <div className="app-shell" style={{ background: 'linear-gradient(180deg, #fff 0%, #fff8fb 58%, #fff 100%)', minHeight: '100vh' }}>
      <PageHeader title="新しい記録" onBack={onBack} />
      <form onSubmit={handleSubmit} style={{ margin: '0 auto', maxWidth: 620, padding: '24px 16px' }}>

        <div style={{ ...S.sectionCard }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 16 }}>
            <LotusBud size={16} />
            <span style={{ color: '#c64f7d', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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
          >{saving ? '保存中...' : '記録を保存'}</button>
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
    <div className="app-shell" style={{ background: 'linear-gradient(180deg, #fff 0%, #fff8fb 58%, #fff 100%)', minHeight: '100vh' }}>
      <PageHeader
        title={form.title || work.title}
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
                ? 'linear-gradient(135deg, #ff9fc4, #f06f9d)'
                : S.saveBtn.background,
            }}
          >{savedLabel}</button>
        }
      />

      <div style={{ margin: '0 auto', maxWidth: 640, padding: '24px 16px' }}>

        {/* Hero card */}
        <div style={{
          ...S.sectionCard,
          background: 'linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(255,247,251,0.96) 100%)',
          borderColor: 'rgba(255,179,210,0.55)',
        }}>
          <div style={{ alignItems: 'flex-start', display: 'flex', gap: 16 }}>
            <div style={{ flexShrink: 0 }}>
              <LotusFlower size={60} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {form.type && <TypeBadge type={form.type} />}
                <StatusBadge status={form.status} />
                <span style={{ color: '#f06f9d', fontSize: 11 }}>
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
              color: '#c64f7d',
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
            <div style={{ borderTop: '1px solid rgba(255,179,210,0.35)', marginTop: 10, paddingTop: 14 }}>
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
                  borderLeft: '2px solid rgba(255,160,197,0.58)',
                  color: '#a86478',
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
            <span style={{ color: '#c64f7d', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
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
          background: 'rgba(255,249,252,0.95)',
          borderTop: '1px solid rgba(255,179,210,0.35)',
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
                ? 'linear-gradient(135deg, #ff9fc4, #f06f9d)'
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
