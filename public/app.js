import { clientId, clientSecret } from "./keys.js";
import {
  deleteStreamerInQueue,
  getTokenLogin,
  getValidAuth,
  redirectToAuthorization,
  saveInQueue,
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
async function getBestClipsByStreamer(idStreamer) {
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
async function getStreamersByUser() {
  const userValidated = JSON.parse(sessionStorage.getItem("userValidated"));

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams/followed?user_id=${userValidated.user_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          "Client-id": userValidated.client_id,
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
function showInfoUser(user) {
  container_user.innerHTML = `
   <div class='container-fluid'>
   <div class='row p-2 p-md-5'>
   <div class='col-12 d-flex flex-column flex-sm-row justify-content-around align-items-center'>
    <div class='row w-75'>
    <div class='col-12 col-md-4'>
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
function showInfoChannel(channel) {
  console.log(channel);
  let tags = "";
  for (const tag of channel.tags) {
    tags += `<p class='fs-5 text-black' style='background:#9146ff; padding:5px; border-radius:10px;'>${tag}</p>`;
  }
  container_channel.innerHTML = `
  <div class='container-fluid'>
   <div class='row p-2 p-md-5'>
   <div class='col-12 d-flex flex-column justify-content-center align-items-center p-2'>
    <div class='row w-75 d-flex flex-column justify-content-center align-items-center '>
    <div class='col-12 d-flex flex-column justify-content-center p-2'>
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
  console.log(streams);

  container_recomended.innerHTML = "";

  let div_row = null;
  let contador = 0;
  let str_tag = "";

  for (const stream of streams) {
    for (const tag of stream.tags) {
      str_tag += `<p class='fw-medium py-2 px-2 text-black rounded-3' style='background:#9146ff; width:fit-content;'>${tag}</p>`;
    }
    const originalUrl = stream.thumbnail_url;
    const updatedUrl = originalUrl
      .replace("{width}", "800")
      .replace("{height}", "500");
    if (contador === 0) {
      div_row = document.createElement("div");
      div_row.className = "row p-2 p-md-5";
      container_recomended.appendChild(div_row);
    }
    if (contador === 3) {
      contador = 0;
    }
    let div_col = document.createElement("div");
    div_col.className = "col-12 col-md-4 d-flex flex-column p-2";
    div_col.innerHTML = `
      <a class="position-relative p-2 d-flex flex-column stream" href='https://www.twitch.tv/${stream.user_name}'>
        <img src="${updatedUrl}" class="img-fluid rounded-3" alt="${stream.title}"/>
        <span class='position-absolute top-0 start-0 px-3 py-2 bg-dark rounded-3' style='width:fit-content;'><span class='pe-1'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 23H3q-.825 0-1.412-.587T1 21v-3h2v3h3zm12 0v-2h3v-3h2v3q0 .825-.587 1.413T21 23zm-6-4.5q-3 0-5.437-1.775T3 12q1.125-2.95 3.563-4.725T12 5.5t5.438 1.775T21 12q-1.125 2.95-3.562 4.725T12 18.5m0-3q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5T9.525 9.525T8.5 12t1.025 2.475T12 15.5m0-2q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5M1 6V3q0-.825.588-1.412T3 1h3v2H3v3zm20 0V3h-3V1h3q.825 0 1.413.588T23 3v3z"/></svg></span>${stream.viewer_count}</span>
        </a>
        <div class="p-2 d-flex flex-column justify-content-center gap-2 text-white">
          <h5 class="fw-medium text-truncate ">${stream.title}</h5>
          <div class='d-flex flex-wrap gap-2 align-items-center'>
           <h6 class="fw-normal">${stream.user_name}</h6>
            <p class='px-3 bg-white rounded-3 text-black' style='width:fit-content;'>${stream.language}</p>
           </div>
        </div>
        <div class='p-2 d-flex flex-wrap gap-1'>
        ${str_tag}
        </div>
      
    `;
    div_row.appendChild(div_col);
    str_tag = "";
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
    "col-12 d-flex flex-column justify-content-center align-items-center p-2";
  div_col_12.innerHTML =
    "<div class='row w-75'><h2 class='text-white'>Clips</h2></div>";
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
    div_col.className =
      "col-12 col-md-4 d-flex justify-content-center align-items-center p-2";

    div_col.innerHTML = `
      <a class="position-relative p-2 h-100 d-flex flex-column stream" href='https://www.twitch.tv/${clip.user_name}' target="_blank" rel="noopener noreferrer">
        <img src="${updatedUrl}" class="img-fluid rounded-3" alt="${clip.title}" />
         <span class='position-absolute top-0 start-0 px-3 py-2 bg-dark rounded-3' style='width:fit-content;'><span class='pe-1'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 23H3q-.825 0-1.412-.587T1 21v-3h2v3h3zm12 0v-2h3v-3h2v3q0 .825-.587 1.413T21 23zm-6-4.5q-3 0-5.437-1.775T3 12q1.125-2.95 3.563-4.725T12 5.5t5.438 1.775T21 12q-1.125 2.95-3.562 4.725T12 18.5m0-3q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5T9.525 9.525T8.5 12t1.025 2.475T12 15.5m0-2q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5M1 6V3q0-.825.588-1.412T3 1h3v2H3v3zm20 0V3h-3V1h3q.825 0 1.413.588T23 3v3z"/></svg></span>${clip.view_count}</span>
        <div class="p-2 d-flex justify-content-center">
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
function showStreamers(followedStreamers) {
  container_followedStreamers.innerHTML =
    "<h1 class='text-white fw-medium text-center mt-5 '>Followed Streamers</h1>";

  let div_row_principal = document.createElement("div");
  div_row_principal.className = "row p-2 p-md-5";

  let div_col_12 = document.createElement("div");
  div_col_12.className =
    "h-100 col-12 d-flex flex-column justify-content-center align-items-center";
  div_row_principal.appendChild(div_col_12);

  let div_row = null;
  let contador = 0;

  for (const streamer of followedStreamers) {
    // Actualizar la URL de la imagen
    const originalUrl = streamer.thumbnail_url;
    const updatedUrl = originalUrl
      .replace("{width}", "800")
      .replace("{height}", "500");

    if (contador === 0) {
      div_row = document.createElement("div");
      div_row.className = "row w-75 p-2 p-md-5";
      div_col_12.appendChild(div_row);
    }

    let div_col = document.createElement("div");
    div_col.className = "h-100 col-12 col-md-4 p-2 d-flex flex-column ";
    div_col.innerHTML = `
    <a class='position-relative p-2 d-flex flex-column stream' href='https://www.twitch.tv/${streamer.user_name}' target="_blank" rel="noopener noreferrer">
      <img src="${updatedUrl}" class="img-fluid rounded-3" alt="${streamer.title}" />
      <span class='position-absolute top-0 start-0 px-3 py-2 bg-dark rounded-3' style='width:fit-content;'>
        <span class='pe-1'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 23H3q-.825 0-1.412-.587T1 21v-3h2v3h3zm12 0v-2h3v-3h2v3q0 .825-.587 1.413T21 23zm-6-4.5q-3 0-5.437-1.775T3 12q1.125-2.95 3.563-4.725T12 5.5t5.438 1.775T21 12q-1.125 2.95-3.562 4.725T12 18.5m0-3q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5T9.525 9.525T8.5 12t1.025 2.475T12 15.5m0-2q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5M1 6V3q0-.825.588-1.412T3 1h3v2H3v3zm20 0V3h-3V1h3q.825 0 1.413.588T23 3v3z"/>
          </svg>
        </span>${streamer.viewer_count}
      </span>
    </a>
    <div class="d-flex flex-column justify-content-center text-white ">
      <h5 class="p-2 fw-medium  text-truncate">${streamer.title}</h5>
      <div class='d-flex gap-2 align-items-center'>
        <span class="fw-normal">${streamer.user_name}</span>
        <span class='px-3 bg-white rounded-3 text-black' style='width:fit-content;'>${streamer.language}</span>
       <button class='btn text-black'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 15h2v-3h3v-2h-3V7h-2v3H8v2h3zm-3 6v-2H4q-.825 0-1.412-.587T2 17V5q0-.825.588-1.412T4 3h16q.825 0 1.413.588T22 5v12q0 .825-.587 1.413T20 19h-4v2zm-4-4h16V5H4zm0 0V5z"/></svg></button>
        </div>
     
    </div>`;

    const button = div_col.querySelector("button");
    button.addEventListener("click", () => {
      saveInQueue(streamer);
    });

    div_row.appendChild(div_col);

    contador++;
    if (contador === 3) {
      contador = 0;
    }
  }

  container_followedStreamers.append(div_row_principal);
}
function showQueue() {
  const queueStorage = JSON.parse(sessionStorage.getItem("StreamersQueue"));
  container_queue.innerHTML =
    "<h1 class='text-white fw-medium text-center mt-5'>QUEUE</h1>";

  let div_row_principal = document.createElement("div");
  div_row_principal.className = "row p-2 p-md-5";

  let div_col_12 = document.createElement("div");
  div_col_12.className =
    "h-100 col-12 d-flex flex-column justify-content-center align-items-center";
  div_row_principal.appendChild(div_col_12);

  let div_row = null;
  let contador = 0;

  for (const streamer of queueStorage) {
    // Actualizar la URL de la imagen
    const originalUrl = streamer.thumbnail_url;
    const updatedUrl = originalUrl
      .replace("{width}", "800")
      .replace("{height}", "500");

    if (contador === 0) {
      div_row = document.createElement("div");
      div_row.className = "row w-75 p-2 p-md-5";
      div_col_12.appendChild(div_row);
    }

    let div_col = document.createElement("div");
    div_col.className =
      "h-100 col-12 col-md-4 p-2 d-flex flex-column justify-content-center align-items-center";
    div_col.innerHTML = `
      <a class='position-relative p-2 d-flex flex-column stream' href='https://www.twitch.tv/${streamer.user_name}' target="_blank" rel="noopener noreferrer">
        <img src="${updatedUrl}" class="img-fluid rounded-3" alt="${streamer.title}" />
        <span class='position-absolute top-0 start-0 px-3 py-2 bg-dark rounded-3' style='width:fit-content;'>
          <span class='pe-1'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 23H3q-.825 0-1.412-.587T1 21v-3h2v3h3zm12 0v-2h3v-3h2v3q0 .825-.587 1.413T21 23zm-6-4.5q-3 0-5.437-1.775T3 12q1.125-2.95 3.563-4.725T12 5.5t5.438 1.775T21 12q-1.125 2.95-3.562 4.725T12 18.5m0-3q1.45 0 2.475-1.025T15.5 12t-1.025-2.475T12 8.5T9.525 9.525T8.5 12t1.025 2.475T12 15.5m0-2q-.625 0-1.062-.437T10.5 12t.438-1.062T12 10.5t1.063.438T13.5 12t-.437 1.063T12 13.5M1 6V3q0-.825.588-1.412T3 1h3v2H3v3zm20 0V3h-3V1h3q.825 0 1.413.588T23 3v3z"/>
            </svg>
          </span>${streamer.viewer_count}
        </span>
      </a>
      <div class="d-flex flex-column justify-content-center gap-2 text-white">
        <h5 class="p-2 fw-medium h-100 ">${streamer.title}</h5>
        <div class='d-flex flex-wrap gap-2 align-items-center'>
          <span class="fw-normal">${streamer.user_name}</span>
          <span class='px-3 bg-white rounded-3 text-black' style='width:fit-content;'>${streamer.language}</span>
           <button class='btn btn-danger text-black'><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M16.4 21L15 19.6l2.1-2.1l-2.1-2.1l1.4-1.4l2.1 2.1l2.1-2.1l1.4 1.4l-2.075 2.1L22 19.6L20.6 21l-2.1-2.075zM12 21q-3.45 0-6.012-2.287T3.05 13H5.1q.35 2.6 2.313 4.3T12 19q.275 0 .513-.012t.487-.063v2.025q-.25.025-.488.038T12 21M3 10V4h2v2.35q1.275-1.6 3.113-2.475T12 3q3.75 0 6.375 2.625T21 12h-2q0-2.925-2.037-4.962T12 5q-1.725 0-3.225.8T6.25 8H9v2zm10.35 4.75L11 12.4V7h2v4.6l1.4 1.4z"/></svg></button>
          </div>
       
      </div>`;
    const button = div_col.querySelector("button");
    button.addEventListener("click", () => {
      deleteStreamerInQueue(streamer);
    });
    div_row.appendChild(div_col);

    contador++;
    if (contador === 3) {
      contador = 0;
    }
    container_queue.appendChild(div_row_principal);
  }
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
  const clips = await getBestClipsByStreamer(infoUser.id);
  showInfoUser(infoUser);
  showInfoChannel(infoChannel);
  showClips(clips);
  container_main.style.display = "none";
  container_title.style.display = "none";
  container_followedStreamers.style.display = "none";
  container_queue.style.display = "none";
  container_user.style.display = "block";
  container_channel.style.display = "block";
  container_videos.style.display = "block";
});

let btn_login = document.getElementById("login");
btn_login.addEventListener("click", async (e) => {
  console.log("hola");
  e.preventDefault();
  redirectToAuthorization(clientId);
});
const tokenLogin = getTokenLogin();
console.log(tokenLogin);

if (tokenLogin !== "") {
  sessionStorage.setItem("token", tokenLogin);
}
if (sessionStorage.getItem("token") != null) {
  const validAuth = await getValidAuth(sessionStorage.getItem("token"));
  sessionStorage.setItem("userValidated", JSON.stringify(validAuth));
}

let btn_loginnav = document.getElementById("loginNav");

btn_loginnav.addEventListener("click", async (e) => {
  e.preventDefault();
  redirectToAuthorization(clientId);
  const tokenLogin = getTokenLogin();
  const validAuth = await getValidAuth(tokenLogin);
  sessionStorage.setItem("userValidated", JSON.stringify(validAuth));
});

let btn_streamer = document.getElementById("btn_streamers");
btn_streamer.addEventListener("click", async (e) => {
  e.preventDefault();
  const streamers = await getStreamersByUser();
  showStreamers(streamers);
  container_main.style.display = "none";
  container_title.style.display = "none";
  container_user.style.display = "none";
  container_channel.style.display = "none";
  container_videos.style.display = "none";
  container_recomended.style.display = "none";
  container_queue.style.display = "none";
  container_followedStreamers.style.display = "block";
});
let btn_streamerNav = document.getElementById("btn_streamersNav");
btn_streamerNav.addEventListener("click", async (e) => {
  e.preventDefault();
  const streamers = await getStreamersByUser();
  showStreamers(streamers);
  container_main.style.display = "none";
  container_title.style.display = "none";
  container_user.style.display = "none";
  container_channel.style.display = "none";
  container_videos.style.display = "none";
  container_recomended.style.display = "none";
  container_queue.style.display = "none";
  container_followedStreamers.style.display = "block";
});
let btn_queue = document.getElementById("btn_queue");
btn_queue.addEventListener("click", () => {
  let streamersStorage = JSON.parse(sessionStorage.getItem("StreamersQueue"));
  if (streamersStorage == null) {
    console.log("esta vacio");
    return;
  }

  //mostrar la cola
  showQueue();
  container_main.style.display = "none";
  container_title.style.display = "none";
  container_user.style.display = "none";
  container_channel.style.display = "none";
  container_videos.style.display = "none";
  container_recomended.style.display = "none";
  container_followedStreamers.style.display = "none";
  container_queue.style.display = "block";
});
let btn_queueNav = document.getElementById("btn_queueNav");
btn_queueNav.addEventListener("click", () => {
  let streamersStorage = JSON.parse(sessionStorage.getItem("StreamersQueue"));
  if (streamersStorage == null) {
    console.log("esta vacio");
    return;
  }
  //mostrar la cola
  showQueue();
  container_main.style.display = "none";
  container_title.style.display = "none";
  container_user.style.display = "none";
  container_channel.style.display = "none";
  container_videos.style.display = "none";
  container_recomended.style.display = "none";
  container_followedStreamers.style.display = "none";
  container_queue.style.display = "block";
});

let auth = "";
if (sessionStorage.getItem("userValidated") != null) {
  auth = JSON.parse(sessionStorage.getItem("userValidated"));
  btn_login.innerText = auth.login;
  btn_loginnav.innerText = auth.login;
}
//contenedores
let container_title = document.getElementById("container-title");
let container_user = document.getElementById("container-user");
let container_channel = document.getElementById("container-channel");
let container_main = document.getElementById("container-main");
let container_videos = document.getElementById("container-videos");
let container_followedStreamers = document.getElementById(
  "container-followedStreamers"
);
let container_queue = document.getElementById("container-queue");
