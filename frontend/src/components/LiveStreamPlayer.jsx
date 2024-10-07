import React, { useState, useRef, useEffect } from 'react';
import ReactHlsPlayer from 'react-hls-player';

const LiveStreamPlayer = ({ overlays, onOverlayDrag, onOverlaySelect, selectedOverlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [src, setSrc] = useState("");

  useEffect(() => {
    let retryCount = 0;

    const checkStream = async () => {
      try {
        const response = await fetch("http://localhost:8000/hls/stream.m3u8");
        if (response.status === 404) {
          retryCount += 1;
          console.log(`Stream not available, retrying (${retryCount})...`);
          setTimeout(checkStream, 2000); // Retry after 2 seconds
        } else if (response.ok) {
          console.log("Stream is available");
          setSrc("http://localhost:8000/hls/stream.m3u8");
        } else {
          console.error("Unexpected error:", response.status);
        }
      } catch (error) {
        console.error("Error fetching stream:", error);
        setTimeout(checkStream, 2000); // Retry after 2 seconds on error
      }
    };

    checkStream(); // Initial call to start polling

    return () => {
      retryCount = 0; // Reset retry count on cleanup
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      if (isFullscreenNow) {
        containerRef.current.style.position = 'fixed';
        containerRef.current.style.top = '0';
        containerRef.current.style.left = '0';
        containerRef.current.style.width = '100%';
        containerRef.current.style.height = '100%';
        containerRef.current.style.zIndex = '9999';
      } else {
        containerRef.current.style.position = 'relative';
        containerRef.current.style.width = '100%';
        containerRef.current.style.height = 'auto';
        containerRef.current.style.zIndex = 'auto';
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleOverlayMouseDown = (e, overlay) => {
    if (!onOverlayDrag || !onOverlaySelect) return;

    e.preventDefault();
    onOverlaySelect(overlay);

    const handleMouseMove = (moveEvent) => {
      onOverlayDrag(moveEvent, overlay);
    };


    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!overlays) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div ref={containerRef} className="relative">
        <ReactHlsPlayer
          playerRef={playerRef}
          src={src}
          autoPlay={true}
          controls={true}
          width="100%"
          height="auto"
          className="aspect-video"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {overlays && overlays.map((overlay) => (
            
          <div
            key={overlay._id}
            style={{
              position: 'absolute',
              top: `${overlay.position && overlay.position.y}%`,
              left: `${overlay.position &&  overlay.position.x}%`,
              width: `${overlay.size &&  overlay.size.width}%`,
              height: `${overlay.size &&  overlay.size.height}%`,
              cursor: onOverlayDrag ? 'move' : 'default',
              zIndex: isFullscreen ? '10000' : 'auto',
            }}
            className={`flex items-center justify-center ${
              overlay.type === 'text' ? 'bg-black bg-opacity-60 backdrop-blur-sm' : ''
            } text-white rounded-md transition-all duration-300 ${
              overlay.type === 'text' ? 'hover:bg-opacity-70' : ''
            } ${
              selectedOverlay && selectedOverlay._id === overlay._id ? 'ring-2 ring-blue-500' : ''
            }`}
            onMouseDown={(e) => handleOverlayMouseDown(e, overlay)}
          >
            {overlay.type === 'text' ? (
              <span 
                className="text-sm md:text-base lg:text-lg font-semibold"
                style={{
                  fontSize: `${Math.min(overlay.size.width, overlay.size.height) / 10}vw`
                }}
              >
                {overlay.content}
              </span>
            ) : overlay.type === 'image' ? (
              <img 
                src={overlay.content} 
                alt="Overlay" 
                className="object-contain" 
                style={{
                  width: '100%',
                  height: '100%'
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="p-4 flex flex-col items-center justify-center bg-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Live Stream</h2>
        <p className={`text-sm ${isPlaying ? 'text-emerald-400' : 'text-rose-400'} text-center`}>
          {src === "" ? 'Please wait while the stream loads...' : isPlaying ? "Stream is playing" : "Stream is paused"}
        </p>
      </div>
    </div>
  );
};

export default LiveStreamPlayer;