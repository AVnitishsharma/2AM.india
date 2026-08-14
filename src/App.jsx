import React, { useState } from 'react'
import './App.css'
import Nav from './components/Nav'
import MusicPlayer from './components/MusicPlayer'

const App = () => {
  const [playlistId, setPlaylistId] = useState(
    'PLeJj53E_q1uY4WxZsEyAsx5n-rUYLZrqO'
  )

  return (
    <div className="App">
      <Nav setPlaylistId={setPlaylistId} />

      <div className="main">
        <h1>2AM</h1>
        <h1>INDIA</h1>
      </div>

      <MusicPlayer playlistId={playlistId} />
    </div>
  )
}

export default App