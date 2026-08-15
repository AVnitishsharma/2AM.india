import React, { useState, useEffect } from 'react'
import playlists from '../data/playlists'

const Nav = ({ setPlaylistId }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0].id)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handlePlaylistSelect = (id) => {
    setSelectedPlaylist(id)
    setPlaylistId(id)
  }

  const goFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  return (
    <div className="nav">
      <h3>{time}</h3>

      <ul>
        <li className="playlist-nav">
          Playlists <i class='bx bx-down-arrow-alt' ></i>

          <div className="playlist-tooltip">
            {playlists.map((playlist) => (
              <div
                className={`playlist-item ${selectedPlaylist === playlist.id ? 'selected' : ''
                  }`}
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist.id)}
              >
                {playlist.name}
              </div>
            ))}
          </div>
        </li>

        <li className="fullscreen-toggle">
          <i
            className={`bx ${isFullscreen ? 'bx-exit-fullscreen' : 'bx-fullscreen'}`}
            onClick={goFullscreen}
          ></i>
        </li>
      </ul>
    </div>
  )
}

export default Nav