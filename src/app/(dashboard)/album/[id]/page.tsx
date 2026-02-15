"use client"

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useNavidrome } from "@/components/navidrome-context";
import { usePlayer } from "@/components/player-context";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Album, Song } from "@/lib/navidrome";
import { formatDuration, formatDurationVerbose } from "@/lib/song-utils";
import { Shuffle, MoreHorizontal } from "lucide-react";

export default function AlbumDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { api, isConnected, getAlbum, starItem, unstarItem } = useNavidrome()
    const [album, setAlbum] = useState<Album | null>(null)
    const [songs, setSongs] = useState<Song[]>([])
    const [loading, setLoading] = useState(true)
    const [favorited, setFavorited] = useState(false)

    const { playTrack, playAlbum, currentTrack, isPlaying, setIsPlaying, shuffle, toggleShuffle, songToTrack } = usePlayer()

    // Memoize computed values, must be before early returns
    const coverUrl = useMemo(() => {
        if (album?.coverArt && api) {
            return api.getCoverArtUrl(album.coverArt, 300);
        }
        return "/albumplaceholder.svg";
    }, [album?.coverArt, api]);

    const totalDuration = useMemo(() => 
        songs.reduce((sum, s) => sum + (s.duration ?? 0), 0),
        [songs]
    );

    useEffect(() => {
        if (!isConnected || !id) return

        const fetchAlbum = async () => {
            try {
                const { album: albumInfo, songs: albumSongs } = await getAlbum(id)
                setAlbum(albumInfo)
                setSongs(albumSongs)
            } catch (error) {
                console.error("Failed to fetch album:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAlbum()
    }, [getAlbum, isConnected, id])

    const handleAlbumFavorite = async () => {
        if (!api || !album) return
        try {
            if (favorited) {
                await unstarItem(album.id, "album")
                setFavorited(false)
            } else {
                await starItem(album.id, "album")
                setFavorited(true)
            }
        } catch (error) {
            console.error("Failed to toggle favorite:", error)
        }
    }

    const handleSongFavorite = async (song: Song) => {
        if (!api) return
        try {
            if (song.starred) {
                await unstarItem(song.id, "song")
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: undefined } : s
                    )
                )
            } else {
                await starItem(song.id, "song")
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: "true" } : s
                    )
                )
            }
        } catch (error) {
            console.error("Failed to toggle song favorite:", error)
        }
    }


    if (loading) return <p className="text-zinc-400 p-4">Loading album...</p>
    if (!album) return <p className="text-zinc-400 p-4">Album not found.</p>

    const releaseYear = album.year || "Unknown Year"

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-start gap-6">
                <div className="relative w-[170px] h-[170px] rounded-lg overflow-hidden bg-zinc-800">
                    <Image
                        src={coverUrl}
                        alt={`Cover art for ${album.name || "Unknown Album"}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col justify-between h-[170px]">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">
                            {album.name}
                        </h1>
                        <p className="text-zinc-400">
                            {album.artistId ? (
                                <Link
                                    href={`/artist/${album.artistId}`}
                                >
                                    {album.artist || "Unknown Artist"}
                                </Link>
                            ) : (
                                album.artist || "Unknown Artist"
                            )}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {releaseYear} • {album.songCount} songs •{" "}
                            {formatDurationVerbose(totalDuration)}
                        </p>
                    </div>
                    <div className="flex items-center gap-6 mt-4">
                        <Button
                            asChild
                            variant="ghost"
                            onClick={() => {
                                const isPlayingThisAlbum = currentTrack && songs.some(s => s.id === currentTrack.id);
                                if (isPlayingThisAlbum && isPlaying) {
                                    setIsPlaying(false);
                                } else {
                                    playAlbum(album.id);
                                }
                            }}
                            className="h-8 w-8 text-border hover:text-secondary hover:bg-transparent cursor-pointer select-none p-0">
                            <Image
                                src={currentTrack && songs.some(s => s.id === currentTrack.id) && isPlaying ? "/icons/pausetosc.svg" : "/icons/playtosc.svg"}
                                alt={currentTrack && songs.some(s => s.id === currentTrack.id) && isPlaying ? "Pause" : "Play"}
                                width={24}
                                height={24}
                                draggable={false}
                            />
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            onClick={toggleShuffle}
                            className={`text-border hover:text-secondary hover:bg-transparent cursor-pointer p-0 ${shuffle ? 'opacity-100' : 'opacity-40'}`}>
                            <Image
                                src="/icons/shuffle.svg"
                                alt="Shuffle"
                                width={22}
                                height={22}
                                draggable={false}
                            />
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            onClick={handleAlbumFavorite}
                            className="hover:opacity-100 transition hover:bg-transparent cursor-pointer select-none p-0">
                            {favorited ? (
                                <Image
                                    src="/icons/heartfilled.svg"
                                    alt="Heart"
                                    width={24}
                                    height={24}
                                    draggable={false}
                                />
                            ) : (
                                <Image
                                    src="/icons/heart.svg"
                                    alt="Heart"
                                    width={24}
                                    height={24}
                                    draggable={false}
                                    className="opacity-80"
                                />
                            )}
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            className="hover:bg-transparent hover:opacity-100 transition cursor-pointer p-0">
                            <Image
                                src="/icons/addtoqueue.svg"
                                alt="Add Queue"
                                width={22}
                                height={22}
                                draggable={false}
                                className="opacity-80"
                            />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="text-border hover:text-secondary hover:bg-transparent cursor-pointer p-0">
                                    <MoreHorizontal size={24} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    Add to Playlist
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Go to Artist
                                </DropdownMenuItem>
                                <DropdownMenuItem>Share</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between text-sm text-zinc-500 mb-2 px-2">
                    <span className="w-6 text-right">#</span>
                    <span className="flex-1 ml-3">Title</span>
                    <span className="text-right mr-12">Duration</span>
                </div>

                <Separator className="my-1.5 h-[2px] bg-border/75" />

                <div>
                    {songs.map((song) => (
                        <div
                            key={song.id}
                            className="flex items-center cursor-pointer justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                            onClick={() => {
                                if (!api) return;
                                playTrack({
                                    id: song.id,
                                    name: song.title,
                                    artist: song.artist,
                                    artistId: song.artistId,
                                    album: album.name,
                                    albumId: album.id,
                                    coverArt: coverUrl,
                                    url: api.getStreamUrl(song.id),
                                    duration: song.duration ?? 0,
                                });
                            }}>
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-zinc-500 text-sm w-6 text-right">
                                    {song.track ?? 0}
                                </span>
                                <span className="text-zinc-200 truncate">
                                    {song.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <span className="text-right">
                                    {formatDuration(song.duration)}
                                </span>

                                <Button
                                    asChild
                                    variant="ghost"
                                    className="hover:opacity-100 transition hover:bg-transparent cursor-pointer ml-4 p-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSongFavorite(song);
                                    }}>
                                    {song.starred ? (
                                        <Image
                                            src="/icons/heartfilled.svg"
                                            alt="Heart"
                                            width={18}
                                            height={18}
                                            className=""
                                        />
                                    ) : (
                                        <Image
                                            src="/icons/heart.svg"
                                            alt="Heart"
                                            width={18}
                                            height={18}
                                            className="opacity-80"
                                        />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
