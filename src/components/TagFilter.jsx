export default function TagFilter({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`neu-tag cursor-pointer ${
          activeTag === null
            ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
            : 'hover:bg-[var(--color-paper)]'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`neu-tag cursor-pointer ${
            activeTag === tag
              ? 'neu-tag-active'
              : 'hover:bg-[var(--color-paper)]'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
