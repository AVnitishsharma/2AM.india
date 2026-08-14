import React from 'react'
import './App.css'
import Nav from './components/Nav'
import MusicPlayer from './components/MusicPlayer'

const App = () => {
  return (
    <div className="App">
      <Nav />
      <div className="main">
        <h1>2AM</h1>
        <h1>INDIA</h1>
      </div>

      <MusicPlayer />
    </div>
  )
}

export default App