import { clientId, clientSecret } from "./keys.js";
import {
  getTokenLogin,
  getValidAuth,
  redirectToAuthorization,
} from "./auth_functions.js"; //para funcionalidades del login
async function getTokenAuth() {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
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
async function getRecomendedStreams() {
  try {
    const response = await fetch(` https://api.twitch.tv/helix/streams`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-id": clientId,
      },
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("error", error);
  }
}
async function getInfoStreamer(streamerName) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/users?login=${streamerName}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-id": clientId,
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    console.log(data);
    const infoUser = {
      id: data.data[0].id,
      name: data.data[0].display_name,
      description: data.data[0].description,
      image: data.data[0].profile_image_url,
    };
    return infoUser;
  } catch (error) {
    console.error("error", error);
  }
}
async function getInfoChannel(idStreamer) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${idStreamer}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-id": clientId,
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    const infoChannel = {
      game_id: data.data[0].game_id,
      game_name: data.data[0].game_name,
      tags: data.data[0].tags,
      title: data.data[0].title,
    };
    return infoChannel;
  } catch (error) {
    console.error("error", error);
  }
}
async function getBestClipsByUser(idStreamer) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${idStreamer}&first=6`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-id": clientId,
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("error", error);
  }
}
async function getigdbId(game_name) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/games?name=${game_name}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-id": clientId,
        },
      }
    );
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data.data[0].igdb_id;
  } catch (error) {
    console.error("error", error);
  }
}
async function getImage(id) {
  //Prerequisites: You need to have an AWS account with permissions to deploy CloudFormation stacks.
  try {
    const response = await fetch(`https://api.igdb.com/v4/games/?`, {
      method: "POST",
      mode: "no-cors",
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-id": clientId,
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({
        query: `
        fields cover.url;
        where id = ${id};
    `,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("error", error);
  }
}
function showInfoUser(user) {
  container_user.innerHTML = `
   <div class='container-fluid'>
   <div class='row p-2 p-md-5'>
   <div class='col-12 d-flex flex-column flex-sm-row justify-content-around align-items-center'>
    <div class='row w-75'>
    <div class='col-12 col-md-4 d-flex justify-content-center'>
    <img src='${user.image}' class='img-fluid rounded'/>
    </div>
    <div class='col-12 col-md-8 d-flex justify-content-center align-items-center'>
    <div class='p-2 d-flex flex-column text-white'>
    <h2>${user.name}</h2>
    <p>${user.description}</p>
     <a href='https://www.twitch.tv/${user.name}'>Twitch</a>
    </div>
    </div>
    </div>
   </div>
   </div>
   </div>
  `;
}
async function showInfoChannel(channel) {
  console.log(channel);
  let tags = "";
  for (const tag of channel.tags) {
    tags += `<p class='fs-5 text-white' style='background:#9146ff; padding:5px; border-radius:10px;'>${tag}</p>`;
  }
  container_channel.innerHTML = `
  <div class='container-fluid'>
   <div class='row p-2 p-md-5'>
   <div class='col-12 d-flex flex-column justify-content-center align-items-center'>
    <div class='row w-75 d-flex flex-column justify-content-center align-items-center '>
    <div class='ps-md-5 ps-2 col-12 d-flex flex-column justify-content-center'>
    <h2 class='fs-2 fw-bold text-white'>Streaming</h2>
    <div class='p-2 d-flex flex-column text-white'>
    <h3 class='fs-3 fw-light text-white'>${channel.title}</h3>
    <p>${channel.game_name}</p>
     <div class='d-flex flex-wrap gap-2'>
     ${tags}
     </div>
    </div>
    </div>
    </div>
   </div>
   </div>
   </div>`;
}

function showRecomendedStreams(streams) {
  let filter_streams = streams.filter((stream) => stream.language == "es");
  console.log(filter_streams);

  container_recomended.innerHTML = "";

  let div_row = null;
  let contador = 0;

  for (const stream of streams) {
    const originalUrl = stream.thumbnail_url;
    const updatedUrl = originalUrl
      .replace("{width}", "800")
      .replace("{height}", "500");
    if (contador === 0) {
      div_row = document.createElement("div");
      div_row.className = "row p-3";
      container_recomended.appendChild(div_row);
    }
    if (contador === 3) {
      contador = 0;
    }
    let div_col = document.createElement("div");
    div_col.className =
      "col-12 col-md-4 d-flex gap-2 justify-content-center align-items-center p-2";
    div_col.innerHTML = `
      <a class=" h-100 p-2 d-flex flex-column" href='https://www.twitch.tv/${stream.user_name}'>
        <img src="${updatedUrl}" class="img-fluid rounded" alt="${stream.title}"/>
        <div class="p-2 d-flex justify-content-center">
          <h5 class="">${stream.title}</h5>
        </div>
      </a>
    `;
    div_row.appendChild(div_col);
    contador++;
  }
}
function showClips(clips) {
  console.log(clips);

  container_videos.innerHTML = "";

  let div_row_principal = document.createElement("div");
  div_row_principal.className = "row p-2 p-md-5";

  let div_col_12 = document.createElement("div");
  div_col_12.className =
    "col-12 d-flex justify-content-center align-items-center"; 

  let div_row_actual = null; 
  let contador = 0;

  for (const clip of clips) {
    const originalUrl = clip.thumbnail_url;
    const updatedUrl = originalUrl
      .replace("{width}", "800")
      .replace("{height}", "500");

    if (contador == 0) {
      div_row_actual = document.createElement("div");
      div_row_actual.className = "row w-75"; 
      div_col_12.appendChild(div_row_actual);
    }
    if (contador == 3) {
      contador = 0;
    }
    let div_col = document.createElement("div");
    div_col.className = "col-12 col-md-4 d-flex justify-content-center align-items-center p-2";

    div_col.innerHTML = `
      <a class="h-100 d-flex flex-column" href='https://www.twitch.tv/${clip.user_name}' target="_blank" rel="noopener noreferrer">
        <img src="${updatedUrl}" class="img-fluid rounded" alt="${clip.title}" />
        <div class="d-flex justify-content-center">
          <h5>${clip.title}</h5>
        </div>
      </a>
    `;

    
    div_row_actual.appendChild(div_col);
    contador++;
  }

  div_row_principal.appendChild(div_col_12);
  container_videos.appendChild(div_row_principal);
}

let container_recomended = document.getElementById("container-recomended");
const token = await getTokenAuth();
const streams = await getRecomendedStreams(token);
console.log(streams);

showRecomendedStreams(streams);

let btn_search = document.getElementById("btn_search");
btn_search.addEventListener("click", async (e) => {
  e.preventDefault();
  const streamerName = document.getElementById("search").value;
  const infoUser = await getInfoStreamer(streamerName);
  const infoChannel = await getInfoChannel(infoUser.id);
  const clips = await getBestClipsByUser(infoUser.id);
  showInfoUser(infoUser);
  showInfoChannel(infoChannel);
  showClips(clips);
  container_main.style.display = "none";
  container_user.style.display = "block";
  container_channel.style.display = "block";
  container_videos.style.display = "block";
});

let container_user = document.getElementById("container-user");
let container_channel = document.getElementById("container-channel");
let container_main = document.getElementById("container-main");
let container_videos = document.getElementById("container-videos");
