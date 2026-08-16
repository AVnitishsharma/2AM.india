const playlists = [
  { name: 'Chill Vibes', id: 'PLCU2AKdwPmvpuHDVrlI5ObzhOElwuMWOV' },
  { name: 'Lo-Fi Beats', id: 'PL115iZFgSUHaEbv9Why0FV7jvAN4qREdJ' },
  { name: 'Romantic Songs', id: 'PLM9icwZsTGjmRI_djMqyoWEQQ-BtxBptm' },
  { name: 'Focus Music', id: 'PL4taEUw-UM8QZ7NiTUm2mEpzia2ulckpi' },
  { name: '1990s', id: 'PLMRKdK25AuPVjHl9Kdb-gkBy0Cm7Zi2xo' },
  { name: '1980s', id: 'RDCLAK5uy_mP4pii3gdJ6A8EhnMZ8mCUlay7NyZnh6I' },
  { name: 'Sad Hindi Songs', id: 'PLD3D38094FD996326' },
  { name: 'Punjabi', id: 'PLO7-VO1D0_6NYoMAN0XncJu4tvibirSmN' },
  { name: 'Bhojpuri', id: 'PLGqUOt0CNckJib_vLMdgWzmIRd2X7dG5Z' },
]

export const getPlaylistIdFromUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  const directPlaylistId = trimmedValue.match(/^[A-Za-z0-9_-]{10,}$/)
  if (directPlaylistId) {
    return directPlaylistId[0]
  }

  const normalizedValue = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : trimmedValue.includes('youtube.com') || trimmedValue.includes('youtu.be')
      ? `https://${trimmedValue}`
      : trimmedValue

  const listParamMatch = normalizedValue.match(/[?&]list=([A-Za-z0-9_-]+)/i)
  if (listParamMatch) {
    return listParamMatch[1]
  }

  try {
    const parsedUrl = new URL(normalizedValue)
    const playlistId = parsedUrl.searchParams.get('list')
    if (playlistId) {
      return playlistId
    }
  } catch (error) {
    return null
  }

  return null
}

export const createPlaylistFromUrl = (value, customName = '') => {
  const playlistId = getPlaylistIdFromUrl(value)

  if (!playlistId) {
    return null
  }

  return {
    id: playlistId,
    name: customName.trim() || `Playlist ${playlistId.slice(0, 6)}`,
  }
}

export default playlists