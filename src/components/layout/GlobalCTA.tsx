"use client";
import React, { useState, useRef, useEffect } from "react";
import thumbnail from "@/assets/screenshot.png";
import office from "@/assets/d000ab4e4d45c2420e8885344d33c191b167b033.png";

export default function GlobalCTA() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format time helper
  const formatTime = (time: number) => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Play/Pause handler
  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      if (videoDuration && isFinite(videoDuration)) {
        setDuration(videoDuration);
        setIsLoading(false);
      }
    }
  };

  // Handle video can play
  const handleCanPlay = () => {
    setIsLoading(false);
  };

  // Handle video loaded data
  const handleLoadedData = () => {
    setIsLoading(false);
  };

  // Handle video ended
  const handleVideoEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle video error
  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("Video failed to load:", e);
    setIsLoading(false);
  };

  // Initialize video when popup opens
  useEffect(() => {
    if (!isPopupOpen) return;

    const video = videoRef.current;
    if (!video) return;

    console.log("Setting up video events");

    const handleLoadStart = () => {
      console.log("Video load started");
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log("Video can play");
      setIsLoading(false);
    };

    const handleLoadedData = () => {
      console.log("Video data loaded");
      setIsLoading(false);
    };

    // Timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log("Video loading timeout - enabling play button");
      setIsLoading(false);
    }, 3000); // Reduced to 3 seconds

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("error", handleVideoError);

    // Force load the video
    video.load();

    return () => {
      clearTimeout(loadingTimeout);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("error", handleVideoError);
    };
  }, [isPopupOpen]);

  // Handle popup open
  const handlePopupOpen = () => {
    setIsPopupOpen(true);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);

    // Fallback: clear loading after 2 seconds regardless
    setTimeout(() => {
      console.log("Fallback: clearing loading state");
      setIsLoading(false);
    }, 2000);
  };

  // Close popup when clicking outside
  const handlePopupClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPopupOpen(false);
      setIsPlaying(false);
      setIsLoading(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  return (
    <>
      <section className="w-full flex flex-col lg:flex-row max-h-[500px]">
        {/* Left Section - Purple Background (50% on desktop, full width on mobile) */}
        <div className="w-full lg:w-[50%] bg-primary flex items-center px-6 sm:px-12 lg:px-56 py-8 lg:py-6">
          <div className="max-w-sm mx-auto lg:mx-0 text-center lg:text-left">
            <h2 className="text-white text-3xl sm:text-4xl lg:text-4xl font-bold leading-tight mb-4">
              Cómo funciona
            </h2>
            <p className="text-white text-base sm:text-lg leading-relaxed">
              Elige el servicio que necesitas, envía tu solicitud o mensaje
              directo y acuerda los detalles fácilmente desde tu panel.
            </p>
          </div>
        </div>

        {/* Right Section - Office Image with Play Button (50% on desktop, full width on mobile) */}
        <div className="w-full lg:w-[50%] relative h-[300px] lg:h-auto">
          <div
            className="w-full h-full relative cursor-pointer group"
            onClick={handlePopupOpen}
          >
            {/* Office Image */}
            <img
              src={office.src}
              alt="Office workspace with man on phone"
              className="w-full h-full object-cover"
            />

            {/* Large Circular Play Button - Responsive sizing */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <div className="w-0 h-0 border-l-[20px] sm:border-l-[24px] border-l-[#8B5CF6] border-t-[12px] sm:border-t-[16px] border-t-transparent border-b-[12px] sm:border-b-[16px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Popup Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={handlePopupClose}
        >
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
            {/* Close button */}
            <button
              onClick={() => {
                setIsPopupOpen(false);
                setIsPlaying(false);
                setIsLoading(false);
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
              className="absolute top-4 right-4 z-30 w-10 h-10 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all duration-200"
              aria-label="Cerrar video"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video container */}
            <div className="relative aspect-video bg-gray-100">
              {/* Background poster image - always visible when not playing */}
              <div
                className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10 transition-opacity duration-300 ${
                  isPlaying ? "opacity-0" : "opacity-100"
                }`}
                style={{ backgroundImage: `url(${thumbnail.src})` }}
              />

              {/* Video - only visible when playing */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isPlaying ? "opacity-100" : "opacity-0"
                }`}
                poster={thumbnail.src}
                preload="none"
                controls={false}
                playsInline
                muted
                onLoadStart={() => {
                  console.log("Video load start event");
                  setIsLoading(true);
                }}
                onCanPlay={() => {
                  console.log("Video can play event");
                  setIsLoading(false);
                }}
                onLoadedData={() => {
                  console.log("Video loaded data event");
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.log("Video error event", e);
                  setIsLoading(false);
                }}
              >
                <source src="/Naxine_V1_Music.mp4" type="video/mp4" />
                Tu navegador no soporta la reproducción de video.
              </video>

              {/* Play button overlay - always visible when not playing */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 ${
                      isLoading
                        ? "bg-gray-500 cursor-not-allowed opacity-50"
                        : "bg-black hover:bg-opacity-90 cursor-pointer"
                    }`}
                    aria-label="Reproducir video"
                  >
                    <div className="w-0 h-0 border-l-[24px] border-l-blue-500 border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent ml-1"></div>
                  </button>
                  {isLoading && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      Cargando video...
                    </div>
                  )}
                </div>
              )}

              {/* Video controls */}
              {isPlaying && (
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="flex items-center space-x-3 bg-black bg-opacity-70 rounded-lg px-4 py-2">
                    <button
                      onClick={togglePlayPause}
                      className="text-white hover:text-blue-400 transition-colors"
                      aria-label="Pausar"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    </button>

                    <div
                      className="flex-1 bg-gray-600 rounded-full h-2 cursor-pointer hover:h-3 transition-all duration-200 relative group"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-200 relative"
                        style={{
                          width: `${
                            duration > 0 ? (currentTime / duration) * 100 : 0
                          }%`,
                        }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                    </div>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
