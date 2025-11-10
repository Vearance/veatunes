"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavidrome } from "@/components/navidrome-context";
import { Song } from "@/lib/navidrome";

export interface Track {
    id: string;
    name: string;
    url: string;
    artist: string;
    album: string;
    duration: number;
    coverArt?: string;
    albumId: string;
    artistId: string;
    autoPlay?: boolean;
    starred?: boolean;
}

interface PlayerContextProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;

    // state
    currentTrack: Track | null;
    queue: Track[];
    shuffle: boolean;
    repeat: "off" | "one" | "all";
    isPlaying: boolean;
    isLoading: boolean;
    playedTracks: Track[];
    
    // playback controls
    playTrack: (track: Track, autoPlay?: boolean) => void;
    playNext: () => void;
    playPrev: () => void;

    // queue management
    addToQueue: (track: Track) => void;
    clearQueue: () => void;
    removeTrackFromQueue: (trackId: string) => void;
    skipToTrackInQueue: (index: number) => void;
    addAlbumToQueue: (albumId: string) => Promise<void>;

    // convenience methods
    playAlbum: (albumId: string) => Promise<void>;
    
    // settings
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setIsPlaying: (playing: boolean) => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { api } = useNavidrome();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queue, setQueue] = useState<Track[]>([]);
    const [playedTracks, setPlayedTracks] = useState<Track[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");

    const songToTrack = useCallback(
        (song: Song): Track => {
            if (!api) {
                throw new Error("Navidrome is not configured");
            }

            const streamUrl = api.getStreamUrl(song.id);

            return {
                id: song.id,
                name: song.title,
                url: streamUrl,
                artist: song.artist,
                album: song.album,
                duration: song.duration,
                coverArt: song.coverArt
                    ? api.getCoverArtUrl(song.coverArt, 300)
                    : undefined,
                albumId: song.albumId,
                artistId: song.artistId,
                starred: !!song.starred,
            };
        },
        [api]
    );

    // load state from localStorage
    useEffect(() => {
        try {
            const savedQueue = localStorage.getItem("player-queue");
            const savedTrack = localStorage.getItem("player-currentTrack");

            if (savedQueue) {
                try {
                    setQueue(JSON.parse(savedQueue));
                } catch (error) {
                    console.error("Failed to parse saved queue:", error);
                    localStorage.removeItem("player-queue");
                }
            }

            if (savedTrack) {
                try {
                    const track = JSON.parse(savedTrack);
                    // clear autoplay flag when loading from localStorage to prevent auto-play on refresh
                    track.autoPlay = false;
                    setCurrentTrack(track);
                } catch (error) {
                    console.error("Failed to parse saved track:", error);
                    localStorage.removeItem("player-currentTrack");
                }
            }
        } catch (outerError) {
            console.error(
                "Unexpected error while loading player state:",
                outerError
            );
        }
    }, []);

    // save state to localStorage
    useEffect(() => {
        try {
            localStorage.setItem("player-queue", JSON.stringify(queue));
        } catch (error) {
            console.error("Failed to save queue:", error);
        }
    }, [queue]);

    useEffect(() => {
        try {
            if (currentTrack) {
                // remove runtime-only properties
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { autoPlay, ...trackToSave } = currentTrack;
                localStorage.setItem(
                    "player-currentTrack",
                    JSON.stringify(trackToSave)
                );
            } else {
                localStorage.removeItem("player-currentTrack");
            }
        } catch (error) {
            console.error("Failed to save currentTrack:", error);
        }
    }, [currentTrack]);

    // playback controls
    const playTrack = useCallback(
        (track: Track, autoPlay = true, startFromQueue = false) => {
            if (!track) return;

            // if this play came from the queue, remember the current track
            if (startFromQueue && currentTrack) {
                setPlayedTracks((prev) => [...prev, currentTrack]);
            }

            // clear saved playback position
            localStorage.removeItem("player-currentTrack-time");

            // track w/ autoPlay flag
            const trackWithAuto = { ...track, autoPlay };
            setCurrentTrack(trackWithAuto);

            if (!startFromQueue) {
                setQueue([trackWithAuto]);
                setPlayedTracks([]);
            }

            if (api) {
                api.scrobble(track.id).catch((err) =>
                    console.warn("Failed to scrobble track:", err)
                );
            }

            // set playback state
            setIsPlaying(autoPlay);
        },
        [api, currentTrack]
    );

    const playNext = useCallback(() => {
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        const isLast = currentIndex === queue.length - 1;

        if (repeat === "one") {
            // repeat single track
            playTrack(currentTrack, true, true);
            return;
        }

        if (!isLast) {
            // not end of queue; move to next track
            playTrack(queue[currentIndex + 1], true, true);
        } else {
            // end of queue
            if (repeat === "all") {
                // repeat all -> go to first track
                playTrack(queue[0], true, true);
            } else {
                // no repeat -> stop playback
                setIsPlaying(false);
            }
        }
    }, [currentTrack, queue, repeat, playTrack, setIsPlaying]);

    const playPrev = useCallback(() => {
        if (!currentTrack || !audioRef.current) return;

        const currentTime = audioRef.current.currentTime ?? 0;

        if (currentTime > 3) {
            // restart current song
            audioRef.current.currentTime = 0;
            void audioRef.current.play();
            return;
        }

        if (playedTracks.length > 0) {
            const lastPlayed = playedTracks[playedTracks.length - 1];
            setPlayedTracks((prev) => prev.slice(0, -1));
            playTrack(lastPlayed, true, true);
        } else {
            playTrack(currentTrack, true, true);
        }
    }, [audioRef, currentTrack, playedTracks, playTrack]);


    const toggleRepeat = useCallback(() => {
        setRepeat((prev) => {
            if (prev === "off") return "all";
            if (prev === "all") return "one";
            return "off";
        });
    }, []);

    const toggleShuffle = useCallback(() => {
        setShuffle((prev) => {
            const newShuffle = !prev;

            setQueue((prevQueue) => {
                if (!currentTrack || prevQueue.length <= 1) return prevQueue;

                const remaining = prevQueue.filter(
                    (t) => t.id !== currentTrack.id
                );
                const shuffled = newShuffle
                    ? remaining.sort(() => Math.random() - 0.5)
                    : remaining; // could re-sort to original if you store that

                return [currentTrack, ...shuffled];
            });

            return newShuffle;
        });
    }, [currentTrack]);

    const addToQueue = useCallback(
        (track: Track) => {
            if (!track) return;

            setQueue((prev) => {
                // no duplicate if track already in queue
                if (prev.some((t) => t.id === track.id)) {
                    return prev;
                }

                if (shuffle && prev.length > 0) {
                    // if shuffle is enabled, insert the track at a random positio
                    const randomIndex = Math.floor(
                        Math.random() * (prev.length + 1)
                    );
                    const newQueue = [...prev];
                    newQueue.splice(randomIndex, 0, track);
                    return newQueue;
                } else {
                    return [...prev, track];
                }
            });
        },
        [shuffle]
    );

    const clearQueue = useCallback(() => {
        setQueue([]);
        setPlayedTracks([]);
        setCurrentTrack(null);
        setIsPlaying(false);
    }, []);

    const removeTrackFromQueue = useCallback((trackId: string) => {
        setQueue((prev) => prev.filter((t) => t.id !== trackId));
    }, []);

    const skipToTrackInQueue = useCallback(
        (index: number) => {
            if (index < 0 || index >= queue.length) return;
            const track = queue[index];
            playTrack(track, true, true);
        },
        [queue, playTrack]
    );

    const addAlbumToQueue = useCallback(
        async (albumId: string) => {
            if (!api) return;

            try {
                const { songs } = await api.getAlbum(albumId);
                const tracks = songs.map(songToTrack);

                setQueue((prev) => {
                    const newTracks = tracks.filter(
                        (t) => !prev.some((q) => q.id === t.id)
                    );

                    if (shuffle) {
                        const randomIndex = Math.floor(
                            Math.random() * (prev.length + 1)
                        );
                        const newQueue = [...prev];
                        newQueue.splice(randomIndex, 0, ...newTracks);
                        return newQueue;
                    } else {
                        return [...prev, ...newTracks];
                    }
                });
            } catch (error) {
                console.error("Failed to add album to queue:", error);
            }
        },
        [api, shuffle, songToTrack]
    );

    const playAlbum = useCallback(
        async (albumId: string) => {
            if (!api) return;

            try {
                const { songs } = await api.getAlbum(albumId);
                const tracks = songs.map(songToTrack);

                const shuffled = shuffle
                    ? [...tracks].sort(() => Math.random() - 0.5)
                    : tracks;

                const firstTrack = shuffled[0];

                setQueue(shuffled);
                setPlayedTracks([]);
                playTrack(firstTrack, true, false);
            } catch (error) {
                console.error("Failed to play album:", error);
            }
        },
        [api, shuffle, playTrack, songToTrack]
    );

    // when currentTrack changes, load its URL into audio
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack) {
            audio.src = currentTrack.url;
            audio.load();

            if (currentTrack.autoPlay) {
                audio
                    .play()
                    .catch((err) => console.warn("Autoplay failed:", err));
            }
        } else {
            audio.removeAttribute("src");
        }
    }, [currentTrack]);

    // keep play/pause state synced with <audio>
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch((err) => console.warn("Play failed:", err));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    // helper: seek to specific time
    const seekTo = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    // helper: set volume (0–1)
    const setVolume = useCallback((value: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.min(Math.max(value, 0), 1);
        }
    }, []);

    // helper: toggle mute
    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
        }
    }, []);

    const value = useMemo(
        () => ({
            audioRef,
            
            currentTrack,
            queue,
            shuffle,
            repeat,
            isPlaying,
            isLoading,
            playedTracks,

            playTrack,
            playNext,
            playPrev,

            addToQueue,
            clearQueue,
            removeTrackFromQueue,
            skipToTrackInQueue,
            addAlbumToQueue,

            playAlbum,

            toggleShuffle,
            toggleRepeat,
            setIsPlaying,
            seekTo,
            setVolume,
            toggleMute,
        }),
        [  
            audioRef,
            currentTrack,
            queue,
            shuffle,
            repeat,
            isPlaying,
            isLoading,
            playedTracks,
            playTrack,
            playNext,
            playPrev,
            addToQueue,
            clearQueue,
            removeTrackFromQueue,
            skipToTrackInQueue,
            addAlbumToQueue,
            playAlbum,
            toggleShuffle,
            toggleRepeat,
            setIsPlaying,
            seekTo,
            setVolume,
            toggleMute,
        ]
    );

    return (
        <PlayerContext.Provider value={value}>
            {children}
            <audio
                ref={audioRef}
                onEnded={playNext}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={(e) => console.error("Audio error:", e)}
            />
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context)
        throw new Error("usePlayer must be used within a PlayerProvider");
    return context;
};
