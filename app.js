
import { clientId, clientSecret } from "./keys.js";
async function getTokenAuth() {
    try {
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials"
            })
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Error al generar el token:", error);
    }
}
async function getStreamer(token, streamerName) {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/users?login=${streamerName}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Client-id": clientId
            }
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return data.data[0];
    } catch (error) {
        console.error('error', error);
    }
}
const token = await getTokenAuth();
let btn_search = document.getElementById('btn_search');
btn_search.addEventListener('click', async (e) => {
    e.preventDefault();
    const streamerName = document.getElementById('search').value;
    const streamer = await getStreamer(token, streamerName)
    console.log(streamer);
});

