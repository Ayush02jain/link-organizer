import { useState } from 'react'
import { ExternalLink, Trash2, Pencil, Check, X, Loader2 } from 'lucide-react'
import { fetchLinkMetadata, getDomain, normalizeUrl, isValidUrl } from '../lib/metadata'

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
        // URL changed — fetch fresh metadata for the new destination
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
        // URL unchanged — just persist title/description edits
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

  return (
    <div className="group flex flex-row items-stretch gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition hover:border-[var(--color-accent)]/40 hover:shadow-md">
      {/* ── Left: thumbnail ── */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--color-accent-soft)] sm:h-28 sm:w-28"
      >
        {link.image_url ? (
          <img
            src={link.image_url}
            alt=""
            loading="lazy"
            className={`h-full w-full ${
              link.is_image ? 'object-contain' : 'object-cover'
            } transition duration-300 group-hover:scale-[1.03]`}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        {/* Fallback letter — shown if no image or image fails to load */}
        <div
          className={`flex h-full items-center justify-center ${link.image_url ? 'hidden' : ''}`}
        >
          <span className="font-display text-2xl text-[var(--color-accent-ink)] opacity-40">
            {link.domain?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
      </a>

      {/* ── Right: metadata ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">

        {/* ── Meta edit mode ── */}
        {editingMeta ? (
          <div className="flex flex-col gap-1.5">
            {/* URL field */}
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Link</span>
              <input
                autoFocus
                value={urlDraft}
                onChange={(e) => { setUrlDraft(e.target.value); setMetaError('') }}
                onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
                placeholder="https://"
                className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 font-mono text-xs text-[var(--color-ink)] focus:outline-none"
              />
            </label>
            {/* Title field */}
            <label className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-ink-faint)]">Title</span>
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
                placeholder="Title"
                className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-sm font-semibold text-[var(--color-ink)] focus:outline-none"
              />
            </label>
            <textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && cancelMeta()}
              placeholder="Description (optional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs leading-relaxed text-[var(--color-ink-soft)] focus:outline-none"
            />
            {/* Inline error */}
            {metaError && (
              <p className="text-xs text-[var(--color-danger)]">{metaError}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={saveMeta}
                disabled={metaSaving}
                className="flex items-center gap-1 rounded-lg bg-[var(--color-accent)] px-2.5 py-1 text-xs font-medium text-white transition hover:bg-[var(--color-accent-ink)] disabled:opacity-60"
              >
                {metaSaving
                  ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
                  : <><Check size={12} /> Save</>}
              </button>
              <button
                onClick={cancelMeta}
                disabled={metaSaving}
                className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] disabled:opacity-50"
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
                className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent-ink)]"
              >
                {link.title || link.url}
              </a>

              {/* Pencil to edit title/description — hover-reveal */}
              <button
                onClick={openMetaEdit}
                className="shrink-0 rounded-lg p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] group-hover:opacity-100"
                aria-label="Edit title and description"
              >
                <Pencil size={13} />
              </button>

              {/* Delete */}
              {confirmingDelete ? (
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="text-[var(--color-ink-soft)]">Remove?</span>
                  <button
                    onClick={() => onDelete(link.id)}
                    className="font-medium text-[var(--color-danger)]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-[var(--color-ink-faint)]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="shrink-0 rounded-lg p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] group-hover:opacity-100"
                  aria-label="Delete link"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Row 2: domain */}
            <div className="flex items-center gap-1 font-mono text-xs text-[var(--color-ink-faint)]">
              <span className="truncate">{link.domain}</span>
              <ExternalLink size={11} className="shrink-0" />
            </div>

            {/* Row 3: description or "+ Add a description" prompt */}
            {link.description ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-ink-soft)]">
                {link.description}
              </p>
            ) : (
              <button
                onClick={openMetaEdit}
                className="self-start text-xs text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-accent)] group-hover:opacity-100"
              >
                + Add a description
              </button>
            )}
          </>
        )}

        {/* Row 4: tags (always visible, below edit mode too) */}
        <div className="mt-auto">
          {editingTags ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTags()}
                placeholder="tags, comma, separated"
                className="w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-ink)] focus:outline-none"
              />
              <button onClick={saveTags} className="text-[var(--color-accent)]">
                <Check size={15} />
              </button>
              <button onClick={() => setEditingTags(false)} className="text-[var(--color-ink-faint)]">
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {link.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs text-[var(--color-accent-ink)]"
                >
                  {tag}
                </span>
              ))}
              <button
                onClick={() => setEditingTags(true)}
                className="rounded-full p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-accent)] group-hover:opacity-100"
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
