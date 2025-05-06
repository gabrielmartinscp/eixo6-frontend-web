const calendarDates = document.getElementById("calendar-dates");
const prevWeekButton = document.getElementById("prev-week");
const nextWeekButton = document.getElementById("next-week");
const currentMonthElement = document.getElementById("current-month");
const availableTimesContainer = document.getElementById("available-times");

//----------------------------------------
//----------------------------------------
//----------------------------------------
// Recupera o id do usuário autenticado a partir do token JWT
let userId = null;
if (typeof getToken === 'function') {
    const token = getToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.id) userId = payload.id;
        } catch (e) {}
    }
}
const fotoPerfil = "http://localhost:8080/usuarios/" + userId + "/fotoPerfil"; // URL da foto de perfil
document.getElementById("profile-img").src = fotoPerfil;

//-------------- carregar dados do perfil solicitado na query

async function recuperarDadosPerfil(id, elementoNome, elementoBio) {


    const url = apiConfig.baseUrl + `/usuarios/${id}`;
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(url, { method: "GET", headers });
    if (response.error) {
        console.error("Erro ao recuperar dados do usuário:", response.error);
        return;
    }
    const dadosUsuarioPerfil = await response.json();

    console.log("Dados do usuário:", dadosUsuarioPerfil);

    elementoNome.textContent = dadosUsuarioPerfil.nomeExibicao || "Nome não disponível";
    elementoBio.textContent = dadosUsuarioPerfil.bio || "Bio não disponível";

    
    const fotoUsuarioPerfil = "http://localhost:8080/usuarios/" + id + "/fotoPerfil";
    const imgElement = document.getElementById("profile-img-queried-user");

fetch(fotoUsuarioPerfil)
    .then(response => {
        if (response.status === 200) {
            imgElement.src = fotoUsuarioPerfil;
        } else {
            imgElement.src = "";
        }
    })
    .catch(() => {
        imgElement.src = "";
    });

}

const parametros = new URLSearchParams(window.location.search);
const usuarioPeril = parametros.get("usuario");


const nomeUsuarioPerfil = document.getElementById("nome-usuario-perfil");
const bioUsuarioPerfil = document.getElementById("bio-usuario-perfil");

recuperarDadosPerfil(usuarioPeril, nomeUsuarioPerfil, bioUsuarioPerfil);

//----------------------------------------
//----------------------------------------
//----------------------------------------
let currentDate = new Date(); // Data atual
let timesByDate = {}; // Registro de horários por data

// Abreviações dos dias da semana
const weekDayAbbreviations = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Função para obter os dias da semana com base em uma data
function getWeekDays(date) {
    const weekDays = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // Segunda-feira

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
    }

    return weekDays;
}

// Função para renderizar os dias da semana no calendário
async function renderWeekDays(weekDays) {
    calendarDates.innerHTML = ""; // Limpar os dias anteriores

    for (const day of weekDays) {
        const dayContainer = document.createElement("div");
        dayContainer.classList.add("day");

        // Adiciona a legenda do dia da semana
        const dayLabel = document.createElement("span");
        dayLabel.textContent = weekDayAbbreviations[(day.getDay() + 6) % 7]; // Ajusta para começar na segunda-feira
        dayContainer.appendChild(dayLabel);

        // Adiciona o número do dia
        const dayNumber = document.createElement("div");
        dayNumber.textContent = day.getDate();
        dayNumber.dataset.date = day.toLocaleDateString("en-CA"); // Formato AAAA-MM-DD
        dayContainer.appendChild(dayNumber);

        // Adiciona a classe "active" ao dia atual
        if (
            currentDate.toDateString() === day.toDateString() &&
            !document.querySelector(".day.active")
        ) {
            dayContainer.classList.add("active");
            const selectedDate = day.toLocaleDateString("en-CA"); // Formato AAAA-MM-DD
            console.log("Data ativa ao navegar entre semanas:", selectedDate);
            await updateTimesForDate(selectedDate); // Atualiza os horários
        }

        // Evento de clique para tornar o dia ativo
        dayContainer.addEventListener("click", async () => {
            document.querySelectorAll(".day").forEach((d) => d.classList.remove("active"));
            dayContainer.classList.add("active");

            const selectedDate = day.toLocaleDateString("en-CA"); // Formato AAAA-MM-DD
            console.log("Data selecionada:", selectedDate);

            await updateTimesForDate(selectedDate); // Atualiza os horários
            updateCurrentMonth(weekDays); // Atualiza o mês com base no dia selecionado
        });

        calendarDates.appendChild(dayContainer);
    }

    // Atualiza o mês exibido inicialmente
    updateCurrentMonth(weekDays);
}

