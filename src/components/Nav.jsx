import React, { useState, useEffect } from 'react'

const playlists = [
  { name: 'Bhojpuri', id: 'PLeJj53E_q1uY4WxZsEyAsx5n-rUYLZrqO' },
  { name: 'Chill Vibes', id: 'PLCU2AKdwPmvpuHDVrlI5ObzhOElwuMWOV' },
  { name: 'Relax Music', id: 'PLiAttA3ZvGfk1vuF8Xq7j24sBsg4QuH17' },
  { name: 'Lo-Fi Beats', id: 'PL115iZFgSUHaEbv9Why0FV7jvAN4qREdJ' },
  { name: 'Romantic Songs', id: 'PLM9icwZsTGjmRI_djMqyoWEQQ-BtxBptm' },
  { name: 'Focus Music', id: 'PL4taEUw-UM8QZ7NiTUm2mEpzia2ulckpi' }
]

const Nav = ({ setPlaylistId }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0].id)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePlaylistSelect = (id) => {
    setSelectedPlaylist(id)
    setPlaylistId(id)
  }

  return (
    <div className="nav">
      <h3>{time}</h3>

      <ul>
        <li className="playlist-nav">
          Playlists

          <div className="playlist-tooltip">
            {playlists.map((playlist) => (
              <div
                className={`playlist-item ${
                  selectedPlaylist === playlist.id ? 'selected' : ''
                }`}
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist.id)}
              >
                {playlist.name}
              </div>
            ))}
          </div>
        </li>

        <li>Wallpaper</li>

        <li><i class='bx bx-fullscreen'></i></li>
      </ul>
    </div>
  )
}

export default Nav