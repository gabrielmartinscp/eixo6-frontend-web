
const profileLink = document.getElementById('profile-link');
const dropdown = document.getElementById('profile-dropdown');
let dropdownOpen = false;

profileLink.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropdown.style.display = dropdownOpen ? 'none' : 'block';
    dropdownOpen = !dropdownOpen;
});

document.addEventListener('click', function(e) {
    if (dropdownOpen && !profileLink.contains(e.target)) {
        dropdown.style.display = 'none';
        dropdownOpen = false;
    }
});


const dropdownBtns = dropdown.querySelectorAll('.dropdown-btn');
dropdownBtns[0].onclick = function() { window.location.href = "template-home.html"; };
dropdownBtns[1].onclick = function() { window.location.href = "home-profissional.html"; };
dropdownBtns[2].onclick = function() { window.location.href = "atualizar-perfil.html"; };
dropdownBtns[3].onclick = function() {
    if (confirm("Deseja mesmo se desconectar?")) {
        removeToken();
        window.location.href = "index.html";
    }
};