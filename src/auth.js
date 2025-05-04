// Funções para gerenciar o token JWT
function setToken(token) {
    localStorage.setItem("jwtToken", token); // Armazena o token no localStorage
}

function getToken() {
    console.log(localStorage.getItem("jwtToken"));
    return localStorage.getItem("jwtToken"); // Recupera o token do localStorage
}

function removeToken() {
    localStorage.removeItem("jwtToken"); // Remove o token do localStorage
}

// Torna as funções acessíveis globalmente
window.setToken = setToken;
window.getToken = getToken;
window.removeToken = removeToken;