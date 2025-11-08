'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import { useNavidrome } from '@/components/navidrome-context'
import { Song } from '@/lib/navidrome'

export interface Track {
  id: string
  name: string
  url: string
  artist: string
  album: string
  duration: number
  coverArt?: string
  albumId: string
  artistId: string
  starred?: boolean
}

interface PlayerContextProps {
  currentTrack: Track | null
  queue: Track[]
  isPlaying: boolean
  isLoading: boolean
  playTrack: (track: Track, autoPlay?: boolean) => void
  addToQueue: (track: Track) => void
  playNext: () => void
  playPrev: () => void
  clearQueue: () => void
  setIsPlaying: (playing: boolean) => void
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { api } = useNavidrome()

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // TODO: fix streamurl
  const songToTrack = useCallback(
    (song: Song): Track => ({
      id: song.id,
      name: song.title,
      artist: song.artist,
      album: song.album,
      albumId: song.albumId,
      artistId: song.artistId,
      url: api?.getStreamUrl(song.id) || '',
      duration: song.duration,
      coverArt: song.coverArt ? api?.getCoverArtUrl(song.coverArt, 512) : undefined,
      starred: !!song.starred,
    }),
    [api]
  )

  // Persist queue + currentTrack
  useEffect(() => {
    localStorage.setItem('player-queue', JSON.stringify(queue))
  }, [queue])

  useEffect(() => {
    if (currentTrack)
      localStorage.setItem('player-currentTrack', JSON.stringify(currentTrack))
    else localStorage.removeItem('player-currentTrack')
  }, [currentTrack])

  useEffect(() => {
    const savedQueue = localStorage.getItem('player-queue')
    const savedTrack = localStorage.getItem('player-currentTrack')
    if (savedQueue) setQueue(JSON.parse(savedQueue))
    if (savedTrack) setCurrentTrack(JSON.parse(savedTrack))
  }, [])

  const playTrack = useCallback(
    (track: Track, autoPlay = true) => {
      setCurrentTrack(track)
      setIsPlaying(autoPlay)
      if (api) {
        api.scrobble(track.id).catch(() => {})
      }
    },
    [api]
  )

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track])
  }, [])

  const playNext = useCallback(() => {
    if (queue.length === 0) return
    const [next, ...rest] = queue
    setQueue(rest)
    playTrack(next, true)
  }, [queue, playTrack])

  const playPrev = useCallback(() => {
    // no-op for now
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  const value = useMemo(
    () => ({
      currentTrack,
      queue,
      isPlaying,
      isLoading,
      playTrack,
      addToQueue,
      playNext,
      playPrev,
      clearQueue,
      setIsPlaying,
    }),
    [
      currentTrack,
      queue,
      isPlaying,
      isLoading,
      playTrack,
      addToQueue,
      playNext,
      playPrev,
      clearQueue,
    ]
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider')
  return context
}
