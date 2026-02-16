"use client";

import { useEffect, useState } from "react";
import { usePlayer } from '@/components/player-context';
import { useUI } from '@/components/ui-context';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/song-utils";

export function PlayerBar() {
    const {
        audioRef,
        currentTrack,
        // queue,
        // shuffle,
        // repeat,
        isPlaying,
        // isLoading,
        // playedTracks,

        // playTrack,
        playNext,
        playPrev,

        // addToQueue,
        // clearQueue,
        // removeTrackFromQueue,
        // skipToTrackInQueue,
        // addAlbumToQueue,

        // playAlbum,

        // toggleShuffle,
        // toggleRepeat,
        setIsPlaying,
        seekTo,
        setVolume,
        toggleMute,
    } = usePlayer();
    const { queueOpen, toggleQueue, isMobile } = useUI();

    // const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolumeState] = useState(100);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const update = () => {
            if (!seeking) {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration || 0);
                setProgressPercent(
                    audio.duration
                        ? (audio.currentTime / audio.duration) * 100
                        : 0
                );
            }
        };

        const updateVolume = () => {
            setVolumeState(audio.muted ? 0 : audio.volume * 100);
        };

        audio.addEventListener("timeupdate", update);
        audio.addEventListener("loadedmetadata", update);
        audio.addEventListener("volumechange", updateVolume);

        updateVolume();

        return () => {
            audio.removeEventListener("timeupdate", update);
            audio.removeEventListener("loadedmetadata", update);
            audio.removeEventListener("volumechange", updateVolume);
        };
    }, [audioRef, seeking]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const handleSeek = (value: number) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        const newTime = (value / 100) * audio.duration;
        seekTo(newTime);
    };

    const toggleMuteHandler = () => {
        toggleMute();
        setMuted(audioRef.current?.muted ?? false);
    };


    const handleSeekEnd = () => setSeeking(false);

    const formattedCurrent = formatDuration(Math.floor(currentTime || 0));
    const formattedDuration = formatDuration(Math.floor(duration || 0));

    return (
        <>
            {/* Desktop player bar */}
            <div className="hidden md:grid fixed bottom-0 left-0 right-0 z-50 m-[26px] max-h-[90px] bg-playerbar backdrop-blur-xs rounded-2xl p-2.5 grid-cols-[375px_1fr_375px] items-center">
                <div className="flex items-center gap-4">
                    <div className="relative w-[70px] h-[70px] rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <Image
                            src={currentTrack?.coverArt || '/albumplaceholder.svg'}
                            alt={currentTrack?.name || "No track"}
                            fill
                            className="object-cover"
                            draggable={false}
                        />
                    </div>
                    <div className="flex flex-col justify-center leading-none overflow-hidden">
                        <p className="text-md font-medium text-zinc-100 truncate m-0">
                            {currentTrack?.name ?? "No track playing"}
                        </p>
                        <p className="text-sm text-zinc-300 truncate m-0">
                            {currentTrack?.artist ?? ""}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center w-full max-w-[628px] justify-self-center">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-6 mt-1">
                            <Button
                                asChild
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                            >
                                <Image
                                    src="/icons/shuffle.svg"
                                    alt="Shuffle"
                                    width={40}
                                    height={40}
                                    draggable={false}
                                />
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                onClick={() => {
                                    playPrev();
                                }}
                                className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                            >
                                <Image
                                    src="/icons/prev.svg"
                                    alt="Previous"
                                    width={40}
                                    height={40}
                                    draggable={false}
                                />
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                onClick={togglePlayPause}
                                className="h-10 w-10 p-0 hover:bg-transparent cursor-pointer select-none"
                            >
                                <Image
                                    src={
                                        isPlaying
                                            ? "/icons/pause.svg"
                                            : "/icons/play.svg"
                                    }
                                    alt={isPlaying ? "Pause" : "Play"}
                                    width={48}
                                    height={48}
                                    draggable={false}
                                />
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                onClick={() => {
                                    playNext();
                                }}
                                className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                            >
                                <Image
                                    src="/icons/next.svg"
                                    alt="Next"
                                    width={40}
                                    height={40}
                                    draggable={false}
                                />
                            </Button>

                            <Button
                                asChild
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                            >
                                <Image
                                    src="/icons/repeat.svg"
                                    alt="Repeat"
                                    width={40}
                                    height={40}
                                    draggable={false}
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 w-full mt-2.5 font-satoshi">
                        <span className="text-xs text-accent">{formattedCurrent}</span>
                        <Slider
                            value={[progressPercent]}
                            onValueChange={([v]) => {
                                setSeeking(true);
                                setProgressPercent(v);
                            }}
                            onValueCommit={([v]) => {
                                handleSeek(v);
                                handleSeekEnd();
                            }}
                            max={100}
                            step={0.1}
                            className="flex-1 max-w-[480px] cursor-pointer **:data-[slot=slider-track]:h-1.25 **:data-[slot=slider-thumb]:w-2.5 **:data-[slot=slider-thumb]:h-2.5"
                        />
                        <span className="text-xs text-accent">{formattedDuration}</span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-5 mr-3">
                    <div className="flex items-center gap-3">
                        <Button
                            asChild
                            variant="ghost"
                            onClick={toggleMuteHandler}
                            className="h-5 w-5 p-0 hover:bg-transparent cursor-pointer select-none"
                        >
                            <Image
                                src={muted ? "/icons/mute.svg" : "/icons/volume.svg"}
                                alt={muted ? "Muted" : "Volume"}
                                width={22}
                                height={22}
                                draggable={false}
                            />
                        </Button>
                        <Slider
                            value={[volume]}
                            max={100}
                            step={1}
                            onValueChange={([v]) => setVolume(v / 100)}
                            className="w-[80px] cursor-pointer **:data-[slot=slider-track]:h-1 **:data-[slot=slider-thumb]:w-2 **:data-[slot=slider-thumb]:h-2"
                        />
                    </div>

                    <div className="w-[1.5px] h-6 bg-muted" />

                    <Button
                        asChild
                        variant="ghost"
                        onClick={toggleQueue}
                        className={`h-5 w-5 p-0 hover:bg-transparent cursor-pointer select-none ${queueOpen ? 'opacity-100' : 'opacity-60'}`}
                    >
                        <Image
                            src="/icons/queue.svg"
                            alt="Queue"
                            width={22}
                            height={22}
                            draggable={false}
                        />
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        className="h-5 w-5 p-0 hover:bg-transparent cursor-pointer select-none"
                    >
                        <Image
                            src="/icons/more-hori.svg"
                            alt="More"
                            width={22}
                            height={22}
                            draggable={false}
                        />
                    </Button>
                </div>
            </div>

            {/* Mobile player bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-playerbar backdrop-blur-md">
                {/* progress bar at top of mobile player */}
                <div className="w-full h-[3px] bg-zinc-700/50">
                    <div
                        className="h-full bg-white/80 transition-[width] duration-150"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex items-center gap-3 px-3 py-2">
                    {/* cover art */}
                    <div className="relative w-[44px] h-[44px] rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <Image
                            src={currentTrack?.coverArt || '/albumplaceholder.svg'}
                            alt={currentTrack?.name || "No track"}
                            fill
                            className="object-cover"
                            draggable={false}
                        />
                    </div>
                    {/* track info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                            {currentTrack?.name ?? "No track playing"}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                            {currentTrack?.artist ?? ""}
                        </p>
                    </div>
                    {/* controls */}
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            asChild
                            variant="ghost"
                            onClick={() => playPrev()}
                            className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                        >
                            <Image src="/icons/prev.svg" alt="Previous" width={28} height={28} draggable={false} />
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            onClick={togglePlayPause}
                            className="h-8 w-8 p-0 hover:bg-transparent cursor-pointer select-none"
                        >
                            <Image
                                src={isPlaying ? "/icons/pause.svg" : "/icons/play.svg"}
                                alt={isPlaying ? "Pause" : "Play"}
                                width={36}
                                height={36}
                                draggable={false}
                            />
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            onClick={() => playNext()}
                            className="h-6 w-6 p-0 hover:bg-transparent cursor-pointer select-none"
                        >
                            <Image src="/icons/next.svg" alt="Next" width={28} height={28} draggable={false} />
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
