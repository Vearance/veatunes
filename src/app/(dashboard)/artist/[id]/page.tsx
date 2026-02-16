"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useNavidrome } from "@/components/navidrome-context";
import { usePlayer } from "@/components/player-context";
import AlbumCard from "@/components/album-card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Album, Artist, Song } from "@/lib/navidrome";
import { formatDuration } from "@/lib/song-utils";
import { Shuffle, MoreHorizontal } from "lucide-react";

const selectTopSongs = (list: Song[], limit: number = 10) => {
    if (list.length === 0) return [];

    return [...list]
        .sort((a, b) => {
            const playCountDiff = (b.playCount || 0) - (a.playCount || 0);
            if (playCountDiff !== 0) return playCountDiff;
            return (b.duration || 0) - (a.duration || 0);
        })
        .slice(0, limit);
};

export default function ArtistDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { api, isConnected, getArtist, getAlbum, getArtistTopSongs, starItem, unstarItem } = useNavidrome();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState<Song[]>([]);
    const [topSongs, setTopSongs] = useState<Song[]>([]);
    const [favorited, setFavorited] = useState(false);

    const { songToTrack, playTrack, playAlbum, playArtist, addToQueue, currentTrack, isPlaying, setIsPlaying, shuffle, toggleShuffle } = usePlayer();

    // Memoize computed values, must be before early returns
    const coverUrl = useMemo(() => 
        artist?.coverArt && api
            ? api.getCoverArtUrl(artist.coverArt, 300)
            : "/artistplaceholder.svg",
        [artist?.coverArt, api]
    );

    useEffect(() => {
        if (!isConnected || !id) return;

        const fetchArtist = async () => {
            try {
                const { artist: artistData, albums: artistAlbums } = await getArtist(id);

                setArtist(artistData);
                setFavorited(Boolean(artistData.starred));
                setAlbums(artistAlbums);

                let combinedSongs: Song[] = [];

                if (artistAlbums.length > 0) {
                    const albumSongs = await Promise.all(
                        artistAlbums.map(async (album) => {
                            const { songs: albumTracks } = await getAlbum(album.id);
                            return albumTracks;
                        })
                    );

                    combinedSongs = albumSongs.flat();
                }

                setSongs(combinedSongs);

                try {
                    const apiTopSongs = await getArtistTopSongs(artistData.name, 10);
                    if (apiTopSongs.length > 0) {
                        setTopSongs(apiTopSongs);
                    } else {
                        setTopSongs(selectTopSongs(combinedSongs));
                    }
                } catch (topSongsError) {
                    console.error("Failed to fetch top songs:", topSongsError);
                    setTopSongs(selectTopSongs(combinedSongs));
                }
            } catch (error) {
                console.error("Failed to fetch artist:", error);
                setSongs([]);
                setTopSongs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [getAlbum, getArtist, getArtistTopSongs, id, isConnected]);

    const handleArtistFavorite = async () => {
        if (!api || !artist) return;

        try {
            if (favorited) {
                await unstarItem(artist.id, "artist");
                setFavorited(false);
            } else {
                await starItem(artist.id, "artist");
                setFavorited(true);
            }
        } catch (error) {
            console.error("Failed to toggle artist favorite:", error);
        }
    };

    const handleSongFavorite = async (song: Song) => {
        if (!api) return;

        try {
            if (song.starred) {
                await unstarItem(song.id, "song");
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: undefined } : s
                    )
                );
                setTopSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: undefined } : s
                    )
                );
            } else {
                await starItem(song.id, "song");
                setSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: "true" } : s
                    )
                );
                setTopSongs((prev) =>
                    prev.map((s) =>
                        s.id === song.id ? { ...s, starred: "true" } : s
                    )
                );
            }
        } catch (error) {
            console.error("Failed to toggle song favorite:", error);
        }
    };

    if (loading) return <p className="text-zinc-400 p-4">Loading artist...</p>;
    if (!artist) return <p className="text-zinc-400 p-4">Artist not found.</p>;

    return (
        <div className="p-2 md:p-4 space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                <div className="relative w-[140px] h-[140px] md:w-[170px] md:h-[170px] rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <Image
                        src={coverUrl}
                        alt={`Cover art for ${artist.name}`}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="flex flex-col sm:justify-between sm:h-[170px] items-center sm:items-start text-center sm:text-left">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-zinc-100">
                            {artist.name}
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {artist.albumCount} albums • {songs.length} songs
                        </p>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6 mt-3 md:mt-4">
                        <Button
                            asChild
                            variant="ghost"
                            onClick={() => {
                                const isPlayingThisArtist = currentTrack && songs.some(s => s.id === currentTrack.id);
                                if (isPlayingThisArtist && isPlaying) {
                                    setIsPlaying(false);
                                } else {
                                    playArtist(songs);
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
                            onClick={handleArtistFavorite}
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
                                <DropdownMenuItem
                                    onClick={() => {
                                        songs.forEach(song => {
                                            const track = songToTrack(song);
                                            addToQueue(track);
                                        });
                                    }}
                                >
                                    Add All to Queue
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Share Artist
                                </DropdownMenuItem>
                                <DropdownMenuItem>Go to Radio</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-medium text-zinc-200 mb-4 px-2">
                    Top Songs
                </h2>
                <Separator className="my-2 h-[2px] bg-border/75" />

                {topSongs.length === 0 ? (
                    <p className="text-zinc-400 px-2">
                        No top songs available for this artist yet.
                    </p>
                ) : (
                    <div>
                        <div className="flex items-center justify-between text-sm text-zinc-500 mb-2 px-2">
                            <span className="w-6 text-right">#</span>
                            <span className="flex-1 ml-3">Title</span>
                            <span className="text-right mr-12">Duration</span>
                        </div>

                        <Separator className="my-1.5 h-[2px] bg-border/75" />

                        <div>
                            {topSongs.map((song, index) => (
                                <div
                                    key={song.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors group cursor-pointer"
                                    onClick={() => {
                                        const track = songToTrack(song);
                                        playTrack(track);
                                    }}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-zinc-500 text-sm w-6 text-right">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-zinc-200 truncate">
                                                {song.title}
                                            </p>
                                            <p className="text-xs text-zinc-400 truncate">
                                                {song.album}
                                            </p>
                                        </div>
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

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-6 h-6 p-0 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const track = songToTrack(song);
                                                        addToQueue(track);
                                                    }}
                                                >
                                                    Add to Queue
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSongFavorite(song);
                                                    }}
                                                >
                                                    {song.starred ? "Remove from Favorites" : "Add to Favorites"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <h2 className="text-lg font-medium text-zinc-200 mb-4 px-2">
                    Albums
                </h2>
                <Separator className="my-2 h-[2px] bg-border/75" />

                {albums.length === 0 ? (
                    <p className="text-zinc-400 px-2">
                        No albums found for this artist.
                    </p>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 px-2">
                        {albums.map((album) => (
                            <AlbumCard key={album.id} album={album} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
