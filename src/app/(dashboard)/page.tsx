import HorizontalSection from "@/components/horizontal-section"
import SongCard from "@/components/song-card"

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

export default function Home() {
    return (
        <div className="space-y-8">
            <HorizontalSection title="Recently Played">
                {mockSongs.map(song => (
                    <SongCard key={song.id} song={song} />
                ))}
            </HorizontalSection>
        </div>
    )
}
