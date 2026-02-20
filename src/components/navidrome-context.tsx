'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getNavidromeAPI, Album, Artist, Song, Playlist, AlbumInfo, ArtistInfo, MusicFolder } from '@/lib/navidrome';
import { useCallback } from 'react';

interface NavidromeContextType {
    // API instance
    api: ReturnType<typeof getNavidromeAPI>;

    // Data
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
    musicFolders: MusicFolder[];

    // Loading states
    isLoading: boolean;
    albumsLoading: boolean;
    artistsLoading: boolean;
    playlistsLoading: boolean;

    // Connection state
    isConnected: boolean;

    // Error states
    error: string | null;

    // Methods
    searchMusic: (query: string) => Promise<{ artists: Artist[]; albums: Album[]; songs: Song[] }>;
    search: (query: string) => Promise<{ artists: Artist[]; albums: Album[]; songs: Song[] }>;
    getAlbum: (albumId: string) => Promise<{ album: Album; songs: Song[] }>;
    getArtist: (artistId: string) => Promise<{ artist: Artist; albums: Album[] }>;
    getArtistInfo: (artistId: string) => Promise<ArtistInfo>;
    getAlbumInfo: (albumId: string) => Promise<AlbumInfo>;
    getArtistTopSongs: (artistName: string, limit?: number) => Promise<Song[]>;
    getPlaylist: (playlistId: string) => Promise<{ playlist: Playlist; songs: Song[] }>;
    getAllSongs: () => Promise<Song[]>;
    refreshData: () => Promise<void>;
    createPlaylist: (name: string, songIds?: string[]) => Promise<Playlist>;
    updatePlaylist: (playlistId: string, name?: string, comment?: string, songIds?: string[]) => Promise<void>;
    addToPlaylist: (playlistId: string, songIdToAdd: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;
    starItem: (id: string, type: 'song' | 'album' | 'artist') => Promise<void>;
    unstarItem: (id: string, type: 'song' | 'album' | 'artist') => Promise<void>;
    scrobble: (songId: string) => Promise<void>;
}

const NavidromeContext = createContext<NavidromeContextType | undefined>(undefined);

interface NavidromeProviderProps {
    children: ReactNode;
}

export const NavidromeProvider: React.FC<NavidromeProviderProps> = ({ children }) => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [musicFolders, setMusicFolders] = useState<MusicFolder[]>([]);

