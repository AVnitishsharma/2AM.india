import { useEffect, useRef, useState } from "react";
import "./MusicPlayer.css";
import "boxicons/css/boxicons.min.css";
import "boxicons";

export default function MusicPlayer({ playlistId }) {
  const playerRef = useRef(null);
  const playerCreatedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [title, setTitle] = useState("Loading music...");
  const [thumbnail, setThumbnail] = useState("");
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

      const element = document.getElementById(
        "youtube-player"
      );

      if (!element) return;

      playerCreatedRef.current = true;

      playerRef.current = new window.YT.Player(
        "youtube-player",
        {
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
                  const data =
                    player.getVideoData();

                  setTitle(
                    data?.title || "Music"
                  );

                  // Current song image
                  if (data?.video_id) {
                    setThumbnail(
                      `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`
                    );
                  }

                  setDuration(
                    player.getDuration() || 0
                  );
                } catch (error) {
                  console.log(
                    "Player info error:",
                    error
                  );
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
                  const data =
                    player.getVideoData();

                  setTitle(
                    data?.title || "Music"
                  );

                  // Current song image update
                  if (data?.video_id) {
                    setThumbnail(
                      `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`
                    );
                  }

                  setDuration(
                    player.getDuration() || 0
                  );
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
        }
      );
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
      const existingScript =
        document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
        );

      if (!existingScript) {
        const script =
          document.createElement("script");

        script.src =
          "https://www.youtube.com/iframe_api";

        document.body.appendChild(script);
      }

      window.onYouTubeIframeAPIReady =
        createPlayer;
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
    if (
      !playerRef.current ||
      !playlistId
    )
      return;

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
      setThumbnail("");
    } catch (error) {
      console.log(
        "Playlist change error:",
        error
      );
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

        const time =
          player.getCurrentTime();

        const total =
          player.getDuration();

        setCurrentTime(time || 0);
        setDuration(total || 0);

        const data =
          player.getVideoData();

        if (data?.title) {
          setTitle(data.title);
        }

        // Current song image
        if (data?.video_id) {
          setThumbnail(
            `https://img.youtube.com/vi/${data.video_id}/hqdefault.jpg`
          );
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
      console.log(
        "Next song error:",
        error
      );
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
      console.log(
        "Previous song error:",
        error
      );
    }
  };

  // =========================================
  // PROGRESS
  // =========================================

  const changeProgress = (e) => {
    if (
      !playerRef.current ||
      !duration
    ) {
      return;
    }

    const value =
      Number(e.target.value);

    playerRef.current.seekTo(
      value,
      true
    );

    setCurrentTime(value);
  };

  // =========================================
  // VOLUME
  // =========================================

  const changeVolume = (e) => {
    if (!playerRef.current) return;

    const value =
      Number(e.target.value);

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
      const newVolume =
        volume > 0 ? volume : 70;

      playerRef.current.unMute();

      playerRef.current.setVolume(
        newVolume
      );

      setVolume(newVolume);
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  // =========================================
  // KEYBOARD CONTROL
  // =========================================

  useEffect(() => {
    let leftHoldTimer = null;
    let rightHoldTimer = null;

    let upHoldTimer = null;
    let downHoldTimer = null;

    let leftHeld = false;
    let rightHeld = false;

    let upHeld = false;
    let downHeld = false;

    let leftHoldStarted = false;
    let rightHoldStarted = false;

    // =====================================
    // 10 SEC BACKWARD
    // =====================================

    const seekBackward = () => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        const current =
          player.getCurrentTime();

        const newTime =
          Math.max(0, current - 10);

        player.seekTo(
          newTime,
          true
        );

        setCurrentTime(newTime);
      } catch {}
    };

    // =====================================
    // 10 SEC FORWARD
    // =====================================

    const seekForward = () => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        const current =
          player.getCurrentTime();

        const total =
          player.getDuration();

        const newTime =
          Math.min(
            total,
            current + 10
          );

        player.seekTo(
          newTime,
          true
        );

        setCurrentTime(newTime);
      } catch {}
    };

    // =====================================
    // VOLUME UP
    // =====================================

    const increaseVolume = () => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        const currentVolume =
          player.isMuted()
            ? 0
            : player.getVolume();

        const newVolume =
          Math.min(
            100,
            currentVolume + 5
          );

        player.unMute();
        player.setVolume(newVolume);

        setVolume(newVolume);
        setMuted(false);
      } catch {}
    };

    // =====================================
    // VOLUME DOWN
    // =====================================

    const decreaseVolume = () => {
      if (!playerRef.current) return;

      try {
        const player = playerRef.current;

        const currentVolume =
          player.isMuted()
            ? 0
            : player.getVolume();

        const newVolume =
          Math.max(
            0,
            currentVolume - 5
          );

        player.setVolume(newVolume);

        setVolume(newVolume);

        if (newVolume === 0) {
          player.mute();
          setMuted(true);
        } else {
          player.unMute();
          setMuted(false);
        }
      } catch {}
    };

    // =====================================
    // KEY DOWN
    // =====================================

    const handleKeyDown = (e) => {
      // Agar user input field me type kar raha hai
      // to keyboard music control nahi karega

      const tagName =
        e.target.tagName.toLowerCase();

      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select"
      ) {
        return;
      }

      // =====================================
      // SPACE = PLAY / PAUSE
      // =====================================

      if (e.code === "Space") {
        e.preventDefault();

        if (!e.repeat) {
          togglePlay();
        }

        return;
      }

      // =====================================
      // LEFT ARROW
      // =====================================

      if (e.code === "ArrowLeft") {
        e.preventDefault();

        if (e.repeat) {
          return;
        }

        if (leftHeld) {
          return;
        }

        leftHeld = true;
        leftHoldStarted = false;

        leftHoldTimer = setTimeout(() => {
          leftHoldStarted = true;

          // First 10 sec backward
          seekBackward();

          // Hold karte rehne par
          // har 500ms me 10 sec backward

          leftHoldTimer = setInterval(() => {
            seekBackward();
          }, 500);
        }, 400);

        return;
      }

      // =====================================
      // RIGHT ARROW
      // =====================================

      if (e.code === "ArrowRight") {
        e.preventDefault();

        if (e.repeat) {
          return;
        }

        if (rightHeld) {
          return;
        }

        rightHeld = true;
        rightHoldStarted = false;

        rightHoldTimer = setTimeout(() => {
          rightHoldStarted = true;

          // First 10 sec forward
          seekForward();

          // Hold karte rehne par
          // har 500ms me 10 sec forward

          rightHoldTimer = setInterval(() => {
            seekForward();
          }, 500);
        }, 400);

        return;
      }

      // =====================================
      // UP ARROW = VOLUME UP
      // =====================================

      if (e.code === "ArrowUp") {
        e.preventDefault();

        if (e.repeat) {
          return;
        }

        if (upHeld) {
          return;
        }

        upHeld = true;

        // First volume +5
        increaseVolume();

        // 400ms ke baad hold mode
        upHoldTimer = setTimeout(() => {
          upHoldTimer = setInterval(() => {
            increaseVolume();
          }, 150);
        }, 400);

        return;
      }

      // =====================================
      // DOWN ARROW = VOLUME DOWN
      // =====================================

      if (e.code === "ArrowDown") {
        e.preventDefault();

        if (e.repeat) {
          return;
        }

        if (downHeld) {
          return;
        }

        downHeld = true;

        // First volume -5
        decreaseVolume();

        // 400ms ke baad hold mode
        downHoldTimer = setTimeout(() => {
          downHoldTimer = setInterval(() => {
            decreaseVolume();
          }, 150);
        }, 400);

        return;
      }

      // =====================================
      // M = MUTE
      // =====================================

      if (e.key.toLowerCase() === "m") {
        e.preventDefault();

        if (!e.repeat) {
          toggleMute();
        }
      }
    };

    // =====================================
    // KEY UP
    // =====================================

    const handleKeyUp = (e) => {
      // =====================================
      // LEFT ARROW RELEASE
      // =====================================

      if (e.code === "ArrowLeft") {
        e.preventDefault();

        if (leftHoldTimer) {
          clearTimeout(leftHoldTimer);
          clearInterval(leftHoldTimer);

          leftHoldTimer = null;
        }

        // Short press = Previous song
        if (
          leftHeld &&
          !leftHoldStarted
        ) {
          previousSong();
        }

        leftHeld = false;
        leftHoldStarted = false;

        return;
      }

      // =====================================
      // RIGHT ARROW RELEASE
      // =====================================

      if (e.code === "ArrowRight") {
        e.preventDefault();

        if (rightHoldTimer) {
          clearTimeout(rightHoldTimer);
          clearInterval(rightHoldTimer);

          rightHoldTimer = null;
        }

        // Short press = Next song
        if (
          rightHeld &&
          !rightHoldStarted
        ) {
          nextSong();
        }

        rightHeld = false;
        rightHoldStarted = false;

        return;
      }

      // =====================================
      // UP ARROW RELEASE
      // =====================================

      if (e.code === "ArrowUp") {
        e.preventDefault();

        if (upHoldTimer) {
          clearTimeout(upHoldTimer);
          clearInterval(upHoldTimer);

          upHoldTimer = null;
        }

        upHeld = false;

        return;
      }

      // =====================================
      // DOWN ARROW RELEASE
      // =====================================

      if (e.code === "ArrowDown") {
        e.preventDefault();

        if (downHoldTimer) {
          clearTimeout(downHoldTimer);
          clearInterval(downHoldTimer);

          downHoldTimer = null;
        }

        downHeld = false;

        return;
      }
    };

    // =====================================
    // ADD EVENTS
    // =====================================

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    // =====================================
    // CLEANUP
    // =====================================

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      if (leftHoldTimer) {
        clearTimeout(leftHoldTimer);
        clearInterval(leftHoldTimer);
      }

      if (rightHoldTimer) {
        clearTimeout(rightHoldTimer);
        clearInterval(rightHoldTimer);
      }

      if (upHoldTimer) {
        clearTimeout(upHoldTimer);
        clearInterval(upHoldTimer);
      }

      if (downHoldTimer) {
        clearTimeout(downHoldTimer);
        clearInterval(downHoldTimer);
      }
    };
  }, [playing, muted, volume]);

  // =========================================
  // TIME FORMAT
  // =========================================

  const formatTime = (seconds) => {
    if (
      !seconds ||
      Number.isNaN(seconds)
    ) {
      return "0:00";
    }

    const min =
      Math.floor(seconds / 60);

    const sec =
      Math.floor(seconds % 60);

    return `${min}:${sec
      .toString()
      .padStart(2, "0")}`;
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

            <div
              className={`music-icon ${
                playing ? "rotating" : ""
              }`}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title}
                  className="song-thumbnail"
                />
              ) : (
                "🎵"
              )}
            </div>

            <div className="song-info">

              <div className="song-title">
                {title}
              </div>

              <div className="song-subtitle">
                YouTube
              </div>

              {/* PROGRESS BAR
                  SIRF SONG INFO KE NICHE */}

              <div className="progress-area">

                <span>
                  {formatTime(
                    currentTime
                  )}
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
              {playing
                ? "❚❚"
                : "▶"}
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
              {muted ? (
                <i className="bx bx-volume-mute"></i>
              ) : (
                <i className="bx bx-volume-full"></i>
              )}
            </button>

            <div className="volume-popup">

              <input
                type="range"
                min="0"
                max="100"
                value={
                  muted ? 0 : volume
                }
                onChange={changeVolume}
              />

            </div>

          </div>

        </div>

      </div>

      <p className="credit">
        • Created by{" "}
        <a
          href="https://github.com/AVnitishsharma"
          target="_blank"
          rel="noreferrer"
        >
          Nitish Sharma
        </a>
      </p>
    </>
  );
}
