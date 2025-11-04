"use client"

import { useState } from "react"
import Image from "next/image"
import { useNavidrome } from "@/components/navidrome-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/lib/song-utils"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"

export default function PlayerBar() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(30)

    const handlePlayPause = () => setIsPlaying(!isPlaying)

    return (
        <div
            className="fixed bottom-0 left-0 right-0 max-h-[110px] bg-playerbar backdrop-blur-xs items-center grid grid-cols-[375px_1fr_375px] p-[10px] z-50 m-[26px] rounded-2xl"
        >

            <div className="flex items-center gap-5">
                <div className="relative rounded-xl overflow-hidden bg-zinc-800 w-[90px] h-[90px]">
                    <Image
                        src="/albumplaceholder.svg"
                        alt="Cover Art"
                        fill
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="flex flex-col leading-tight">
                    <p className="text-lg font-medium text-zinc-100">Song Title</p>
                    <p className="text-md text-zinc-400">Artist Name</p>
                </div>

            </div>

            <div className="flex flex-col items-center gap-2 w-full max-w-[628px] justify-self-center">
                <div className="flex items-center gap-10 mt-1 mb-0.5">
                    <Button
                        asChild
                        variant="ghost"
                        className="h-10 w-10 hover:bg-transparent cursor-pointer select-none p-0"
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
                        className="h-10 w-10 hover:bg-transparent cursor-pointer select-none p-0"
                    >
                        <Image
                            src="/icons/prev.svg"
                            alt="Previous"
                            width={40}
                            height={40}
                            draggable={false}
                        />
                    </Button>

                    {isPlaying ? (
                        <Button
                            asChild
                            variant="ghost"
                            onClick={handlePlayPause}
                            className="h-13 w-13 hover:bg-transparent cursor-pointer select-none p-0"
                        >
                            <Image
                                src="/icons/pause.svg"
                                alt="Pause"
                                width={52}
                                height={52}
                                draggable={false}
                            />
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="ghost"
                            onClick={handlePlayPause}
                            className="h-13 w-13 hover:bg-transparent cursor-pointer select-none p-0"
                        >
                            <Image
                                src="/icons/play.svg"
                                alt="Play"
                                width={52}
                                height={52}
                                draggable={false}
                            />
                        </Button>
                    )}

                    <Button
                        asChild
                        variant="ghost"
                        className="h-10 w-10 hover:bg-transparent cursor-pointer select-none p-0"
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
                        className="h-10 w-10 hover:bg-transparent cursor-pointer select-none p-0"
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

                <div className="flex items-center gap-3 justify-center w-full font-satoshi">
                    <span className="text-sm text-accent">1:23</span>
                    <Slider
                        value={[progress]}
                        onValueChange={([v]) => setProgress(v)}
                        max={100}
                        step={1}
                        className="w-[540px]"
                    />
                    <span className="text-sm text-accent">3:45</span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4 pr-5">
                <Button
                        asChild
                        variant="ghost"
                        className="h-10 w-10 hover:bg-transparent cursor-pointer select-none p-0"
                    >
                        <Image
                            src="/icons/volume.svg"
                            alt="Volume"
                            width={40}
                            height={40}
                            draggable={false}
                        />
                    </Button>
                <Slider
                    defaultValue={[60]}
                    max={100}
                    step={1}
                    className="w-[130px]"
                />
            </div>
        </div>
    )
}
