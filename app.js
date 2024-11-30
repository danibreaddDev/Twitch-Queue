
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
<div class='row p-3' style='background:#171618; border-top:2px solid black; border-bottom:2px solid black;'>
  <div class='col-12 d-flex justify-content-center'>
    <div class='row w-75'>
      <div class='col-12 d-flex flex-row justify-content-around'>
        <img src='${data.profile_image_url}' class='img-fluid rounded'>
        <div class='d-flex flex-column justify-content-center'>
          <div class='p-2 d-flex flex-column justify-content-center'>
            <p class='fs-2 fw-bold text-white'>${data.display_name}</p>
            <div class='p-3 d-flex flex-row gap-5'>
              <button class='btn' id='btn_search'>Overview</button>
              <button class='btn' id='btn_games'>Games</button>
              <button class='btn' id='btn_subs'>Subs</button>
              <button class='btn' id='btn_stats'>Stadistics</button>
            </div>
          </div>
        </div>
        <div class='d-flex flex-row align-items-center'>
          <div class='d-flex flex-row align-items-center justify-content-center' style='background: purple; border: 2px solid black; border-radius: 10px; padding: 10px;'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="white" d="m12 14.475l1.9 1.15q.275.175.55-.012t.2-.513l-.5-2.175l1.7-1.475q.25-.225.15-.537t-.45-.338l-2.225-.175l-.875-2.05q-.125-.3-.45-.3t-.45.3l-.875 2.05l-2.225.175q-.35.025-.45.338t.15.537l1.7 1.475l-.5 2.175q-.075.325.2.513t.55.012zM8.65 20H6q-.825 0-1.412-.587T4 18v-2.65L2.075 13.4q-.275-.3-.425-.662T1.5 12t.15-.737t.425-.663L4 8.65V6q0-.825.588-1.412T6 4h2.65l1.95-1.925q.3-.275.663-.425T12 1.5t.738.15t.662.425L15.35 4H18q.825 0 1.413.588T20 6v2.65l1.925 1.95q.275.3.425.663t.15.737t-.15.738t-.425.662L20 15.35V18q0 .825-.587 1.413T18 20h-2.65l-1.95 1.925q-.3.275-.662.425T12 22.5t-.737-.15t-.663-.425zm.85-2l2.5 2.5l2.5-2.5H18v-3.5l2.5-2.5L18 9.5V6h-3.5L12 3.5L9.5 6H6v3.5L3.5 12L6 14.5V18zm2.5-6"/>
            </svg>
            <p class='fs-4 fw-bold text-white font-weight-bold m-0 ms-2'>Rank 355</p>
          </div>
        </div>
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

