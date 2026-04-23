const client_id = "e0260bed5fad4f4cbbbedf1cf5c53f4c";
const client_secret = "e79a0566256b430f9e64891f8df4d2e1";
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

async function test() {
    try {
        const authResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ grant_type: "client_credentials" }),
        });
        const authData = await authResponse.json();
        console.log("Auth Success:", !!authData.access_token);
        const access_token = authData.access_token;

        const q = "jealous";
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5&market=NG`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const data = await res.json();
        
        console.log("Search Status:", res.status);
        if (data.tracks) {
             data.tracks.items.forEach((t, i) => {
                console.log(`${i+1}. ${t.name} - Preview: ${t.preview_url ? "YES" : "NO"}`);
            });
        } else {
            console.log("Error Detail:", data.error?.message);
        }

    } catch (e) { console.error(e); }
}
test();
