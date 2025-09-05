"use client";
import React, { useState, useRef, useEffect } from "react";

import thumbnail from "@/assets/screenshot.png";

export default function AccesibilitySection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    console.log("Video metadata loaded");
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      console.log("Video duration:", videoDuration);
      if (videoDuration && isFinite(videoDuration)) {
        setDuration(videoDuration);
        setIsLoading(false);
      }
    }
  };

  // Handle video can play
  const handleCanPlay = () => {
    console.log("Video can play");
    setIsLoading(false);
  };

  // Handle video loaded data
  const handleLoadedData = () => {
    console.log("Video data loaded");
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
  const handleVideoError = (e: any) => {
    console.error("Video failed to load:", e);
    console.error("Video error details:", videoRef.current?.error);
    setIsLoading(false);
  };

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log("Video load started");
      setIsLoading(true);
    };

    // Timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log("Video loading timeout - enabling play button");
      setIsLoading(false);
    }, 10000); // 10 seconds timeout

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
  }, []);

  return (
    <section className="relative w-full py-16 px-4 sm:px-6 md:px-10 lg:px-[80px] bg-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Video container */}
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
            {/* Background poster image */}
            {!isPlaying && (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-10"
                style={{ backgroundImage: `url(${thumbnail.src})` }}
              />
            )}

            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${
                !isPlaying ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
              poster={thumbnail.src}
              preload="metadata"
              controls={false}
              playsInline
            >
              <source src="/Naxine_V1_Music.mp4" type="video/mp4" />
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Tu navegador no soporta la reproducción de video.
            </video>

            {/* Play button overlay */}
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
    </section>
  );
}
