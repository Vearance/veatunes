"use client"

import HorizontalSection from "@/components/horizontal-section"
import SongCard from "@/components/song-card"
import PlaylistCard from "@/components/playlist-card"
import ArtistCard from "@/components/artist-card"
import AlbumCard from "@/components/album-card"
import { useNavidrome } from "@/components/navidrome-context"
import { usePlayer } from "@/components/player-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
    const { albums, artists, playlists, isLoading } = useNavidrome()
    const { recentlyPlayed } = usePlayer()

    const renderAlbumSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, i) => (
            <div
                key={`album-skel-${i}`}
                className="w-[170px] h-[253px] flex flex-col space-y-2 animate-pulse"
            >
                <Skeleton className="w-[170px] h-[170px] rounded-lg bg-zinc-800" />
                <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
            </div>
        ))

    const renderArtistSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, i) => (
            <div
                key={`artist-skel-${i}`}
                className="w-[170px] h-[253px] flex flex-col items-center space-y-2 animate-pulse"
            >
                <Skeleton className="w-[170px] h-[170px] rounded-full bg-zinc-800" />
                <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
            </div>
        ))

    const renderPlaylistSkeletons = (count: number) =>
        Array.from({ length: count }).map((_, i) => (
            <div
                key={`playlist-skel-${i}`}
                className="w-[170px] h-[253px] flex flex-col space-y-2 animate-pulse"
            >
                <Skeleton className="w-[170px] h-[170px] rounded-lg bg-zinc-800" />
                <Skeleton className="h-2 w-3/4 bg-zinc-700" />
                <Skeleton className="h-1.5 w-1/2 bg-zinc-700" />
            </div>
        ))

    return (
        <div className="space-y-8 px-2">
            {recentlyPlayed.length > 0 && (
                <HorizontalSection title="Recently Played">
                    {recentlyPlayed.map(track => (
                        <SongCard key={track.id} track={track} />
                    ))}
                </HorizontalSection>
            )}
            <HorizontalSection title="Artists">
                {isLoading ? (
                    renderArtistSkeletons(8)
                ) : artists.length === 0 ? (
                    <p className="text-zinc-400">No artists found.</p>
                ) : (
                    artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)
                )}
            </HorizontalSection>
            <HorizontalSection title="Albums">
                {isLoading ? (
                    renderAlbumSkeletons(8)
                ) : albums.length === 0 ? (
                    <p className="text-zinc-400">No albums found.</p>
                ) : (
                    albums.map(album => <AlbumCard key={album.id} album={album} />)
                )}
            </HorizontalSection>
            <HorizontalSection title="Playlists">
                {isLoading ? (
                    renderPlaylistSkeletons(8)
                ) : playlists.length === 0 ? (
                    <p className="text-zinc-400">No playlists found.</p>
                ) : (
                    playlists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)
                )}
            </HorizontalSection>
        </div>
    )
}
