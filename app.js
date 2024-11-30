
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
function showInfoStreamer(data) {

    container_streamer.innerHTML = '';
    container_streamer.innerHTML = `
    <div class='row p-3 border border-2 rounded' style='background:#171618'>
    <div class='col-3'>
    <img src='${data.profile_image_url}' class='img-fluid rounded'>
    </div>
    <div class='col-9 d-flex flex-column justify-content-center'>
    <div class='p-2 d-flex flex-column justify-content-center'>
     <p class='fs-2 fw-bold text-white'>${data.display_name}</p>
      <div class='p-3 d-flex flex-row gap-5'>
      <button class='btn btn-primary'>Overview</button>
      <button class='btn btn-primary'>Games</button>
      <button class='btn btn-primary'>Subs</button>
      <button class='btn btn-primary'>Stadistics</button>
      </div>
       <div class='d-flex flex-row gap-2'>
       
       </div>
      </div>
    </div>
    </div>
    `;
}
const token = await getTokenAuth();
let btn_search = document.getElementById('btn_search');
btn_search.addEventListener('click', async (e) => {
    e.preventDefault();
    const streamerName = document.getElementById('search').value;
    const streamer = await getStreamer(token, streamerName);
    console.log(streamer);
    container_main.style.display = 'none';
    container_streamer.style.display = 'block';
    showInfoStreamer(streamer);
});
let container_streamer = document.getElementById('container-streamer');
let container_main = document.getElementById('container-main');

