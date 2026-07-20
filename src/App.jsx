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
        <Loader2 size={28} className="animate-spin text-[var(--color-ink)]" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div
      className="mx-auto flex h-screen flex-col overflow-hidden px-6"
      style={{ maxWidth: '1100px' }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between pb-6 pt-10">
        <h1 className="font-display flex items-center gap-3 text-3xl font-bold text-[var(--color-ink)]">
          <img
            src="/favicon.svg"
            alt="Catch logo"
            className="h-10 w-10"
            style={{
              borderRadius: '8px',
              border: '3px solid var(--color-ink)',
              boxShadow: '2px 2px 0 var(--color-ink)',
            }}
          />
          Catch
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline font-mono text-xs font-medium text-[var(--color-ink-soft)]">
            {session.user.email}
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink)]"
            style={{
              border: '2px solid var(--color-ink)',
              borderRadius: '8px',
              padding: '6px 14px',
              background: 'var(--color-surface)',
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </header>

      {/* ── Catch Bar ── */}
      <CatchBar onAdd={addLink} />

      {/* ── Filters + Search ── */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        <div className="relative w-full sm:w-56">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your links"
            className="w-full bg-transparent py-2 pl-8 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
            }}
          />
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="mt-8 flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[var(--color-ink)]" />
          </div>
        ) : error ? (
          <p
            className="text-sm font-semibold text-[var(--color-danger)]"
            style={{
              border: '3px solid var(--color-danger)',
              borderRadius: '12px',
              padding: '12px 16px',
              background: 'var(--color-danger-soft)',
              boxShadow: '3px 3px 0 var(--color-danger)',
            }}
          >
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
