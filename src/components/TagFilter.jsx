export default function TagFilter({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
          activeTag === null
            ? 'bg-[var(--color-ink)] text-white'
            : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            activeTag === tag
              ? 'bg-[var(--color-accent)] text-white'
              : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-[var(--color-border)] hover:border-[var(--color-accent)]'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
