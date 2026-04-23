const client_id = "e0260bed5fad4f4cbbbedf1cf5c53f4c";
const client_secret = "e79a0566256b430f9e64891f8df4d2e1";
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

async function test() {
    console.log("Testing Spotify Auth...");
    try {
        const authResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${basic}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "client_credentials",
            }),
        });

        const authData = await authResponse.json();
        const access_token = authData.access_token;
        console.log("Got Token.");

        console.log("Testing Spotify Search...");
        const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=jealous&type=track&limit=1`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const text = await searchResponse.text();
        console.log("Search Status:", searchResponse.status);
        console.log("Search Body:", text.substring(0, 500));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
