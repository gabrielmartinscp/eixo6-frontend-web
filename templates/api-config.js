const apiConfig = {
    baseUrl: "https://api.example.com", // Raiz da URL da API
    requests: {
        fetchAvailableTimes: {
            endpoint: "/available-times",
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
