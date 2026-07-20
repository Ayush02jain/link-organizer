import { Link2 } from 'lucide-react'

export default function EmptyState({ filtered }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border-3 border-dashed border-[var(--color-ink)] px-6 py-20 text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-[var(--color-ink)]"
        style={{ background: 'var(--color-tag-active)', boxShadow: '3px 3px 0 var(--color-ink)' }}
      >
        <Link2 size={24} className="text-[var(--color-ink)]" />
      </div>
      <p className="font-display text-xl font-bold text-[var(--color-ink)]">
        {filtered ? 'Nothing here yet' : 'Nothing caught yet'}
      </p>
      <p className="mt-2 max-w-xs text-sm font-medium text-[var(--color-ink-soft)]">
        {filtered
          ? 'Try a different tag or clear the filter.'
          : 'Paste a link above and it will land here, banner and all.'}
      </p>
    </div>
  )
}
