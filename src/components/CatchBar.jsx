import { useState } from 'react'
import { Loader2, Tag as TagIcon } from 'lucide-react'

export default function CatchBar({ onAdd }) {
  const [url, setUrl] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError('')
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      await onAdd(url, tags)
      setUrl('')
      setTagInput('')
    } catch (err) {
      setError(err.message || 'Could not save that link.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="neu-card p-3 sm:flex sm:items-center sm:gap-2 sm:p-3"
    >
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a link to catch it…"
        className="w-full flex-1 border-none bg-transparent px-3 py-2.5 font-display text-sm font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-2 sm:mt-0">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border-2 border-[var(--color-border)] px-3 py-2 sm:px-2 sm:py-1.5">
          <TagIcon size={14} className="shrink-0 text-[var(--color-ink)]" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="tags, comma, separated"
            className="w-full min-w-0 border-none bg-transparent text-sm font-medium text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !url.trim()}
          className="neu-btn neu-btn-primary shrink-0 px-5 py-2.5 text-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
        </button>
      </div>
      {error && (
        <p className="mt-2 basis-full text-xs font-semibold text-[var(--color-danger)] sm:ml-3">{error}</p>
      )}
    </form>
  )
}
