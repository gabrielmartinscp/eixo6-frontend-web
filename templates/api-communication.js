apiConfig.requests = {
    fetchAvailableTimes: {
        endpoint: "/available-times",
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

        // Realiza a requisição
        const response = await fetch(url, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
            },
            body,
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição "${requestName}": ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na comunicação com a API: ${error.message}`);
        throw new Error("connection_error"); // Lança um erro genérico de conexão
    }
}

// Função para buscar horários disponíveis (usando a função genérica)
async function fetchAvailableTimes(date) {
    try {
        return await makeApiRequest("fetchAvailableTimes", { date });
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

    times.forEach(({ date, time }) => {
        if (!timesByDate[date]) {
            timesByDate[date] = [];
        }
        timesByDate[date].push(time);
    });

    return timesByDate;
}

// Torna as funções acessíveis globalmente
window.fetchAvailableTimes = fetchAvailableTimes;
window.getTimesByDate = getTimesByDate;