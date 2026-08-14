import React, { useState, useEffect } from 'react'

const Nav = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className='nav'>
        <h3>{time}</h3>
        <ul>
            <li>Playlists</li>
            <li>Wallpaper</li>
            <li>[ ]</li>
        </ul>
    </div>
  )
}

export default Nav