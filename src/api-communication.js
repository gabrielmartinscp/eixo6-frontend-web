// Importa configuração da API
// Supondo que api-config.js exporta um objeto apiConfig
// Exemplo de api-config.js:
// export const apiConfig = {
//   baseUrl: "http://localhost:8080",
//   endpoints: {
//     horariosPrestador: "/horarios/prestador/{id}",
//     // outros endpoints...
//   }
// };

function getApiUrl(requestKey, params = {}) {
    // Busca o request na estrutura correta
    let request = apiConfig.requests[requestKey];
    if (!request) {
        throw new Error(`Request "${requestKey}" não encontrado em apiConfig.requests`);
    }
    let endpoint = request.endpoint;
    Object.keys(params).forEach(key => {
        endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(params[key]));
    });
    return apiConfig.baseUrl + endpoint;
}

// Função para buscar horários do prestador
async function fetchPrestadorAppointments({ userId, dateStr, token }) {
    if (!userId) {
        userId = 1;
        console.warn("Não foi possível recuperar o id do usuário autenticado. Usando id=1 para teste.");
    }
    const url = getApiUrl('fetchPrestadorAppointments', { id: userId });
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error("Erro ao buscar horários do prestador");
        const data = await response.json();
        // Se vierem horários de várias datas, filtre aqui:
        if (data && data.content) {
            // Se cada item tem .data e .horarioInicial:
            if (dateStr) {
                return data.content
                    .filter(item => item.data === dateStr)
                    .map(item => item.horarioInicial);
            }
            return data.content.map(item => item.horarioInicial);
        }
        return [];
    } catch (err) {
        console.error("Erro ao buscar horários do prestador:", err);
        return [];
    }
}

// Função para buscar horários específicos do prestador para uma data
async function fetchPrestadorHorariosByDate({ userId, dateStr, token }) {
    const url = getApiUrl('fetchPrestadorAppointments', { id: userId }) + (dateStr ? `?date=${encodeURIComponent(dateStr)}` : '');
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error("Erro ao buscar horários do prestador");
        const data = await response.json();
        // Retorna todos os objetos (com id, data, horarioInicial)
        if (data && data.content) {
            if (dateStr) {
            return data.content.filter(item => item.data === dateStr).map(item => ({
                id: item.id,
                data: item.data,
                horarioInicial: item.horarioInicial
            }));
        }
        return data.content.map(item => item.horarioInicial);
        }
        return [];
    } catch (err) {
        console.error("Erro ao buscar horários do prestador:", err);
        return [];
    }
}

// Função genérica para realizar requisições à API
async function makeApiRequest(requestName, params = {}) {
    try {
        const req = apiConfig.requests[requestName];
        if (!req) {
            throw new Error(`Requisição "${requestName}" não encontrada nas configurações.`);
        }

        // Monta a URL com parâmetros dinâmicos, se necessário
        let url = `${apiConfig.baseUrl}${req.endpoint}`;
        if (req.method === "GET" && params) {
            const queryParams = new URLSearchParams(params).toString();
            url += `?${queryParams}`;
        }

        // Configura o corpo da requisição, se necessário
        let body = null;
        if (req.method !== "GET" && req.body) {
            body = JSON.stringify({
                ...req.body,
                ...params, // Sobrescreve ou adiciona parâmetros dinâmicos ao corpo
            });
        }

        // Recupera o token JWT
        const token = getToken();
        //console.log("Token JWT enviado:", token); // Log para depuração

        // Configura os cabeçalhos da requisição
        const headers = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`; // Adiciona o cabeçalho Authorization explicitamente
        }

        // Realiza a requisição
        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body,
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição "${requestName}": ${response.statusText}`);
        }

        console.log("Resposta da API:", response); // Verifica a resposta da API
        return await response.json();
    } catch (error) {
        console.error(`Erro na comunicação com a API: ${error.message}`);
        throw new Error("connection_error"); // Lança um erro genérico de conexão
    }
}

