import { useRef, useEffect, useState } from 'react';
import './AudioVisualizer.css';

// Clear, crisp icons defined locally for maximum control
const PlayIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const AudioVisualizer = ({ src, onPlay }) => {
    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    // Use a ref to track playing state inside the animation loop to avoid closure staleness
    const isPlayingRef = useRef(false);

    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const analyserRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Initialize Audio Context and Analyser
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            // Connect audio element to analyser
            try {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
            } catch (e) {
                console.warn("CORS or Protocol issue with Web Audio API, falling back to basic playback.", e);
            }
        }
    };

    const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        analyserRef.current.getByteFrequencyData(dataArray);

        const width = canvas.width;
        const height = canvas.height;
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] / 255) * height; // Scale to canvas height

            // Dynamic HSL Color Shift for "Alive" feel
            const time = performance.now() / 40;
            const hue = ((i / bufferLength) * 360) + time;

            // Use HSL: High saturation, decent lightness for neon look
            ctx.fillStyle = `hsl(${hue % 360}, 90%, 60%)`;

            // Draw bars growing from bottom
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }

        if (isPlayingRef.current) {
            animationRef.current = requestAnimationFrame(draw);
        }
    };

    const togglePlay = async () => {
        if (!audioRef.current) return;

        // Resume context if suspended (browser requirements)
        if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            initAudioContext(); // Ensure context is ready on first play
            try {
                await audioRef.current.play();
                onPlay && onPlay();
            } catch (err) {
                console.error("Playback failed:", err);
            }
        }
    };

    // Events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            setIsPlaying(true);
            isPlayingRef.current = true;
            draw(); // Start loop
        };

        const handlePause = () => {
            setIsPlaying(false);
            isPlayingRef.current = false;
            cancelAnimationFrame(animationRef.current);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCurrentTime(0);
            cancelAnimationFrame(animationRef.current);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        // Resize canvas to fit container
        const resizeObserver = new ResizeObserver(entries => {
            if (canvasRef.current && entries[0]) {
                canvasRef.current.width = entries[0].contentRect.width;
                canvasRef.current.height = entries[0].contentRect.height;
            }
        });
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            cancelAnimationFrame(animationRef.current);
            resizeObserver.disconnect();
        };
    }, []);

    // Handle seeking
    const handleSeek = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    const formatTime = (time) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    return (
        <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`} ref={containerRef}>
            <canvas ref={canvasRef} className="viz-canvas" />

            <audio
                ref={audioRef}
                src={src}
                crossOrigin="anonymous"
                preload="metadata"
                onPlay={onPlay}
            />

            {!isPlaying && (
                <div className="play-overlay" onClick={togglePlay}>
                    <div className="play-icon-large">
                        <PlayIcon size={24} />
                    </div>
                </div>
            )}

            <div className="viz-controls">
                <button className="btn-play-pause" onClick={togglePlay}>
                    {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>

                <div className="viz-progress-container" onClick={handleSeek}>
                    <div
                        className="viz-progress-bar"
                        style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                </div>

                <div className="viz-time">
                    {formatTime(currentTime)}
                </div>
            </div>
        </div>
    );
};

export default AudioVisualizer;
