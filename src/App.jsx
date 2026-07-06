import { useEffect, useMemo, useState } from 'react'
import { Search, LogOut, Loader2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import { useLinks } from './hooks/useLinks'
import Auth from './components/Auth'
import CatchBar from './components/CatchBar'
import LinkGrid from './components/LinkGrid'
import TagFilter from './components/TagFilter'
import EmptyState from './components/EmptyState'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = logged out
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  const { links, loading, error, addLink, updateLink, deleteLink } = useLinks(userId)

  const allTags = useMemo(() => {
    const set = new Set()
    links.forEach((l) => l.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [links])

  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchesTag = !activeTag || l.tags.includes(activeTag)
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        l.title?.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.domain?.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
      return matchesTag && matchesQuery
    })
  }, [links, activeTag, query])

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-ink-faint)]" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden px-4 sm:px-6">
      <header className="flex items-center justify-between py-8">
        <h1 className="font-display text-2xl text-[var(--color-ink)]">Catch</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-1.5 text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </header>

      <CatchBar onAdd={addLink} />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your links"
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-9 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      <main className="mt-6 flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-ink-faint)]" />
          </div>
        ) : error ? (
          <p className="rounded-xl bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        ) : filteredLinks.length === 0 ? (
          <EmptyState filtered={Boolean(query || activeTag)} />
        ) : (
          <LinkGrid
            links={filteredLinks}
            onDelete={deleteLink}
            onUpdate={updateLink}
          />
        )}
      </main>
    </div>
  )
}
