export default function TagFilter({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className="font-display text-xs font-bold"
        style={{
          border: '2px solid var(--color-ink)',
          borderRadius: '999px',
          padding: '5px 16px',
          background: activeTag === null ? 'var(--color-ink)' : 'var(--color-surface)',
          color: activeTag === null ? '#fff' : 'var(--color-ink)',
          transition: 'all 0.1s',
        }}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className="font-display text-xs font-bold"
          style={{
            border: '2px solid var(--color-ink)',
            borderRadius: '999px',
            padding: '5px 16px',
            background: activeTag === tag ? 'var(--tag-yellow)' : 'var(--color-surface)',
            color: 'var(--color-ink)',
            transition: 'all 0.1s',
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
