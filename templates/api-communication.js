apiConfig.requests = {
    fetchAvailableTimes: {
        endpoint: "/horarios",
        method: "GET",
        body: null,
    },
    fetchUserDetails: {
        endpoint: "/user-details",
        method: "POST",
        body: { userId: null },
    },
    fetchAppointments: {
        endpoint: "/appointments",
        method: "GET",
        body: null,
    },
};

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

        setToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJBUEkgZWl4byA2Iiwic3ViIjoidGVzdGUiLCJleHAiOjE3NDYzMTgzNTAsImlkIjoxfQ.iYzs74-rbg1PbA-C0RO51C21Tjw5806uT1k_rgE86YI");
        // Recupera o token JWT
        const token = getToken();
        console.log("Token JWT enviado:", token); // Log para depuração

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

// Torna as funções acessíveis globalmente
window.fetchAvailableTimes = fetchAvailableTimes;
window.getTimesByDate = getTimesByDate;
window.renderAvailableTimes = renderAvailableTimes;