const apiConfig = {
    baseUrl: "http://localhost:8080",
    requests: {
        fetchAvailableTimes: {
            endpoint: "/horarios",
            method: "GET",
            body: null,
        },
        fetchAvailableTimesByPrestadorAndDate: {
            endpoint: (idPrestador, data) => {return `/horarios/prestador/${idPrestador}/${data}`},
            method: "GET",
            body: null,
        },
        fetchPrestadorAppointments: {
            endpoint: "/horarios/prestador/{id}",
            method: "GET",
            body: null,
        },
        fetchClienteAppointments: {
            endpoint: "/horarios/cliente/{id}",
            method: "GET",
            body: null,
        },
        createHorario: {
            endpoint: "/horarios",
            method: "POST",
            body: {
                "id": null,
                "data": null,
                "horarioInicial": null
            },
        },
        updateHorario: {
            endpoint: "/horarios",
            method: "PUT",
            body: {
                "id": null,
                "data": null,
                "horarioInicial": null
            },
        },
        deleteHorario: {
            endpoint: "/horarios/{id}",
            method: "DELETE",
            body: null,
        },
        getFotoPerfil: {
            endpoint: "/usuario/{id}/fotoPerfil",
            method: "GET",
            body: null,
        },
        getDadosPerfil: {
            endpoint: "/usuario/{id}",
            method: "GET",
            body: null,
        },
    },
};
