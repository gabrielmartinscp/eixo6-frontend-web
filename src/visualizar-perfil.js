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

    document.title = dadosUsuarioPerfil.nomeExibicao + " - EasyBook" || "EasyBook";

    
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
const usuarioPerfil = parametros.get("usuario");


const nomeUsuarioPerfil = document.getElementById("nome-usuario-perfil");
const bioUsuarioPerfil = document.getElementById("bio-usuario-perfil");

recuperarDadosPerfil(usuarioPerfil, nomeUsuarioPerfil, bioUsuarioPerfil);

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
        const newTimes = await getTimesByDateAndPrestador(date, userId); // Passa o id da URL
        timesByDate = { ...newTimes }; // Mescla os novos horários com os existentes
    }

    console.log("timesByDate após atualização:", timesByDate);
    renderAvailableTimes(timesByDate, userId);
}

// Função para renderizar os horários disponíveis
function renderAvailableTimes(timesByDate) {
    const availableTimesContainer = document.getElementById("available-times");
    if (!availableTimesContainer) {
        console.error("Elemento com ID 'available-times' não encontrado.");
        return;
    }

    console.log("Renderizando horários para a data:", timesByDate);

    availableTimesContainer.innerHTML = ""; // Limpa os horários anteriores

    console.log(timesByDate);
    console.log(timesByDate.length);
    if (timesByDate && Object.keys(timesByDate).length > 0) {
        for(time in timesByDate) {
            
            const timeButton = document.createElement("button");
            timeButton.textContent = timesByDate[time].horarioInicial;
            timeButton.classList.add("time-button");
            timeButton.addEventListener("click", async () => {
                const token = typeof getToken === 'function' ? getToken() : undefined;
            try {
                await agendarHorario({ idHorario: timesByDate[time].id, idCliente: userId, token });
                alert("Horário agendado com sucesso!");
                await updateTimesForDate(timesByDate[time].data); // Atualiza os horários para a data selecionada
            } catch (e) {
                alert("Erro ao agendar horário.");
            }
            });
            availableTimesContainer.appendChild(timeButton);
        };
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
async function getTimesByDateAndPrestador(date, userId) {
    // Nova rota: /horarios/prestador/{id}/{data}
    const url = apiConfig.baseUrl + `/horarios/prestador/disponivel/${userId}/${date}`;
    const headers = { "Content-Type": "application/json" };
    try {
        const response = await fetch(url, { method: "GET", headers });

        const json = await response.json(); // Verifica a resposta da API

        // Verifica se a resposta contém a propriedade "content"
        if (json && json.content) {
            return json.content; // Retorna o conteúdo da resposta
        }

        return []; // Retorna um array vazio se "content" não estiver presente
    } catch (error) {
        if (error.message === "connection_error") {
            return { error: "connection_error" }; // Retorna um erro de conexão
        }
        return []; // Retorna um array vazio em caso de erro genérico
    }
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
