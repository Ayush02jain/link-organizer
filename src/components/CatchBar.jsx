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
      className="sm:flex sm:items-center sm:gap-3"
      style={{
        border: '3px solid var(--color-ink)',
        borderRadius: '16px',
        background: 'var(--color-surface)',
        padding: '10px 12px',
        boxShadow: '4px 4px 0 var(--color-ink)',
      }}
    >
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste a link to catch it..."
        className="w-full flex-1 bg-transparent px-3 py-3 font-display text-sm font-medium text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3 sm:mt-0">
        <div
          className="flex flex-1 items-center gap-1.5 px-3 py-2.5"
          style={{
            border: '2px solid var(--color-ink)',
            borderRadius: '10px',
          }}
        >
          <TagIcon size={14} className="shrink-0 text-[var(--color-ink-faint)]" />
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
          className="shrink-0 text-sm font-bold text-white disabled:opacity-50"
          style={{
            background: 'var(--color-accent)',
            border: '2px solid var(--color-ink)',
            borderRadius: '12px',
            padding: '10px 24px',
            boxShadow: '3px 3px 0 var(--color-ink)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-ink)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-ink)'
          }}
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
