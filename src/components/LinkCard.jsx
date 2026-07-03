import { useState } from 'react'
import { ExternalLink, Trash2, Pencil, Check, X } from 'lucide-react'

export default function LinkCard({ link, onDelete, onUpdateTags }) {
  const [editing, setEditing] = useState(false)
  const [tagDraft, setTagDraft] = useState(link.tags.join(', '))
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function saveTags() {
    const tags = tagDraft
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onUpdateTags(link.id, tags)
    setEditing(false)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-accent)]/40 hover:shadow-md">
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[16/10] w-full overflow-hidden bg-[var(--color-accent-soft)]"
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
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl text-[var(--color-accent-ink)] opacity-40">
              {link.domain?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-accent-ink)]"
        >
          {link.title || link.url}
        </a>
        <div className="flex items-center gap-1 font-mono text-xs text-[var(--color-ink-faint)]">
          <span className="truncate">{link.domain}</span>
          <ExternalLink size={11} className="shrink-0" />
        </div>

        {editing ? (
          <div className="mt-1 flex items-center gap-1.5">
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
            <button onClick={() => setEditing(false)} className="text-[var(--color-ink-faint)]">
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-xs text-[var(--color-accent-ink)]"
              >
                {tag}
              </span>
            ))}
            <button
              onClick={() => setEditing(true)}
              className="rounded-full p-1 text-[var(--color-ink-faint)] opacity-0 transition hover:text-[var(--color-accent)] group-hover:opacity-100"
              aria-label="Edit tags"
            >
              <Pencil size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-[var(--color-border)] px-3 py-2">
        {confirmingDelete ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--color-ink-soft)]">Remove this link?</span>
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
            className="rounded-lg p-1.5 text-[var(--color-ink-faint)] opacity-0 transition hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)] group-hover:opacity-100"
            aria-label="Delete link"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
