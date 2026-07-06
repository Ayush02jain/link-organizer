const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i

export function isImageUrl(url) {
  return IMAGE_EXTENSIONS.test(url)
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function normalizeUrl(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

export function isValidUrl(value) {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

// ── Twitter / X helpers ──────────────────────────────────────────────────────

const TWITTER_DOMAINS = ['twitter.com', 'x.com']

export function isTwitterUrl(url) {
  return TWITTER_DOMAINS.includes(getDomain(url))
}

/**
 * Uses Twitter's free public oEmbed endpoint to extract the tweet text and
 * author name. No authentication required.
 * Returns { title, description, image: null, isImage: false }.
 */
export async function fetchTwitterMetadata(url) {
  const res = await fetch(
    `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
  )
  if (!res.ok) throw new Error('oEmbed request failed')
  const json = await res.json()

  // Parse the HTML snippet to extract the first <p> — that's the tweet body.
  const doc = new DOMParser().parseFromString(json.html, 'text/html')
  const rawText = doc.querySelector('p')?.textContent ?? ''
  // Strip trailing "pic.twitter.com/xxxx" media links the parser leaves in.
  const tweetText = rawText.replace(/\s*pic\.twitter\.com\/\S+\s*$/i, '').trim()

  return {
    title: json.author_name ? `${json.author_name} on X` : getDomain(url),
    description: tweetText || null,
    image: null,
    isImage: false,
  }
}

// ── Direct HTML meta scraper ─────────────────────────────────────────────────

/**
 * Fetches raw page HTML via two CORS proxies (corsproxy.io first, then
 * allorigins.win as fallback) and parses:
 *   - <title> for the page title
 *   - <meta name="description"> or <meta property="og:description"> for description
 *
 * Returns { title, description } — either field may be null.
 */
export async function fetchPageMeta(url) {
  let html = null

  // 1️⃣  corsproxy.io — returns raw HTML directly, very reliable
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) html = await res.text()
  } catch {
    // network error or timeout — try next proxy
  }

  // 2️⃣  allorigins.win — wraps HTML in { contents: "..." } JSON
  if (!html) {
    try {
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (res.ok) {
        const { contents } = await res.json()
        html = contents || null
      }
    } catch {
      // both proxies failed
    }
  }

  if (!html) return { title: null, description: null }

  const doc = new DOMParser().parseFromString(html, 'text/html')

  const title = doc.querySelector('title')?.textContent?.trim() || null

  const description =
    doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim() ||
    null

  return { title, description }
}

// ── Generic metadata fetcher ─────────────────────────────────────────────────

/**
 * Fetches title + image + description for a pasted link.
 *
 * Strategy:
 *  - Direct image URLs → returned immediately, no fetch needed.
 *  - Twitter/X URLs    → oEmbed endpoint (tweet text as description).
 *  - Everything else  → microlink (image) + fetchPageMeta (title, description)
 *    run in PARALLEL via Promise.allSettled so neither blocks the other.
 *    fetchPageMeta reads <meta name="description"> directly from the page HTML,
 *    which is the most reliable source. microlink title is preferred when it
 *    succeeds (often cleaner); fetchPageMeta title is the fallback.
 *
 * Falls back gracefully at every step — never throws.
 */
export async function fetchLinkMetadata(url) {
  if (isImageUrl(url)) {
    return { title: getDomain(url), image: url, isImage: true, description: null }
  }

  // Twitter / X — oEmbed only, microlink won't work there.
  if (isTwitterUrl(url)) {
    try {
      return await fetchTwitterMetadata(url)
    } catch {
      /* fall through */
    }
    return { title: getDomain(url), image: null, isImage: false, description: null }
  }

  // Generic URL — fire microlink and direct HTML scrape in parallel.
  const [mlSettled, pmSettled] = await Promise.allSettled([
    // microlink: good at images and structured title
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false`)
      .then((r) => r.json())
      .then((json) =>
        json.status === 'success'
          ? {
              title: json.data.title || null,
              image: json.data.image?.url || json.data.logo?.url || null,
              description: json.data.description || null,
            }
          : {}
      ),
    // fetchPageMeta: reads <meta name="description"> directly from HTML
    fetchPageMeta(url),
  ])

  const ml = mlSettled.status === 'fulfilled' ? mlSettled.value : {}
  const pm = pmSettled.status === 'fulfilled' ? pmSettled.value : {}

  return {
    // microlink title is usually cleaner; HTML <title> is the fallback
    title: ml.title || pm.title || getDomain(url),
    // only microlink reliably returns preview images
    image: ml.image || null,
    isImage: false,
    // prefer direct HTML parse (most reliable); microlink as secondary
    description: pm.description || ml.description || null,
  }
}
