const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

if (!client_id || !client_secret) {
    console.error("Missing Spotify credentials in environment variables");
}

const basic = typeof Buffer !== "undefined"
    ? Buffer.from(`${client_id}:${client_secret}`).toString("base64")
    : btoa(`${client_id}:${client_secret}`);

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Spotify Auth Error Status:", response.status);
        console.error("Spotify Auth Error Response:", text);
        throw new Error(`Spotify Auth failed: ${response.status}`);
    }

    return response.json();
};

export const searchTracks = async (query: string) => {
    const { access_token } = await getAccessToken();

    return fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=NG`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};
