import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import PauseCircleFilledIcon from "@mui/icons-material/PauseCircleFilled";
import CloseIcon from "@mui/icons-material/Close";
import Navbar from './Nav'; // Adjust path as needed
import Footer from './Footer'; // Adjust path as needed
import aboutImg from "../assets/images/Capture122.PNG"; // Placeholder thumbnail

// Video card styling with enhanced hover effects
const VideoCard = styled(Box)(({ theme }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  position: "relative",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  height: "250px", // Increased height for better visibility
  marginBottom: "30px", // Increased spacing between cards
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 25px rgba(0,0,0,0.15)",
  },
  [theme.breakpoints.down("md")]: {
    height: "200px",
  },
  [theme.breakpoints.down("sm")]: {
    height: "180px",
  },
}));

const VideoAdvicePage = () => {
  // Video data
  const [videoAdvices] = useState([
    { id: 1, title: "Understanding Your Medication", duration: "5:20", thumbnail: aboutImg, videoUrl: "https://example.com/video1.mp4" },
    { id: 2, title: "Home Exercises for Back Pain", duration: "7:45", thumbnail: aboutImg, videoUrl: "https://example.com/video2.mp4" },
    { id: 3, title: "Nutrition Tips for Recovery", duration: "4:15", thumbnail: aboutImg, videoUrl: "https://example.com/video3.mp4" },
    { id: 4, title: "Managing Chronic Conditions", duration: "8:30", thumbnail: aboutImg, videoUrl: "https://example.com/video4.mp4" },
  ]);

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [videoError, setVideoError] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const videoRef = useRef(null);

  // Format time in minutes:seconds
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Simulate video loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current && isFinite(videoRef.current.duration)) {
      setDuration(formatTime(videoRef.current.duration));
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update progress bar and current time
  const handleTimeUpdate = () => {
    if (videoRef.current && isFinite(videoRef.current.currentTime) && isFinite(videoRef.current.duration)) {
      const currentVideoTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;

      if (videoDuration > 0) {
        const progressPercent = (currentVideoTime / videoDuration) * 100;
        setProgress(progressPercent);
        setCurrentTime(formatTime(currentVideoTime));
      }
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    if (!videoRef.current || !isFinite(videoRef.current.duration) || videoRef.current.duration === 0) {
      return;
    }

    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.clientWidth;

    if (progressBarWidth <= 0) {
      return;
    }

    const seekPercentage = clickPosition / progressBarWidth;
    const seekTime = seekPercentage * videoRef.current.duration;

    if (isFinite(seekTime) && seekTime >= 0 && seekTime <= videoRef.current.duration) {
      videoRef.current.currentTime = seekTime;
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isFinite(value) && videoRef.current) {
      setVolume(value);
      videoRef.current.volume = value;
    }
  };

  // Toggle info overlay
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Handle video loading error
  const handleVideoError = (e) => {
    console.error("Video loading error:", e);
    setIsLoading(false);
    setVideoError(true);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    } else {
      const videoContainer = document.querySelector(".video-container");
      if (videoContainer) {
        videoContainer.requestFullscreen().catch((err) => {
          console.error("Error entering fullscreen:", err);
        });
      }
    }
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return;

      if (e.code === "Space") {
        togglePlay();
        e.preventDefault();
      } else if (e.code === "ArrowRight") {
        if (isFinite(videoRef.current.currentTime) && isFinite(videoRef.current.duration)) {
          const newTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
          videoRef.current.currentTime = newTime;
        }
        e.preventDefault();
      } else if (e.code === "ArrowLeft") {
        if (isFinite(videoRef.current.currentTime)) {
          const newTime = Math.max(0, videoRef.current.currentTime - 10);
          videoRef.current.currentTime = newTime;
        }
        e.preventDefault();
      } else if (e.code === "ArrowUp") {
        const newVolume = Math.min(1, parseFloat(volume) + 0.1);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        e.preventDefault();
      } else if (e.code === "ArrowDown") {
        const newVolume = Math.max(0, parseFloat(volume) - 0.1);
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
        e.preventDefault();
      } else if (e.code === "KeyI") {
        toggleInfo();
        e.preventDefault();
      } else if (e.code === "KeyF") {
        toggleFullscreen();
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, volume]);

  // Handle video selection
  const handlePlayVideo = (video) => {
    setActiveVideo(video);
    setIsPlaying(true);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Simulate loading
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActiveVideo(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("0:00");
  };

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* Navigation */}
      <Navbar />

      {/* Video Advice Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: "#fff" }}>
        <Container>
          <Row className="mb-5">
            <Col xs={12} className="text-center">
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                Video Advice
              </Typography>
              <Typography variant="body1" sx={{ color: "#555", maxWidth: "700px", mx: "auto" }}>
                Watch our experts share valuable health tips and insights.
              </Typography>
            </Col>
          </Row>
          <Row>
            {videoAdvices.map((video) => (
              <Col key={video.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <VideoCard onClick={() => handlePlayVideo(video)}>
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      p: 2,
                      color: "#fff",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PlayCircleFilledIcon sx={{ mr: 1, fontSize: "1.5rem" }} />
                      <Typography variant="caption">{video.duration}</Typography>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {video.title}
                    </Typography>
                  </Box>
                </VideoCard>
              </Col>
            ))}
          </Row>
        </Container>

        {/* Video Modal/Overlay */}
        {activeVideo && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 1300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                width: "80%",
                maxWidth: "900px",
                position: "relative",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              {isLoading && (
                <div className="loading-screen" style={{ position: "absolute", width: "100%", height: "100%", background: "rgba(0,0,0,0.8)" }}>
                  <div className="loading-logo">VIDEOPLAYER</div>
                  <div className="loading-spinner"></div>
                  <div className="loading-text">Loading your video...</div>
                </div>
              )}

              {videoError && (
                <div className="video-error" style={{ position: "absolute", width: "100%", height: "100%", background: "rgba(0,0,0,0.8)" }}>
                  <div className="error-message">
                    <h3>Video Error</h3>
                    <p>Unable to load the video. Please try again.</p>
                  </div>
                </div>
              )}

              <div className="video-container">
                <video
                  ref={videoRef}
                  className="video"
                  onClick={togglePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleMetadataLoaded}
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {!isPlaying && !isLoading && !videoError && (
                  <div className="video-overlay" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <button className="play-button-large" onClick={togglePlay} style={{ fontSize: "3rem", background: "none", border: "none", color: "#fff" }}>
                      ▶
                    </button>
                  </div>
                )}

                <div className="controls-container" style={{ position: "absolute", bottom: 0, width: "100%", background: "rgba(0,0,0,0.5)", padding: "10px" }}>
                  <div className="progress-container" onClick={handleSeek} style={{ height: "5px", background: "#555", cursor: "pointer" }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%`, height: "100%", background: "#0d6efd" }}></div>
                    </div>
                  </div>

                  <div className="controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
                    <div className="left-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button className="control-button" onClick={togglePlay} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}>
                        {isPlaying ? "❚❚" : "▶"}
                      </button>

                      <div className="time-display" style={{ fontSize: "0.9rem" }}>
                        <span>{currentTime}</span>
                        <span className="time-separator">/</span>
                        <span>{duration}</span>
                      </div>
                    </div>

                    <div className="right-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="volume-container" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span className="volume-icon">{volume > 0 ? "🔊" : "🔇"}</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="volume-slider"
                          style={{ width: "80px" }}
                        />
                      </div>

                      <button className="control-button" onClick={toggleInfo} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}>
                        ℹ️
                      </button>

                      <button className="control-button" onClick={toggleFullscreen} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.2rem" }}>
                        ⛶
                      </button>
                    </div>
                  </div>
                </div>

                {showInfo && (
                  <div className="info-overlay" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className="info-content" style={{ background: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "400px" }}>
                      <h2 className="info-title" style={{ fontSize: "1.5rem", marginBottom: "10px" }}>About This Video</h2>
                      <p className="info-text" style={{ marginBottom: "15px" }}>
                        {activeVideo.title} - {activeVideo.duration}
                      </p>
                      <h3 className="info-subtitle" style={{ fontSize: "1.2rem", marginBottom: "10px" }}>Keyboard Controls:</h3>
                      <ul className="info-list" style={{ listStyle: "none", padding: 0 }}>
                        <li>Space: Play/Pause</li>
                        <li>Left/Right Arrows: Seek -/+ 10 seconds</li>
                        <li>Up/Down Arrows: Volume +/-</li>
                        <li>I: Toggle this info panel</li>
                        <li>F: Toggle fullscreen</li>
                      </ul>
                      <button className="close-button" onClick={toggleInfo} style={{ marginTop: "10px", padding: "5px 10px", background: "#0d6efd", color: "#fff", border: "none", borderRadius: "5px" }}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <IconButton
                onClick={handleCloseVideo}
                sx={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ color: "#fff", mt: 2 }}>
              {activeVideo.title}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default VideoAdvicePage;