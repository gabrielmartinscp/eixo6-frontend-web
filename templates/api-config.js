const apiConfig = {
    baseUrl: "http://localhost:8080", // Raiz da URL da API
    requests: {
        fetchAvailableTimes: {
            endpoint: "/horarios",
            method: "GET",
            body: null, // GET não utiliza corpo
        },
        fetchUserDetails: {
            endpoint: "/user-details",
            method: "POST",
            body: { userId: null }, // Corpo da requisição pode ser configurado
        },
        fetchAppointments: {
            endpoint: "/appointments",
            method: "GET",
            body: null,
        },
    },
};
