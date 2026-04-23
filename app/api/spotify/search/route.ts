import { NextResponse } from "next/server";
import { searchTracks } from "@/lib/spotify";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    try {
        const response = await searchTracks(query);
        
        if (!response.ok) {
            const text = await response.text();
            console.error("Spotify API Error Status:", response.status);
            console.error("Spotify API Error Response:", text);
            return NextResponse.json({ error: `Spotify API Error: ${response.status}`, details: text }, { status: response.status });
        }

        const data = await response.json();

        const tracks = data.tracks.items.map((track: any) => ({
            id: track.id,
            name: track.name,
            artist: track.artists.map((a: any) => a.name).join(", "),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
        }));

        return NextResponse.json({ tracks });
    } catch (error: any) {
        console.error("Spotify Search Error:", error);
        return NextResponse.json({ error: "Failed to fetch tracks from Spotify" }, { status: 500 });
    }
}
