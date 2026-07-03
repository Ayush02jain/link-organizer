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

/**
 * Fetches title + preview image for a pasted link using the free
 * microlink.io metadata API (no key required for light personal use).
 * Falls back gracefully if the request fails or the link is an image.
 */
export async function fetchLinkMetadata(url) {
  if (isImageUrl(url)) {
    return {
      title: getDomain(url),
      image: url,
      isImage: true,
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
      }
    }
  } catch {
    // network/API failure — fall through to defaults
  }

  return {
    title: getDomain(url),
    image: null,
    isImage: false,
  }
}
