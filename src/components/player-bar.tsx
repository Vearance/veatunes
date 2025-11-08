"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from '@/components/player-context';
import Image from "next/image";
import { useNavidrome } from "@/components/navidrome-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/song-utils";

export function PlayerBar() {
    const {
        currentTrack,
        isPlaying,
        setIsPlaying,
        playNext,
        playPrev,
    } = usePlayer()

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [muted, setMuted] = useState(false);
    const [seeking, setSeeking] = useState(false);

    // When currentTrack changes, load it into the audio element and autoplay if requested
    useEffect(() => {
        if (!currentTrack) {
        // unload audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
        setProgressPercent(0);
        setCurrentTime(0);
        setDuration(0);
        return;
        }

        // ensure audio element exists
        if (!audioRef.current) {
            const audio = new Audio();
            audio.preload = "metadata";
            audio.crossOrigin = "anonymous";
            audioRef.current = audio;
        }


        const audio = audioRef.current;
        audio.src = currentTrack.url;
        audio.crossOrigin = "anonymous";

        const onLoadedMeta = () => {
        setDuration(audio.duration || 0);
        };
        const onTimeUpdate = () => {
        if (!seeking) {
            setCurrentTime(audio.currentTime || 0);
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            setProgressPercent(Number.isFinite(pct) ? pct : 0);
        }
        };
        const onEnded = () => {
        setIsPlaying(false);
        playNext();
        };

        audio.addEventListener("loadedmetadata", onLoadedMeta);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("ended", onEnded);

        // Autoplay if the context says playing
        const tryPlay = async () => {
        if (isPlaying) {
            try {
            await audio.play();
            } catch (e) {
            // autoplay might be blocked by browser; in that case keep state consistent
            setIsPlaying(false);
            }
        }
        };

        tryPlay();

        return () => {
        audio.removeEventListener("loadedmetadata", onLoadedMeta);
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
        };
    }, [currentTrack?.id, isPlaying]);

    // Play / Pause side-effect: control audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
        audio.play().catch(() => {
            // ignore play error (autoplay policy)
            setIsPlaying(false);
        });
        } else {
        audio.pause();
        }
    }, [isPlaying, setIsPlaying]);

    // Mute toggle
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = muted;
    }, [muted]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value: number) => {
        if (!audioRef.current) return;
        const newTime = (value / 100) * (audioRef.current.duration || duration || 0);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgressPercent(value);
    };

    const handleSeekEnd = () => setSeeking(false);

    const humanCurrent = formatDuration(Math.floor(currentTime || 0));
    const humanDuration = formatDuration(Math.floor(duration || 0));

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 m-[26px] max-h-[90px] bg-playerbar backdrop-blur-xs rounded-2xl p-2.5 grid grid-cols-[375px_1fr_375px] items-center">
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
                    <span className="text-xs text-accent">{humanCurrent}</span>
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
                        className="flex-1 max-w-[480px] **:data-[slot=slider-track]:h-1 **:data-[slot=slider-thumb]:w-2.5 **:data-[slot=slider-thumb]:h-2.5"
                    />
                    <span className="text-xs text-accent">{humanDuration}</span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-5 mr-3">
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        onClick={() => setMuted((m) => !m)}
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
                        defaultValue={[60]}
                        max={100}
                        step={1}
                        className="w-[80px] **:data-[slot=slider-track]:h-1 **:data-[slot=slider-thumb]:w-2 **:data-[slot=slider-thumb]:h-2"
                    />
                </div>

                <div className="w-[1.5px] h-6 bg-muted" />

                <Button
                    asChild
                    variant="ghost"
                    className="h-5 w-5 p-0 hover:bg-transparent cursor-pointer select-none"
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
    );
}