    const [albumsLoading, setAlbumsLoading] = useState(false);
    const [artistsLoading, setArtistsLoading] = useState(false);
    const [playlistsLoading, setPlaylistsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const isLoading = albumsLoading || artistsLoading || playlistsLoading;

    const api = getNavidromeAPI();

    const loadAlbums = useCallback(async () => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            setAlbumsLoading(false);
            return;
        }

        setAlbumsLoading(true);
        setError(null);
        try {
            const recentAlbums = await api.getAlbums('recent', 50);
            const newestAlbums = await api.getAlbums('newest', 50);

            // Combine and deduplicate albums
            const allAlbums = [...recentAlbums, ...newestAlbums];
            const uniqueAlbums = allAlbums.filter((album, index, self) =>
                index === self.findIndex(a => a.id === album.id)
            );

            setAlbums(uniqueAlbums);
        } catch (err) {
            console.error('Failed to load albums:', err);
            setError('Failed to load albums');
        } finally {
            setAlbumsLoading(false);
        }
    }, [api]);

    const loadArtists = useCallback(async () => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            setArtistsLoading(false);
            return;
        }

        setArtistsLoading(true);
        setError(null);
        try {
            const artistList = await api.getArtists();
            setArtists(artistList);
        } catch (err) {
            console.error('Failed to load artists:', err);
            setError('Failed to load artists');
        } finally {
            setArtistsLoading(false);
        }
    }, [api]);

    const loadPlaylists = useCallback(async () => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            setPlaylistsLoading(false);
            return;
        }

        setPlaylistsLoading(true);
        setError(null);
        try {
            const playlistList = await api.getPlaylists();
            setPlaylists(playlistList);
        } catch (err) {
            console.error('Failed to load playlists:', err);
            setError('Failed to load playlists');
        } finally {
            setPlaylistsLoading(false);
        }
    }, [api]);

    const loadMusicFolders = useCallback(async () => {
        if (!api) return;
        try {
            const folders = await api.getMusicFolders();
            setMusicFolders(folders);
        } catch (err) {
            console.error('Failed to load music folders:', err);
        }
    }, [api]);

    const refreshData = useCallback(async () => {
        await Promise.all([loadAlbums(), loadArtists(), loadPlaylists(), loadMusicFolders()]);
    }, [loadAlbums, loadArtists, loadPlaylists, loadMusicFolders]);

    const searchMusic = async (query: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            return { artists: [], albums: [], songs: [] };
        }

        setError(null);
        try {
            return await api.search(query);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Search failed');
            return { artists: [], albums: [], songs: [] };
        }
    };

    const search = async (query: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            return { artists: [], albums: [], songs: [] };
        }

        setError(null);
        try {
            return await api.search(query);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Search failed');
            return { artists: [], albums: [], songs: [] };
        }
    };

    const getAlbum = async (albumId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getAlbum(albumId);
        } catch (err) {
            console.error('Failed to get album:', err);
            setError('Failed to get album');
            throw err;
        }
    };

    const getArtist = async (artistId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getArtist(artistId);
        } catch (err) {
            console.error('Failed to get artist:', err);
            setError('Failed to get artist');
            throw err;
        }
    };

    const getArtistInfo = async (artistId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getArtistInfo(artistId);
        } catch (err) {
            console.error('Failed to get artist info:', err);
            setError('Failed to get artist info');
            throw err;
        }
    };

    const getAlbumInfo = async (albumId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getAlbumInfo(albumId);
        } catch (err) {
            console.error('Failed to get album info:', err);
            setError('Failed to get album info');
            throw err;
        }
    };

    const getPlaylist = async (playlistId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getPlaylist(playlistId);
        } catch (err) {
            console.error('Failed to get playlist:', err);
            setError('Failed to get playlist');
            throw err;
        }
    };

    const getAllSongs = async () => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getAllSongs();
        } catch (err) {
            console.error('Failed to get all songs:', err);
            setError('Failed to get all songs');
            throw err;
        }
    };

    const getArtistTopSongs = async (artistName: string, limit: number = 10) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            return await api.getArtistTopSongs(artistName, limit);
        } catch (err) {
            console.error('Failed to get artist top songs:', err);
            setError('Failed to get artist top songs');
            throw err;
        }
    };

    const createPlaylist = async (name: string, songIds?: string[]) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            const playlist = await api.createPlaylist(name, songIds);
            await loadPlaylists(); // Refresh playlists
            return playlist;
        } catch (err) {
            console.error('Failed to create playlist:', err);
            setError('Failed to create playlist');
            throw err;
        }
    };

    const updatePlaylist = async (playlistId: string, name?: string, comment?: string, songIds?: string[]) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            await api.updatePlaylist(playlistId, name, comment, songIds);
            await loadPlaylists(); // Refresh playlists
        } catch (err) {
            console.error('Failed to update playlist:', err);
            setError('Failed to update playlist');
            throw err;
        }
    };

    const deletePlaylist = async (playlistId: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            await api.deletePlaylist(playlistId);
            await loadPlaylists(); // Refresh playlists
        } catch (err) {
            console.error('Failed to delete playlist:', err);
            setError('Failed to delete playlist');
            throw err;
        }
    };

    const addToPlaylist = async (playlistId: string, songIdToAdd: string) => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            await api.addToPlaylist(playlistId, songIdToAdd);
            await loadPlaylists(); // Refresh playlists
        } catch (err) {
            console.error('Failed to add to playlist:', err);
            setError('Failed to add to playlist');
            throw err;
        }
    };

    const starItem = async (id: string, type: 'song' | 'album' | 'artist') => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            await api.star(id, type);
        } catch (err) {
            console.error('Failed to star item:', err);
            setError('Failed to star item');
            throw err;
        }
    };

    const unstarItem = async (id: string, type: 'song' | 'album' | 'artist') => {
        if (!api) {
            setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
            throw new Error('Navidrome is not configured');
        }

        setError(null);
        try {
            await api.unstar(id, type);
        } catch (err) {
            console.error('Failed to unstar item:', err);
            setError('Failed to unstar item');
            throw err;
        }
    };

    const scrobble = async (songId: string) => {
        if (!api) {
            console.log('Navidrome is not configured. Skipping scrobble.');
            return;
        }

        try {
            await api.scrobble(songId);
        } catch (err) {
            console.error('Failed to scrobble:', err);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (!api) {
                setIsConnected(false);
                setError('Navidrome is not configured. Please go to Settings to configure your Navidrome server.');
                return;
            }

            try {
                const connected = await api.ping();
                setIsConnected(connected);
                if (connected) {
                    await refreshData();
                } else {
                    setError('Failed to connect to Navidrome server');
                }
            } catch (err) {
                console.error('Failed to initialize Navidrome:', err);
                setError('Failed to initialize Navidrome connection');
                setIsConnected(false);
            }
        };

        initialize();
    }, [api, refreshData]);

    const value: NavidromeContextType = {
        // API instance
        api,

        // Data
        albums,
        artists,
        playlists,
        musicFolders,

        // Loading states
        isLoading,
        albumsLoading,
        artistsLoading,
        playlistsLoading,

        // Connection state
        isConnected,

        // Error state
        error,

        // Methods
        searchMusic,
        search,
        getAlbum,
        getArtist,
        getArtistInfo,
        getAlbumInfo,
        getArtistTopSongs,
        getPlaylist,
        getAllSongs,
        refreshData,
        createPlaylist,
        updatePlaylist,
        addToPlaylist,
        deletePlaylist,
        starItem,
        unstarItem,
        scrobble
    };

    return (
        <NavidromeContext.Provider value={value}>
            {children}
        </NavidromeContext.Provider>
    );
};

export const useNavidrome = (): NavidromeContextType => {
    const context = useContext(NavidromeContext);
    if (context === undefined) {
        throw new Error('useNavidrome must be used within a NavidromeProvider');
    }
    return context;
};