// Função para atualizar os horários para uma data específica
async function updateTimesForDate(date) {
    console.log("Data recebida em updateTimesForDate:", date);

    if (!timesByDate[date]) {
        const newTimes = await getTimesByDate(date, usuarioPeril); // Passa o id da URL
        timesByDate = { ...timesByDate, ...newTimes }; // Mescla os novos horários com os existentes
    }

    console.log("timesByDate após atualização:", timesByDate);
    renderAvailableTimes(date);
}

// Função para renderizar os horários disponíveis
function renderAvailableTimes(date) {
    const availableTimesContainer = document.getElementById("available-times");
    if (!availableTimesContainer) {
        console.error("Elemento com ID 'available-times' não encontrado.");
        return;
    }

    console.log("Renderizando horários para a data:", date);
    console.log("Horários disponíveis em renderAvailableTimes:", timesByDate[date]);

    availableTimesContainer.innerHTML = ""; // Limpa os horários anteriores

    if (timesByDate[date] && timesByDate[date].length > 0) {
        timesByDate[date].forEach((time) => {
            const timeButton = document.createElement("button");
            timeButton.textContent = time;
            timeButton.classList.add("time-button");
            availableTimesContainer.appendChild(timeButton);
        });
    } else {
        availableTimesContainer.textContent = "Nenhum horário disponível.";
    }
}

// Função para atualizar o mês exibido com base no dia selecionado ou na predominância
function updateCurrentMonth(weekDays) {
    const selectedDay = document.querySelector(".day.active");
    console.log(selectedDay);

    if (selectedDay) {
        // Se houver um dia selecionado, usa o mês desse dia
        const selectedDate = new Date(selectedDay.querySelector("div").dataset.date); // Usa o formato AAAA-MM-DD
        console.log("selectedDate: "+selectedDate);
        //console.log(selectedDate);
        let recentlySelectedDay = new Date(selectedDate);
        recentlySelectedDay.setDate(selectedDate.getDate()); // Adiciona um dia para o próximo mês
        //console.log(recentlySelectedDay);
        let newMonth = selectedDate.getMonth();
        currentMonthElement.textContent = monthNames[newMonth];
    } else {
        // Caso contrário, usa a regra de predominância
        const monthCounts = {};

        weekDays.forEach((day) => {
            const month = day.getMonth();
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        const predominantMonth = Object.keys(monthCounts).reduce((a, b) =>
            monthCounts[a] > monthCounts[b] ? a : b
        );

        currentMonthElement.textContent = monthNames[predominantMonth];
    }
}

// Função para mudar para a semana anterior
prevWeekButton.addEventListener("click", async () => {
    currentDate.setDate(currentDate.getDate() - 7);
    const weekDays = getWeekDays(currentDate);
    await renderWeekDays(weekDays);
});

// Função para mudar para a semana seguinte
nextWeekButton.addEventListener("click", async () => {
    currentDate.setDate(currentDate.getDate() + 7);
    const weekDays = getWeekDays(currentDate);
    await renderWeekDays(weekDays);
});

// Função para buscar horários disponíveis por data e id de usuário/prestador
async function getTimesByDate(date, userId) {
    // Usa fetchPrestadorAppointments, já implementada em api-communication.js
    const timesRaw = await fetchPrestadorAppointments({ userId, dateStr: date });

    const timesByDate = {};

    if (!Array.isArray(timesRaw)) {
        return { [date]: [] };
    }

    if (timesRaw.length === 0) {
        return { [date]: [] };
    }

    // O retorno de fetchPrestadorAppointments já é um array de horários (strings)
    timesByDate[date] = timesRaw;

    return timesByDate;
}

// Inicializa o calendário com a semana atual
(async () => {
    const weekDays = getWeekDays(currentDate);
    await renderWeekDays(weekDays);
})();



// --- Navegação ---
(function() {
    let userId = null;
    if (typeof getToken === 'function') {
        const token = getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && payload.id) userId = payload.id;
            } catch (e) {}
        }
    }
    if (userId) {
        document.getElementById("profile-img").src = "http://localhost:8080/usuarios/" + userId + "/fotoPerfil";
    }
})();

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
dropdownBtns[1].onclick = function() { window.location.href = "template-servidor.html"; };
dropdownBtns[2].onclick = function() { window.location.href = "atualizar-perfil.html"; };
dropdownBtns[3].onclick = function() {
    if (confirm("Deseja mesmo se desconectar?")) {
        if (typeof removeToken === 'function') removeToken();
        window.location.href = "index.html";
    }
};