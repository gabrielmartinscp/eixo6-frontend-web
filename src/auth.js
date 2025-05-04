// Funções para gerenciar o token JWT
function setToken(token) {
    localStorage.setItem("jwtToken", token);
}

function getToken() {
    return localStorage.getItem("jwtToken");
}

function removeToken() {
    localStorage.removeItem("jwtToken");
}

window.setToken = setToken;
window.getToken = getToken;
window.removeToken = removeToken;