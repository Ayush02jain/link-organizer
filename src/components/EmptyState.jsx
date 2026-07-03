import { Link2 } from 'lucide-react'

export default function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-20 text-center">
      <Link2 size={28} className="mb-3 text-[var(--color-ink-faint)]" />
      <p className="font-display text-lg text-[var(--color-ink)]">
        {filtered ? 'Nothing here yet' : 'Nothing caught yet'}
      </p>
      <p className="mt-1 max-w-xs text-sm text-[var(--color-ink-soft)]">
        {filtered
          ? 'Try a different tag or clear the filter.'
          : 'Paste a link above and it will land here, banner and all.'}
      </p>
    </div>
  )
}
