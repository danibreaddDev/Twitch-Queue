//FUNCIONALIDADES PARA HACERSE CON EL LOGIN
//en el caso de loguerte para funcionalidades
export function redirectToAuthorization() {
    const redirectUri = "http://localhost:5500/index.html"; // Asegúrate de que coincida con el registrado en Twitch
    const scope = "user:read:follows"; // Scopes requeridos

    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl; // Redirige al usuario
}

export function getTokenLogin() {

    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
        console.log("Token de usuario obtenido:", accessToken);
        return accessToken;
    } else {
        console.error("No se encontró el token de acceso en la URL.");
        return null;
    }
}
export async function getValidAuth(token) {
    try {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            method: "GET",
            headers: {
                "Authorization": `OAuth ${token}`,
            }
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al generar el token:", error);
    }
}