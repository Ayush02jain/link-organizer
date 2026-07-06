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

// ── Direct meta-description scraper ─────────────────────────────────────────

/**
 * Fetches raw HTML via the allorigins CORS proxy and parses the page's
 * <meta name="description"> or <meta property="og:description"> tag.
 * Returns the content string, or null if none found / request fails.
 */
export async function fetchMetaDescription(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error('allorigins fetch failed')
  const { contents } = await res.json()
  if (!contents) return null

  const doc = new DOMParser().parseFromString(contents, 'text/html')

  // Check <meta name="description"> first, then og:description as fallback.
  const desc =
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    null

  return desc?.trim() || null
}

// ── Generic metadata fetcher ─────────────────────────────────────────────────

/**
 * Fetches title + preview image for a pasted link.
 * - Direct image URLs are returned immediately.
 * - Twitter/X URLs use the free oEmbed endpoint.
 * - Everything else uses the microlink.io metadata API for title + image,
 *   then falls back to direct HTML parsing for description if microlink
 *   didn't return one (via fetchMetaDescription / allorigins proxy).
 * Falls back gracefully if any request fails.
 */
export async function fetchLinkMetadata(url) {
  if (isImageUrl(url)) {
    return {
      title: getDomain(url),
      image: url,
      isImage: true,
      description: null,
    }
  }

  // Twitter / X — use oEmbed, don't send to microlink (it won't work there).
  if (isTwitterUrl(url)) {
    try {
      return await fetchTwitterMetadata(url)
    } catch {
      // oEmbed failed — fall through to the empty-metadata default below.
    }
    return {
      title: getDomain(url),
      image: null,
      isImage: false,
      description: null,
    }
  }

  // Generic URL — ask microlink for title + image, then scrape description
  // directly from the page HTML if microlink didn't return one.
  let title = getDomain(url)
  let image = null
  let description = null

  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false`
    )
    const json = await res.json()
    if (json.status === 'success') {
      title = json.data.title || title
      image = json.data.image?.url || json.data.logo?.url || null
      description = json.data.description || null
    }
  } catch {
    // microlink failure — keep defaults, still try meta scrape below
  }

  // If description still missing, try parsing <meta name="description"> directly.
  if (!description) {
    try {
      description = await fetchMetaDescription(url)
    } catch {
      // CORS proxy failure — leave description as null
    }
  }

  return { title, image, isImage: false, description }
}
