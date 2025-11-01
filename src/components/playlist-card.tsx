import Image from "next/image";

interface PlaylistCardProps {
    playlist: {
        id: string;
        title: string;
        songCount?: number;
        songs?: string[];
        coverUrl?: string;
    }
}

// TODO: apply colorExtraction

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    const count = playlist.songCount ?? playlist.songs?.length ?? 0;
    const previewTitles = playlist.songs?.slice(0, 3).join(", ") ?? null;

    return (
        <div className="w-[170px] h-[253px] flex flex-col cursor-pointer group">
            <div className="relative flex flex-col items-center">

                <div className="bg-[#73737326] w-[133px] h-[3px] rounded-t-[7.25px]" />

                <div className="h-[1px]" />

                <div className="bg-[#7373734D] w-[154px] h-[6px] rounded-t-[7.25px]" />

                <div className="h-[1px]" />

                <div className="relative w-[170px] h-[170px] rounded-lg overflow-hidden bg-zinc-800">
                    <Image
                        src={playlist.coverUrl || "/songplaceholder.svg"}
                        alt={playlist.title}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                </div>
            </div>

            <div className="mt-2 flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-primary truncate">
                    {playlist.title}
                </p>
                <p className="text-sm text-zinc-400 flex-shrink-0 ml-2">
                    {count}
                </p>
            </div>

            <p className="text-xs text-secondary line-clamp-2">
                {previewTitles ? `${previewTitles}${count > 3 ? ", and more" : ""}` : "No songs"}
            </p>

        </div>
    );
}
