"use client"

import { useEffect, useState } from "react"
import HorizontalSection from "@/components/horizontal-section"
import SongCard from "@/components/song-card"
import PlaylistCard from "@/components/playlist-card"
import ArtistCard from "@/components/artist-card"
import AlbumCard from "@/components/album-card"
import { Album, Artist, Playlist } from "@/lib/navidrome"
import { useNavidrome } from "@/components/navidrome-context"

const mockSongs = [
    { id: "1", title: "Song 1", artist: "Chris James" },
    { id: "2", title: "Song 2", artist: "Chris James" },
    { id: "3", title: "Song 3", artist: "Chris James" },
    { id: "4", title: "Song 3", artist: "Chris James" },
    { id: "5", title: "Song 3", artist: "Chris James" },
    { id: "6", title: "Song 3", artist: "Chris James" },
    { id: "7", title: "Song 3", artist: "Chris James" },
    { id: "8", title: "Song 3", artist: "Chris James" },
    { id: "9", title: "Song 3", artist: "Chris James" },
]

const mockPlaylists = [
    {
        id: "1",
        title: "Liked Songs",
        songCount: 87,
        songs: ["Song A", "Song B", "Song C"]
    },
    {
        id: "2",
        title: "Chill Vibes",
        songCount: 42,
        songs: ["Apa", "Haha", "Hihi"]
    }
];

const allPlaylists = [
    { id: "liked", title: "Liked Songs", songs: [], songCount: 0, coverUrl: "/likedplaceholder.svg" },
    ...mockPlaylists,
];

const mockArtist = [
    {
        "id": "1",
        "name": "Chris James",
        "listenCount": 234,
    }
]

const mockAlbum = [
    {
        "id": "1",
        "title": "Album 1",
        "artist": "The Weekend",
    }
]

export default function Home() {
    const { api, isConnected } = useNavidrome()
    const [albums, setAlbums] = useState<Album[]>([])
    const [artists, setArtists] = useState<Artist[]>([])
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(true)

    // useEffect(() => {
    //     const fetchAlbums = async () => {
    //         if (!api || !isConnected) return

    //         try {
    //             const result = await api.getAlbums("newest", 20)
    //             setAlbums(result)
    //         } catch (error) {
    //             console.error("Failed to fetch albums:", error)
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchAlbums()
    // }, [api, isConnected])

    useEffect(() => {
        if (!api || !isConnected) return

        const fetchAll = async () => {
            try {
                const [albumRes, artistRes, playlistRes] = await Promise.all([
                    api.getAlbums("newest", 20),
                    api.getArtists(),
                    api.getPlaylists(),
                ])

                setAlbums(albumRes)
                setArtists(artistRes)
                setPlaylists(playlistRes)
            } catch (error) {
                console.error("Failed to fetch Navidrome data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAll()
    }, [api, isConnected])


    return (
        <div className="space-y-8 px-2">
            <HorizontalSection title="Recently Played">
                {mockSongs.map(song => (
                    <SongCard key={song.id} song={song} />
                ))}
            </HorizontalSection>
            <HorizontalSection title="Playlists">
                {loading ? (
                    <p className="text-zinc-400">Loading playlists...</p>
                ) : playlists.length === 0 ? (
                    <p className="text-zinc-400">No playlists found.</p>
                ) : (
                    playlists.map(pl => <PlaylistCard key={pl.id} playlist={pl} />)
                )}
            </HorizontalSection>
            <HorizontalSection title="Artists">
                {loading ? (
                    <p className="text-zinc-400">Loading artists...</p>
                ) : artists.length === 0 ? (
                    <p className="text-zinc-400">No artists found.</p>
                ) : (
                    artists.map(artist => <ArtistCard key={artist.id} artist={artist} />)
                )}
            </HorizontalSection>
            <HorizontalSection title="Albums">
                {loading ? (
                    <p className="text-zinc-400">Loading albums...</p>
                ) : albums.length === 0 ? (
                    <p className="text-zinc-400">No albums found.</p>
                ) : (
                    albums.map(album => <AlbumCard key={album.id} album={album} />)
                )}
            </HorizontalSection>
        </div>
    )
}