// Função para buscar horários disponíveis (usando a função genérica)
async function fetchAvailableTimes(date) {
    try {
        const response = await makeApiRequest("fetchAvailableTimes", { date });

        // Verifica se a resposta contém a propriedade "content"
        if (response && response.content) {
            const times = response.content.map((item) => ({
                date: item.data, // Mapeia a propriedade "data" para "date"
                time: item.horarioInicial, // Mapeia a propriedade "horarioInicial" para "time"
                id: item.id, // Mapeia a propriedade "id" para "id"
            }));
            console.log("Horários mapeados:", times); // Verifica os horários mapeados
            return times;
        }

        return []; // Retorna um array vazio se "content" não estiver presente
    } catch (error) {
        if (error.message === "connection_error") {
            return { error: "connection_error" }; // Retorna um erro de conexão
        }
        return []; // Retorna um array vazio em caso de erro genérico
    }
}


// Função para organizar os horários em um registro JSON
async function getTimesByDate(date) {
    const times = await fetchAvailableTimes(date);
    const timesByDate = {};

    if (times.error === "connection_error") {
        return { error: "connection_error" }; // Propaga o erro de conexão
    }

    if (times.length === 0) {
        return { [date]: [] }; // Retorna um registro vazio para a data
    }

    // Organiza os horários por data
    times.forEach(({ date, time }) => {
        if (!timesByDate[date]) {
            timesByDate[date] = [];
        }
        timesByDate[date].push(time);
    });

    console.log("Horários organizados por data:", timesByDate); // Verifica os horários organizados
    return timesByDate;
}

// Função para renderizar os horários disponíveis
function renderAvailableTimes(date) {
    const availableTimesContainer = document.getElementById("available-times"); // Substitua pelo ID correto
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

// Função para criar um novo horário (POST)
async function createHorario({ data, idPrestador, horarioInicial, token }) {
    const url = apiConfig.baseUrl + "/horarios";
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const body = JSON.stringify({ data, idPrestador, horarioInicial });
    try {
        const response = await fetch(url, { method: "POST", headers, body });
        if (!response.ok) throw new Error("Erro ao criar horário");
        return await response.json();
    } catch (err) {
        console.error("Erro ao criar horário:", err);
        throw err;
    }
}

// Função para excluir um horário (DELETE)
async function deleteHorario({ id, token }) {
    const url = apiConfig.baseUrl + `/horarios/${id}`;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    try {
        const response = await fetch(url, { method: "DELETE", headers });
        if (!response.ok) throw new Error("Erro ao excluir horário");
        return true;
    } catch (err) {
        console.error("Erro ao excluir horário:", err);
        throw err;
    }
}

// Função para atualizar um horário (PUT)
async function updateHorario({ id, data, horarioInicial, token }) {
    // Usa o endpoint centralizado do api-config.js
    const url = apiConfig.baseUrl + apiConfig.requests.updateHorario.endpoint;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const body = JSON.stringify({ id, data, horarioInicial });
    try {
        const response = await fetch(url, { method: "PUT", headers, body });
        if (!response.ok) throw new Error("Erro ao atualizar horário");
        return await response.json();
    } catch (err) {
        console.error("Erro ao atualizar horário:", err);
        throw err;
    }
}

async function agendarHorario({ idHorario, idCliente, token }) {
    const url = apiConfig.baseUrl + `/horarios/agendar`;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const body = JSON.stringify({ idHorario, idCliente });
    console.log("Agendando horário:", body); // Log para depuração
    try {
        const response = await fetch(url, { method: "PUT", headers, body });
        if (!response.ok) throw new Error("Erro ao agendar horário");
        return await response.json();
    } catch (err) {
        console.error("Erro ao agendar horário:", err);
        throw err;
    }
}

async function cancelarHorario({ idHorario, token }) {
    const url = apiConfig.baseUrl + `/horarios/cancelar`;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const body = JSON.stringify({ id: Number(idHorario) });
    try {
        const response = await fetch(url, { method: "PUT", headers, body });
        if (!response.ok) throw new Error("Erro ao cancelar horário");
        return await response.json();
    } catch (err) {
        console.error("Erro ao agendar horário:", err);
        throw err;
    }
}
// Torna as funções acessíveis globalmente
window.fetchAvailableTimes = fetchAvailableTimes;
window.getTimesByDate = getTimesByDate;
window.renderAvailableTimes = renderAvailableTimes;
window.fetchPrestadorAppointments = fetchPrestadorAppointments;
window.getApiUrl = getApiUrl;
window.fetchPrestadorHorariosByDate = fetchPrestadorHorariosByDate;
window.createHorario = createHorario;
window.deleteHorario = deleteHorario;
window.updateHorario = updateHorario;
window.agendarHorario = agendarHorario;
window.cancelarHorario = cancelarHorario;