import { useEffect, useRef, useState } from "react";
import "./MusicPlayer.css";
import 'boxicons/css/boxicons.min.css';
import 'boxicons'



export default function MusicPlayer({ playlistId }) {
  const playerRef = useRef(null);
  const playerCreatedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Loading music...");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);

  // =========================================
  // CREATE YOUTUBE PLAYER
  // =========================================

  useEffect(() => {
    const createPlayer = () => {
      if (playerCreatedRef.current) return;

      const element = document.getElementById("youtube-player");

      if (!element) return;

      playerCreatedRef.current = true;

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "200",
        width: "200",

        playerVars: {
          controls: 0,
          playsinline: 1,
          rel: 0,
        },

        events: {
          // =====================================
          // PLAYER READY
          // =====================================

          onReady: (event) => {
            const player = event.target;

            // Default volume
            player.setVolume(70);
            setVolume(70);

            // Load current playlist
            if (playlistId) {
              player.loadPlaylist({
                list: playlistId,
                listType: "playlist",
                index: 0,
                startSeconds: 0,
              });
            }

            // Playlist loop
            player.setLoop(true);

            setTimeout(() => {
              try {
                const data = player.getVideoData();

                setTitle(data?.title || "Music");
                setDuration(player.getDuration() || 0);
              } catch (error) {
                console.log("Player info error:", error);
              }
            }, 1000);
          },

          // =====================================
          // STATE CHANGE
          // =====================================

          onStateChange: (event) => {
            const player = event.target;

            // PLAYING
            if (
              event.data ===
              window.YT.PlayerState.PLAYING
            ) {
              setPlaying(true);

              try {
                const data = player.getVideoData();

                setTitle(data?.title || "Music");
                setDuration(player.getDuration() || 0);
              } catch {}
            }

            // PAUSED
            else if (
              event.data ===
              window.YT.PlayerState.PAUSED
            ) {
              setPlaying(false);
            }

            // ENDED
            else if (
              event.data ===
              window.YT.PlayerState.ENDED
            ) {
              // YouTube playlist loop handle karega
            }
          },
        },
      });
    };

    // =========================================
    // YOUTUBE API ALREADY LOADED
    // =========================================

    if (window.YT?.Player) {
      createPlayer();
    }

    // =========================================
    // LOAD YOUTUBE API
    // =========================================

    else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");

        script.src =
          "https://www.youtube.com/iframe_api";

        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = createPlayer;
    }

    // =========================================
    // CLEANUP
    // =========================================

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  // =========================================
  // CHANGE PLAYLIST
  // =========================================

  useEffect(() => {
    if (!playerRef.current || !playlistId) return;

    try {
      const player = playerRef.current;

      // Stop old playlist
      player.stopVideo();

      // Load NEW playlist from first song
      player.loadPlaylist({
        list: playlistId,
        listType: "playlist",
        index: 0,
        startSeconds: 0,
      });

      // Loop playlist
      player.setLoop(true);

      // Reset UI
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setTitle("Loading music...");
    } catch (error) {
      console.log("Playlist change error:", error);
    }
  }, [playlistId]);

  // =========================================
  // PROGRESS
  // =========================================

  useEffect(() => {
    const interval = setInterval(() => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        const time = player.getCurrentTime();
        const total = player.getDuration();

        setCurrentTime(time || 0);
        setDuration(total || 0);

        const data = player.getVideoData();

        if (data?.title) {
          setTitle(data.title);
        }
      } catch {}
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================================
  // PLAY / PAUSE
  // =========================================

  const togglePlay = () => {
    if (!playerRef.current) return;

    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // =========================================
  // NEXT
  // =========================================

  const nextSong = () => {
    if (!playerRef.current) return;

    try {
      playerRef.current.nextVideo();
    } catch (error) {
      console.log("Next song error:", error);
    }
  };

  // =========================================
  // PREVIOUS
  // =========================================

  const previousSong = () => {
    if (!playerRef.current) return;

    try {
      playerRef.current.previousVideo();
    } catch (error) {
      console.log("Previous song error:", error);
    }
  };

  // =========================================
  // PROGRESS
  // =========================================

  const changeProgress = (e) => {
    if (!playerRef.current || !duration) {
      return;
    }

    const value = Number(e.target.value);

    playerRef.current.seekTo(value, true);

    setCurrentTime(value);
  };

  // =========================================
  // VOLUME
  // =========================================

  const changeVolume = (e) => {
    if (!playerRef.current) return;

    const value = Number(e.target.value);

    setVolume(value);

    playerRef.current.setVolume(value);

    if (value === 0) {
      playerRef.current.mute();
      setMuted(true);
    } else {
      playerRef.current.unMute();
      setMuted(false);
    }
  };

  // =========================================
  // MUTE / UNMUTE
  // =========================================

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (muted) {
      const newVolume = volume > 0 ? volume : 70;

      playerRef.current.unMute();
      playerRef.current.setVolume(newVolume);

      setVolume(newVolume);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  // =========================================
  // TIME FORMAT
  // =========================================

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) {
      return "0:00";
    }

    const min = Math.floor(seconds / 60);

    const sec = Math.floor(seconds % 60);

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // =========================================
  // UI
  // =========================================

  return (
    <>
      <div
        id="youtube-player"
        className="youtube-hidden"
      />

      <div className="music-player">

        {/* TOP ROW */}

        <div className="music-top">

          {/* SONG */}

          <div className="music-left">

            <div className="music-icon">
              🎵
            </div>

            <div className="song-info">

              <div className="song-title">
                {title}
              </div>

              <div className="song-subtitle">
                YouTube
              </div>

            </div>

          </div>

          {/* CONTROLS */}

          <div className="music-controls">

            <button
              className="control-btn"
              onClick={previousSong}
            >
              ⏮
            </button>

            <button
              className="play-btn"
              onClick={togglePlay}
            >
              {playing ? "❚❚" : "▶"}
            </button>

            <button
              className="control-btn"
              onClick={nextSong}
            >
              ⏭
            </button>

          </div>

          {/* VOLUME */}

          <div className="volume-area">

            <button
              className="volume-btn"
              onClick={toggleMute}
            >
              {muted ? <i class='bx bx-volume-mute' ></i> : <i class='bx bx-volume-full' ></i>}
            </button>

            <div className="volume-popup">

              <input
                type="range"
                min="0"
                max="100"
                value={muted ? 0 : volume}
                onChange={changeVolume}
              />

            </div>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="progress-area">

          <span>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={changeProgress}
          />

          <span>
            {formatTime(duration)}
          </span>

        </div>

      </div>
    </>
  );
}