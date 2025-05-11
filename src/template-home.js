const calendarDates = document.getElementById("calendar-dates");
const prevWeekButton = document.getElementById("prev-week");
const nextWeekButton = document.getElementById("next-week");
const currentMonthElement = document.getElementById("current-month");
const appointmentsContainer = document.getElementById("appointments");

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
fotoPerfil = "http://localhost:8080/usuarios/" + userId + "/fotoPerfil"; // URL da foto de perfil
document.getElementById("profile-img").src = fotoPerfil;

//----------------------------------------
//----------------------------------------
//----------------------------------------

async function recuperarDadosPrestador(id) {


    const url = apiConfig.baseUrl + `/usuarios/${id}`;
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(url, { method: "GET", headers });
    if (response.error) {
        console.error("Erro ao recuperar dados do prestador:", response.error);
        return;
    }
    const dadosPrestador = await response.json();

    return dadosPrestador;

}

async function getHorariosFuturos() {
    const url = apiConfig.baseUrl + `/horarios/proximos/cliente/${userId}`;
    const token = getToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { method: "GET", headers });
    if (response.error) {
        console.error("Erro ao recuperar horários futuros:", response.error);
        return;
    }
    const horariosFuturos = await response.json();

    for(horario in horariosFuturos.content) {
        const prestador = await recuperarDadosPrestador(horariosFuturos.content[horario].idPrestador);
        horariosFuturos.content[horario].prestador = prestador;
    }

    //console.log("horáriosFuturos", horariosFuturos.content);
    return horariosFuturos;
}

async function renderizarHorariosFuturos() {
    const horariosFuturos = await getHorariosFuturos();
    if (!horariosFuturos) return;

    // Limpa o conteúdo atual
    appointmentsContainer.innerHTML = "";

    // Adiciona os horários futuros ao container
    horariosFuturos.content.forEach(horario => {
        const prestador = horario.prestador;
        const data = new Date(horario.data);
        const dia = data.getDate();
        const mes = data.toLocaleString('default', { month: 'long' });
        const ano = data.getFullYear();
        const horarioInicial = horario.horarioInicial.split(":").slice(0, 2).join(":");

        const appointmentDiv = document.createElement("div");
        appointmentDiv.className = "appointment";
        appointmentDiv.innerHTML = `
            <h3>${prestador.nomeExibicao}</h3>
            <span>${dia} ${mes} ${ano}</span>
            <span>${horarioInicial}</span>
            <button class="cancel-button" data-id="${horario.id}">Cancelar</button>
        `;
        const cancelButton = appointmentDiv.querySelector(".cancel-button");
        cancelButton.addEventListener("click", async (e) => {
            e.preventDefault();
            const idHorario = e.target.dataset.id;
            const confirmacao = confirm(`Deseja mesmo cancelar o horário de ${dia} de ${mes} às ${horarioInicial} com ${prestador.nomeExibicao}?`);
            if (!confirmacao) return;
            await cancelarHorario({ idHorario, token: getToken() });
            alert("Horário cancelado com sucesso!");
            await renderizarHorariosFuturos();
        });
        appointmentsContainer.appendChild(appointmentDiv);
    });
}

renderizarHorariosFuturos();