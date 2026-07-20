import { useState } from 'react'
import { ExternalLink, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { fetchLinkMetadata, getDomain, normalizeUrl, isValidUrl } from '../lib/metadata'

/* ── Rotating avatar colors ── */
const AVATAR_COLORS = [
  'var(--avatar-coral)',
  'var(--avatar-blue)',
  'var(--avatar-yellow)',
  'var(--avatar-lavender)',
  'var(--avatar-mint)',
  'var(--avatar-pink)',
]

/* ── Colorful tag palette ── */
const TAG_COLORS = [
  { bg: 'var(--tag-green)',   light: 'var(--tag-green-light)',   text: '#15803d' },
  { bg: 'var(--tag-yellow)',  light: 'var(--tag-yellow-light)',  text: '#854d0e' },
  { bg: 'var(--tag-blue)',    light: 'var(--tag-blue-light)',    text: '#1d4ed8' },
  { bg: 'var(--tag-red)',     light: 'var(--tag-red-light)',     text: '#dc2626' },
  { bg: 'var(--tag-purple)',  light: 'var(--tag-purple-light)',  text: '#7c3aed' },
  { bg: 'var(--tag-orange)',  light: 'var(--tag-orange-light)',  text: '#c2410c' },
]

function hashStr(str) {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function avatarColor(domain) {
  return AVATAR_COLORS[hashStr(domain) % AVATAR_COLORS.length]
}

function tagColor(tag) {
  return TAG_COLORS[hashStr(tag) % TAG_COLORS.length]
}

export default function LinkCard({ link, onDelete, onUpdate }) {
  // ── tag editing ──────────────────────────────────────────────────────────
  const [editingTags, setEditingTags] = useState(false)
  const [tagDraft, setTagDraft] = useState(link.tags.join(', '))

  function saveTags() {
    const tags = tagDraft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onUpdate(link.id, { tags })
    setEditingTags(false)
  }

  // ── title + description + url editing ───────────────────────────────────
  const [editingMeta, setEditingMeta] = useState(false)
  const [urlDraft, setUrlDraft]       = useState(link.url)
  const [titleDraft, setTitleDraft]   = useState(link.title || '')
  const [descDraft, setDescDraft]     = useState(link.description || '')
  const [metaSaving, setMetaSaving]   = useState(false)
  const [metaError, setMetaError]     = useState('')

  function openMetaEdit() {
    setUrlDraft(link.url)
    setTitleDraft(link.title || '')
    setDescDraft(link.description || '')
    setMetaError('')
    setEditingMeta(true)
  }

  async function saveMeta() {
    const newUrl = normalizeUrl(urlDraft)
    if (!isValidUrl(newUrl)) {
      setMetaError("That doesn't look like a valid link.")
      return
    }
    setMetaError('')
    setMetaSaving(true)
    try {
      if (newUrl !== link.url) {
        const meta = await fetchLinkMetadata(newUrl)
        onUpdate(link.id, {
          url:         newUrl,
          domain:      getDomain(newUrl),
          title:       titleDraft.trim() || meta.title,
          description: descDraft.trim()  || meta.description,
          image_url:   meta.image,
          is_image:    meta.isImage,
        })
      } else {
        onUpdate(link.id, {
          title:       titleDraft.trim() || link.url,
          description: descDraft.trim()  || null,
        })
      }
      setEditingMeta(false)
    } catch (err) {
      setMetaError('Something went wrong — please try again.')
    } finally {
      setMetaSaving(false)
    }
  }

  function cancelMeta() {
    setUrlDraft(link.url)
    setMetaError('')
    setEditingMeta(false)
  }

  // ── delete confirm ───────────────────────────────────────────────────────
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const bgColor = avatarColor(link.domain)

  return (
    <div
      className="group flex flex-row items-stretch gap-4"
      style={{
        border: '3px solid var(--color-ink)',
        borderRadius: '16px',
        background: 'var(--color-surface)',
        padding: '14px',
        boxShadow: '4px 4px 0 var(--color-ink)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translate(-2px, -2px)'
        e.currentTarget.style.boxShadow = '6px 6px 0 var(--color-ink)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-ink)'
      }}
    >
      {/* ── Left: thumbnail ── */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 overflow-hidden"
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '10px',
          border: '3px solid var(--color-ink)',
          background: bgColor,
        }}
      >
        {link.image_url ? (
          <img
            src={link.image_url}
            alt=""
            loading="lazy"
            className={`h-full w-full ${
              link.is_image ? 'object-contain' : 'object-cover'
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div
          className={`flex h-full items-center justify-center ${link.image_url ? 'hidden' : ''}`}
        >
          <span
            className="font-display text-3xl font-bold text-white"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}
          >
            {link.domain?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
      </a>

      {/* ── Right: metadata ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">

        {/* ── Meta edit mode ── */}
        {editingMeta ? (
          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-0.5">
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">Link</span>
              <input
                autoFocus
                value={urlDraft}
                onChange={(e) => { setUrlDraft(e.target.value); setMetaError('') }}
                onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
                placeholder="https://"
                className="w-full font-mono text-xs text-[var(--color-ink)] focus:outline-none"
                style={{ border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '6px 10px' }}
              />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink-soft)]">Title</span>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
                placeholder="Title"
                className="w-full font-display text-sm font-bold text-[var(--color-ink)] focus:outline-none"
                style={{ border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '6px 10px' }}
              />
            </label>
            <textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
              placeholder="Description (optional)"
              rows={2}
              className="w-full resize-none text-xs leading-relaxed text-[var(--color-ink-soft)] focus:outline-none"
              style={{ border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '6px 10px' }}
            />
            {metaError && (
              <p className="text-xs font-bold text-[var(--color-danger)]">{metaError}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={saveMeta}
                disabled={metaSaving}
                className="flex items-center gap-1 text-xs font-bold text-white disabled:opacity-60"
                style={{
                  background: 'var(--color-accent)',
                  border: '2px solid var(--color-ink)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  boxShadow: '2px 2px 0 var(--color-ink)',
                }}
              >
                {metaSaving
                  ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                  : <><Check size={12} /> Save</>}
              </button>
              <button
                onClick={cancelMeta}
                disabled={metaSaving}
                className="text-xs font-bold text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Row 1: title + pencil + delete */}
            <div className="flex items-start gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-display text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-accent-dark)]"
              >
                {link.title || link.url}
              </a>

              <button
                onClick={openMetaEdit}
                className="shrink-0 rounded-md p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-ink)] group-hover:opacity-100"
                aria-label="Edit title and description"
              >
                <Pencil size={13} />
              </button>

              {confirmingDelete ? (
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="font-bold text-[var(--color-ink-soft)]">Remove?</span>
                  <button
                    onClick={() => onDelete(link.id)}
                    className="font-bold text-[var(--color-danger)]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="font-bold text-[var(--color-ink-faint)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="shrink-0 rounded-md p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-danger)] group-hover:opacity-100"
                  aria-label="Delete link"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Row 2: domain */}
            <div className="flex items-center gap-1 font-mono text-xs font-medium text-[var(--color-ink-faint)]">
              <span className="truncate">{link.domain}</span>
              <ExternalLink size={11} className="shrink-0" />
            </div>

            {/* Row 3: description */}
            {link.description ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                {link.description}
              </p>
            ) : (
              <button
                onClick={openMetaEdit}
                className="self-start text-xs font-bold text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-accent-dark)] group-hover:opacity-100"
              >
                + Add a description
              </button>
            )}
          </>
        )}

        {/* Row 4: tags */}
        <div className="mt-auto pt-1">
          {editingTags ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTags()}
                placeholder="tags, comma, separated"
                className="w-full text-xs text-[var(--color-ink)] focus:outline-none"
                style={{ border: '2px solid var(--color-ink)', borderRadius: '8px', padding: '4px 10px' }}
              />
              <button onClick={saveTags} className="text-[var(--color-accent-dark)]">
                <Check size={15} />
              </button>
              <button onClick={() => setEditingTags(false)} className="text-[var(--color-ink-faint)]">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {link.tags.map((tag) => {
                const c = tagColor(tag)
                return (
                  <span
                    key={tag}
                    className="font-display text-[11px] font-bold"
                    style={{
                      background: c.bg,
                      color: '#fff',
                      border: '2px solid var(--color-ink)',
                      borderRadius: '999px',
                      padding: '2px 10px',
                    }}
                  >
                    {tag}
                  </span>
                )
              })}
              <button
                onClick={() => setEditingTags(true)}
                className="rounded-md p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-ink)] group-hover:opacity-100"
                aria-label="Edit tags"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
