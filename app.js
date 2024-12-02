
import { clientId, clientSecret } from "./keys.js";
import { getTokenLogin, getValidAuth, redirectToAuthorization } from "./auth_functions.js"; //para funcionalidades del login
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
async function getRecomendedStreams(token) {
  try {
    const response = await fetch(` https://api.twitch.tv/helix/streams`, {
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
    return data.data;
  } catch (error) {
    console.error('error', error);
  }
}
async function getInfoStreamer(token, streamerName) {
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
    console.log(data)
    const infoUser = {
      "id": data.data[0].id,
      "name": data.data[0].display_name,
      "description": data.data[0].description,
      "image": data.data[0].profile_image_url
    }
    return infoUser;
  } catch (error) {
    console.error('error', error);
  }

}
async function getInfoChannel(idStreamer) {
  try {
    const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${idStreamer}`, {
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
    const infoChannel = {
      "game_id": data.data[0].game_id,
      "game_name": data.data[0].game_name,
      "tags": data.data[0].tags,
      "title": data.data[0].title,
    }
    return infoChannel;
  } catch (error) {
    console.error('error', error);
  }
}
function showInfoStreamer(user, channel) {
  let tags = "";
  for (const tag of channel.tags) {
    tags += `<p class='fs-5 text-white' style='background:#9146ff; padding:5px; border-radius:10px;'>${tag}</p>`;
  }

  // Limpiar el contenedor antes de agregar nuevo contenido
  container_streamer.innerHTML = '';

  // Insertar contenido HTML dinámico
  container_streamer.innerHTML = `
   
  `;
}

function showRecomendedStreams(streams) {
let filter_streams = streams.filter((stream) => stream.language == "es");
console.log(filter_streams);

  container_recomended.innerHTML = '';

  let div_row = null;
  let contador = 0;

  for (const stream of streams) {
    const originalUrl = stream.thumbnail_url;
    const updatedUrl = originalUrl
      .replace('{width}', '800')
      .replace('{height}', '500');
    if (contador === 0) {
      div_row = document.createElement('div');
      div_row.className = 'row p-3';
      container_recomended.appendChild(div_row);
    }
    if (contador === 4) {
      contador = 0;
    }
    let div_col = document.createElement('div');
    div_col.className = 'col-4 d-flex gap-2 justify-content-center align-items-center p-2';
    div_col.innerHTML = `
      <a class=" h-100 p-2 d-flex flex-column" href='https://www.twitch.tv/${stream.user_name}'>
        <img src="${updatedUrl}" class="img-fluid" alt="${stream.title}"/>
        <div class="p-2 d-flex justify-content-center">
          <h5 class="">${stream.title}</h5>
        </div>
      </a>
    `;
    div_row.appendChild(div_col);
    contador++;

  }
}

let container_recomended = document.getElementById('container-recomended');
const token = await getTokenAuth();
const streams = await getRecomendedStreams(token);
console.log(streams);

showRecomendedStreams(streams);

let btn_search = document.getElementById('btn_search');
btn_search.addEventListener('click', async (e) => {
  e.preventDefault();
  const streamerName = document.getElementById('search').value;
  const infoUser = await getInfoStreamer(token, streamerName);
  const infoChannel = await getInfoChannel(infoUser.id);
  showInfoStreamer(infoUser, infoChannel);
  container_main.style.display = 'none';
  container_streamer.style.display = 'block';
});

let container_streamer = document.getElementById('container-streamer');
let container_main = document.getElementById('container-main');
let container_videos = document.getElementById('container-videos');
