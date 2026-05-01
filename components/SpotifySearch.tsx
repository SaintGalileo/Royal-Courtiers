"use client";

import { useState } from "react";
import { Search, Music, X } from "lucide-react";
import { toast } from "sonner";

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    previewUrl: string | null;
    spotifyUrl: string;
}

interface SpotifySearchProps {
    onSelect: (track: SpotifyTrack) => void;
    onClose: () => void;
}

export default function SpotifySearch({ onSelect, onClose }: SpotifySearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SpotifyTrack[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.tracks) {
                setResults(data.tracks);
            }
        } catch (error) {
            toast.error("Failed to search tracks");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-900">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                            <Music size={18} />
                        </div>
                        <h2 className="text-lg font-bold">Pick Your Favorite Song</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="p-4 border-b border-zinc-100 dark:border-zinc-900">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search songs or artists..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 dark:border-zinc-800 dark:bg-zinc-900"
                        />
                    </div>
                </form>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((track) => (
                                <div
                                    key={track.id}
                                    className="group flex items-center justify-between gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                                            <img src={track.albumArt} alt={track.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{track.name}</p>
                                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{track.artist}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onSelect(track)}
                                        className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95 hover:bg-green-600"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-40 flex-col items-center justify-center text-zinc-400">
                            <Music size={32} strokeWidth={1.5} className="mb-2 opacity-20" />
                            <p className="text-sm">Search for your favorite track</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 text-[10px] text-center text-zinc-400 uppercase tracking-widest font-bold">
                    Powered by Spotify
                </div>
            </div>
        </div>
    );
}
