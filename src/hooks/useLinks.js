import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchLinkMetadata, getDomain, normalizeUrl, isValidUrl } from '../lib/metadata'

export function useLinks(userId) {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setLinks(data)
      setError(null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const addLink = useCallback(
    async (rawUrl, tags = []) => {
      const url = normalizeUrl(rawUrl)
      if (!isValidUrl(url)) {
        throw new Error('That doesn\u2019t look like a valid link.')
      }

      const meta = await fetchLinkMetadata(url)

      const { data, error: insertError } = await supabase
        .from('links')
        .insert({
          user_id: userId,
          url,
          title: meta.title,
          image_url: meta.image,
          domain: getDomain(url),
          is_image: meta.isImage,
          tags,
        })
        .select()
        .single()

      if (insertError) throw insertError
      setLinks((prev) => [data, ...prev])
      return data
    },
    [userId]
  )

  const updateLink = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError
    setLinks((prev) => prev.map((l) => (l.id === id ? data : l)))
    return data
  }, [])

  const deleteLink = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('links').delete().eq('id', id)
    if (deleteError) throw deleteError
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  return { links, loading, error, addLink, updateLink, deleteLink, reload: load }
}
