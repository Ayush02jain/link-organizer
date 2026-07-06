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

// ── Generic metadata fetcher ─────────────────────────────────────────────────

/**
 * Fetches title + preview image for a pasted link.
 * - Direct image URLs are returned immediately.
 * - Twitter/X URLs use the free oEmbed endpoint.
 * - Everything else uses the free microlink.io metadata API.
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

  try {
    const res = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=false`
    )
    const json = await res.json()
    if (json.status === 'success') {
      return {
        title: json.data.title || getDomain(url),
        image: json.data.image?.url || json.data.logo?.url || null,
        isImage: false,
        description: json.data.description || null,
      }
    }
  } catch {
    // network/API failure — fall through to defaults
  }

  return {
    title: getDomain(url),
    image: null,
    isImage: false,
    description: null,
  }
}
