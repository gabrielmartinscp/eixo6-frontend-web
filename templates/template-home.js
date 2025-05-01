const calendarDates = document.getElementById("calendar-dates");
const prevWeekButton = document.getElementById("prev-week");
const nextWeekButton = document.getElementById("next-week");
const currentMonthElement = document.getElementById("current-month");
const availableTimesContainer = document.getElementById("available-times");

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
        dayLabel.textContent = weekDayAbbreviations[day.getDay()];
        dayContainer.appendChild(dayLabel);

        // Adiciona o número do dia
        const dayNumber = document.createElement("div");
        dayNumber.textContent = day.getDate();
        dayNumber.dataset.date = day.toISOString().split("T")[0]; // Formato AAAA-MM-DD
        dayContainer.appendChild(dayNumber);

        // Adiciona a classe "active" ao dia atual
        if (
            currentDate.toDateString() === day.toDateString() &&
            !document.querySelector(".day.active")
        ) {
            dayContainer.classList.add("active");
            await updateTimesForDate(day.toISOString().split("T")[0]); // Atualiza os horários
        }

        // Evento de clique para tornar o dia ativo
        dayContainer.addEventListener("click", async () => {
            document.querySelectorAll(".day").forEach((d) => d.classList.remove("active"));
            dayContainer.classList.add("active");
            await updateTimesForDate(day.toISOString().split("T")[0]); // Atualiza os horários
            updateCurrentMonth(weekDays); // Atualiza o mês com base no dia selecionado
        });

        calendarDates.appendChild(dayContainer);
    }

    // Atualiza o mês exibido inicialmente
    updateCurrentMonth(weekDays);
}

// Função para atualizar os horários para uma data específica
async function updateTimesForDate(date) {
    if (!timesByDate[date]) {
        timesByDate = await getTimesByDate(date); // Busca os horários da API
    }
    renderAvailableTimes(date);
}

// Função para renderizar os horários disponíveis
function renderAvailableTimes(date) {
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
        //console.log(selectedDate);
        let recentlySelectedDay = new Date(selectedDate);
        recentlySelectedDay.setDate(selectedDate.getDate() + 1); // Adiciona um dia para o próximo mês
        //console.log(recentlySelectedDay);
        let newMonth = recentlySelectedDay.getMonth();
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

// Inicializa o calendário com a semana atual
(async () => {
    const weekDays = getWeekDays(currentDate);
    await renderWeekDays(weekDays);
})();