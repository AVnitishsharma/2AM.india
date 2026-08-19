import React, { useState, useEffect, useRef } from 'react'
import playlists, { createPlaylistFromUrl } from '../data/playlists'

const STORAGE_KEY = '2am-custom-playlists'

const Nav = ({ setPlaylistId }) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [customPlaylists, setCustomPlaylists] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(playlists[0].id)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [playlistError, setPlaylistError] = useState('')
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const playlistNavRef = useRef(null)

  const allPlaylists = [...playlists, ...customPlaylists]

  useEffect(() => {
    try {
      const savedPlaylists = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (Array.isArray(savedPlaylists) && savedPlaylists.length) {
        setCustomPlaylists(savedPlaylists)
      }
    } catch (error) {
      console.error('Failed to load custom playlists:', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPlaylists))
    } catch (error) {
      console.error('Failed to save custom playlists:', error)
    }
  }, [customPlaylists])

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

  useEffect(() => {
    const handleOutsideTap = (event) => {
      if (!playlistNavRef.current?.contains(event.target)) {
        setIsPlaylistOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideTap)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideTap)
    }
  }, [])

  const handlePlaylistSelect = (id) => {
    setSelectedPlaylist(id)
    setPlaylistId(id)
    setIsPlaylistOpen(false)
  }

  const handleAddPlaylist = () => {
    const newPlaylist = createPlaylistFromUrl(playlistUrl, playlistName)

    if (!newPlaylist) {
      setPlaylistError('Enter a valid YouTube playlist URL or playlist ID.')
      return
    }

    const playlistExists = allPlaylists.some((playlist) => playlist.id === newPlaylist.id)

    if (playlistExists) {
      setSelectedPlaylist(newPlaylist.id)
      setPlaylistId(newPlaylist.id)
      setPlaylistUrl('')
      setPlaylistName('')
      setPlaylistError('')
      return
    }

    setCustomPlaylists((prevPlaylists) => [newPlaylist, ...prevPlaylists])
    setSelectedPlaylist(newPlaylist.id)
    setPlaylistId(newPlaylist.id)
    setPlaylistUrl('')
    setPlaylistName('')
    setPlaylistError('')
  }

  const handleDeletePlaylist = (playlistIdToDelete) => {
    if (!playlistIdToDelete) {
      return
    }

    setCustomPlaylists((prevPlaylists) => {
      const updated = prevPlaylists.filter((playlist) => playlist.id !== playlistIdToDelete)

      if (selectedPlaylist === playlistIdToDelete) {
        const nextPlaylist = updated[0] || playlists[0]
        setSelectedPlaylist(nextPlaylist.id)
        setPlaylistId(nextPlaylist.id)
      }

      return updated
    })
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
        <li
          ref={playlistNavRef}
          className={`playlist-nav ${isPlaylistOpen ? 'open' : ''}`}
          onClick={() => setIsPlaylistOpen((isOpen) => !isOpen)}
        >
          Playlists <i className='bx bx-down-arrow-alt' ></i>

          <div className="playlist-tooltip" onClick={(event) => event.stopPropagation()}>
            {allPlaylists.map((playlist) => {
              const isCustom = customPlaylists.some((item) => item.id === playlist.id)

              return (
                <div
                  className={`playlist-item ${selectedPlaylist === playlist.id ? 'selected' : ''
                    }`}
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist.id)}
                >
                  <span>{playlist.name}</span>

                  {isCustom ? (
                    <button
                      type="button"
                      className="playlist-delete-button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDeletePlaylist(playlist.id)
                      }}
                      aria-label={`Delete ${playlist.name}`}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              )
            })}

            <div className="playlist-add-section">
              <input
                type="text"
                className="playlist-form-input"
                placeholder="Paste YouTube playlist URL"
                value={playlistUrl}
                onChange={(event) => setPlaylistUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddPlaylist()
                  }
                }}
              />

              <input
                type="text"
                className="playlist-form-input"
                placeholder="Optional playlist name"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddPlaylist()
                  }
                }}
              />

              <button type="button" className="playlist-form-button" onClick={handleAddPlaylist}>
                Add playlist
              </button>

              {playlistError ? <p className="playlist-error">{playlistError}</p> : null}
            </div>
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