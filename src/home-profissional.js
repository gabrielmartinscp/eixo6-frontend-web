// --- Seletores DOM ---
const weekDaysContainer = document.getElementById('week-days-container');
const currentMonthYearElement = document.getElementById('current-month-year');
const prevWeekButton = document.getElementById('prev-week');
const nextWeekButton = document.getElementById('next-week');
const appointmentsContainer = document.getElementById('appointments-container');
const noAppointmentsMsg = document.getElementById('no-appointments-msg');
const navTabs = document.querySelectorAll('.nav-tab');
const contentSections = document.querySelectorAll('.content-section');
// Edição Programada
const weeklyScheduleEditor = document.getElementById('weekly-schedule-editor');
const saveProgrammedButton = document.getElementById('save-programmed-schedule');
// Edição Específica
const calendarMonthYear = document.getElementById('current-month-year-specific');
const prevMonthButtonSpecific = document.getElementById('prev-month-specific');
const nextMonthButtonSpecific = document.getElementById('next-month-specific');
const calendarDaysGrid = document.getElementById('calendar-days-grid');
const specificDayEditorDiv = document.getElementById('specific-day-schedule-editor');
const specificDayLabel = document.getElementById('specific-day-label');
const specificDaySlotsContainer = document.getElementById('specific-day-slots-container');
const addSpecificDaySlotButton = document.getElementById('add-specific-day-slot');
const saveSpecificDayButton = document.getElementById('save-specific-day-schedule');
const specificDayPlaceholder = document.getElementById('specific-day-placeholder');

// --- Constantes e Variáveis Globais ---
const dayAbbreviations = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const weekDayNamesFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let currentDate = new Date(); // Para visualização de agenda
let selectedDateStr = new Date().toISOString().split('T')[0]; // Para visualização de agenda
let specificCalendarDate = new Date(); // Mês/Ano atual do calendário específico
let specificSelectedDateStr = null; // Data selecionada no calendário específico (YYYY-MM-DD)
let programmedSchedule = {
    'Dom': [],
    'Seg': [],
    'Ter': [],
    'Qua': [],
    'Qui': [],
    'Sex': [],
    'Sáb': []
};
// Armazena horários específicos por data: { [data]: [{id, horarioInicial}] }
let specificDateSchedules = {};

// --- Função utilitária para obter o id do usuário autenticado ---
function getCurrentUserId() {
    // Tenta extrair do token JWT, se disponível
    if (typeof getUserId === 'function') {
        return getUserId();
    } else if (typeof getUser === 'function') {
        const user = getUser();
        if (user && user.id) return user.id;
    } else if (typeof getToken === 'function') {
        const token = getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && payload.id) return payload.id;
            } catch (e) { }
        }
    }
    //return 1; // fallback para teste
}

// --- Funções de Renderização (Visualizar Agenda) ---
async function renderAppointments(dateStr) {
    appointmentsContainer.innerHTML = '';
    noAppointmentsMsg.style.display = 'none';

    const userId = getCurrentUserId();
    const token = typeof getToken === 'function' ? getToken() : undefined;

    // Nova consulta simplificada: /horarios/prestador/{id}/{data}
    const url = `${apiConfig.baseUrl}/horarios/prestador/${userId}/${dateStr}`;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error("Erro ao buscar horários do prestador");
        const data = await response.json();

        // Espera-se que a resposta seja um array de horários ou um objeto com .content
        let appointments = [];
        if (Array.isArray(data)) {
            appointments = data.map(item => item.horarioInicial || item);
        } else if (data && Array.isArray(data.content)) {
            appointments = data.content.map(item => item.horarioInicial || item);
        }

        if (!appointments || appointments.length === 0) {
            noAppointmentsMsg.textContent = `Nenhum horário agendado para ${dateStr.split('-').reverse().join('/')}.`;
            noAppointmentsMsg.style.display = 'block';
        } else {
            appointments.forEach(time => {
                const timeElement = document.createElement('div');
                timeElement.className = 'appointment-time';
                timeElement.textContent = time;
                appointmentsContainer.appendChild(timeElement);
            });
        }
    } catch (err) {
        noAppointmentsMsg.textContent = "Erro ao buscar horários.";
        noAppointmentsMsg.style.display = 'block';
        console.error(err);
    }
}

function renderWeekDays() {
    weekDaysContainer.innerHTML = '';
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const middleOfWeek = new Date(startOfWeek);
    middleOfWeek.setDate(startOfWeek.getDate() + 3);
    currentMonthYearElement.textContent = `${monthNames[middleOfWeek.getMonth()]} ${middleOfWeek.getFullYear()}`;
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dayNumber = day.getDate();
        const dayAbbreviation = dayAbbreviations[day.getDay()];
        const dayDateStr = day.toISOString().split('T')[0];
        const dayElement = document.createElement('div');
        dayElement.className = 'text-center flex-shrink-0 w-10 md:w-12';
        const abbrElement = document.createElement('span');
        abbrElement.className = 'text-xs text-gray-500 block mb-1';
        abbrElement.textContent = dayAbbreviation;
        dayElement.appendChild(abbrElement);
        const numberElement = document.createElement('button');
        numberElement.className = 'day-button';
        numberElement.textContent = dayNumber;
        numberElement.dataset.date = dayDateStr;
        if (dayDateStr === selectedDateStr) {
            numberElement.classList.add('day-selected');
        }
        numberElement.addEventListener('click', async (event) => {
            const newlySelectedDateStr = event.currentTarget.dataset.date;
            const previouslySelectedElement = weekDaysContainer.querySelector('.day-selected');
            if (previouslySelectedElement) {
                previouslySelectedElement.classList.remove('day-selected');
            }
            event.currentTarget.classList.add('day-selected');
            selectedDateStr = newlySelectedDateStr;
            await renderAppointments(selectedDateStr);
        });
        dayElement.appendChild(numberElement);
        weekDaysContainer.appendChild(dayElement);
    }
}


// --- Funções para Edição Programada ---
function createTimeSlotElement(dayKey, startTime = '', isSpecific = false, horarioId = null) {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'time-slot';
    if (horarioId) slotDiv.dataset.horarioId = horarioId;
    slotDiv.dataset.currentValue = startTime;

    const startInput = document.createElement('input');
    startInput.type = 'time';
    startInput.className = 'form-input form-input-time';
    startInput.value = startTime;
    startInput.dataset.day = dayKey;
    startInput.dataset.type = 'start';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'action-button remove-button';
    removeButton.innerHTML = '&ndash;';
    removeButton.title = 'Remover horário';
    removeButton.onclick = async () => {
        if (isSpecific && slotDiv.dataset.horarioId) {
            const token = typeof getToken === 'function' ? getToken() : undefined;
            try {
                await deleteHorario({ id: slotDiv.dataset.horarioId, token });
                slotDiv.remove();
                specificDateSchedules[dayKey] = (specificDateSchedules[dayKey] || []).filter(
                    s => String(s.id) !== String(slotDiv.dataset.horarioId)
                );
            } catch (e) {
                alert("Erro ao excluir horário.");
            }
        } else {
            slotDiv.remove();
        }
    };

    let saveButton = null;
    if (isSpecific && horarioId) {
        saveButton = document.createElement('button');
        saveButton.type = 'button';
        saveButton.className = 'action-button add-button ml-2 save-slot-btn';
        saveButton.innerHTML = '💾';
        saveButton.title = 'Salvar alteração';
        saveButton.disabled = true;
        saveButton.classList.add('disabled-save');

        // Habilita/desabilita o botão conforme alteração
        startInput.addEventListener('input', () => {
            if (startInput.value !== slotDiv.dataset.currentValue) {
                saveButton.disabled = false;
                saveButton.classList.remove('disabled-save');
            } else {
                saveButton.disabled = true;
                saveButton.classList.add('disabled-save');
            }
        });

        saveButton.onclick = async () => {
            const token = typeof getToken === 'function' ? getToken() : undefined;
            try {
                await updateHorario({
                    id: horarioId,
                    data: dayKey,
                    horarioInicial: startInput.value,
                    token
                });
                alert("Horário atualizado!");
                // Após salvar, atualiza o valor original e desabilita o botão novamente
                slotDiv.dataset.currentValue = startInput.value;
                saveButton.disabled = true;
                saveButton.classList.add('disabled-save');
            } catch (e) {
                alert("Erro ao atualizar horário.");
            }
        };
    }

    slotDiv.appendChild(startInput);
    slotDiv.appendChild(removeButton);
    if (saveButton) slotDiv.appendChild(saveButton);

    return slotDiv;
}

function renderProgrammedEditor() {
    weeklyScheduleEditor.innerHTML = '';
    dayAbbreviations.forEach(dayKey => {
        const dayRow = document.createElement('div');
        dayRow.className = 'day-schedule-row';
        const dayLabel = document.createElement('span');
        dayLabel.className = 'day-label';
        dayLabel.textContent = dayKey;
        dayRow.appendChild(dayLabel);
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'time-slots-container';
        slotsContainer.id = `slots-${dayKey}`;
        const existingSlots = programmedSchedule[dayKey] || [];
        if (existingSlots.length > 0) {
            existingSlots.forEach(startTime => {
                slotsContainer.appendChild(createTimeSlotElement(dayKey, startTime));
            });
        }
        dayRow.appendChild(slotsContainer);
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'action-button add-button ml-2';
        addButton.innerHTML = '+';
        addButton.title = 'Adicionar horário';
        addButton.onclick = () => {
            const newSlot = createTimeSlotElement(dayKey);
            slotsContainer.appendChild(newSlot);
        };
        dayRow.appendChild(addButton);
        weeklyScheduleEditor.appendChild(dayRow);
    });
}

async function loadSpecificDaySchedules(dateStr) {
    const userId = getCurrentUserId();
    const token = typeof getToken === 'function' ? getToken() : undefined;

    // Nova consulta simplificada: /horarios/prestador/{id}/{data}
    const url = `${apiConfig.baseUrl}/horarios/prestador/${userId}/${dateStr}`;
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
        const response = await fetch(url, { method: "GET", headers });
        if (!response.ok) throw new Error("Erro ao buscar horários do prestador");
        const data = await response.json();

        // Espera-se que a resposta seja um array de objetos com id, data, horarioInicial
        let horarios = [];
        if (Array.isArray(data)) {
            horarios = data.map(item => ({
                id: item.id,
                horarioInicial: item.horarioInicial || item
            }));
        } else if (data && Array.isArray(data.content)) {
            horarios = data.content.map(item => ({
                id: item.id,
                horarioInicial: item.horarioInicial || item
            }));
        }
        specificDateSchedules[dateStr] = horarios;
    } catch (err) {
        specificDateSchedules[dateStr] = [];
        console.error(err);
    }
}

async function renderSpecificDayEditor(dateStr) {
    await loadSpecificDaySchedules(dateStr);
    specificDaySlotsContainer.innerHTML = '';
    specificDayLabel.textContent = dateStr.split('-').reverse().join('/');
    const slots = specificDateSchedules[dateStr] || [];
    if (slots.length > 0) {
        slots.forEach(slot => {
            specificDaySlotsContainer.appendChild(
                createTimeSlotElement(dateStr, slot.horarioInicial, true, slot.id)
            );
        });
    }
    specificDayEditorDiv.classList.remove('hidden-section');
    specificDayPlaceholder.classList.add('hidden-section');
}

function renderSpecificCalendar() {
    calendarDaysGrid.innerHTML = '';
    const year = specificCalendarDate.getFullYear();
    const month = specificCalendarDate.getMonth();
    calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const btn = document.createElement('button');
        btn.className = 'calendar-day-button other-month';
        btn.textContent = day;
        btn.disabled = true;
        calendarDaysGrid.appendChild(btn);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement('button');
        btn.className = 'calendar-day-button current-month';
        btn.textContent = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        btn.dataset.date = dateStr;
        if (dateStr === specificSelectedDateStr) {
            btn.classList.add('selected');
        }
        btn.addEventListener('click', handleSpecificDayClick);
        calendarDaysGrid.appendChild(btn);
    }
    const totalCells = 42;
    const filledCells = startDayOfWeek + daysInMonth;
    const remainingCells = totalCells - filledCells;
    for (let day = 1; day <= remainingCells; day++) {
        const btn = document.createElement('button');
        btn.className = 'calendar-day-button other-month';
        btn.textContent = day;
        btn.disabled = true;
        calendarDaysGrid.appendChild(btn);
    }
}

function handleSpecificDayClick(event) {
    const selectedBtn = event.currentTarget;
    const dateStr = selectedBtn.dataset.date;
    const previouslySelected = calendarDaysGrid.querySelector('.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    selectedBtn.classList.add('selected');
    specificSelectedDateStr = dateStr;
    renderSpecificDayEditor(specificSelectedDateStr);
}

// Adiciona novo horário (POST)
addSpecificDaySlotButton.addEventListener('click', async () => {
    if (!specificSelectedDateStr) return;
    const userId = getCurrentUserId();
    const token = typeof getToken === 'function' ? getToken() : undefined;
    const horarioInicial = "09:00";
    try {
        const novoHorario = await createHorario({
            data: specificSelectedDateStr,
            idPrestador: userId,
            horarioInicial,
            token
        });
        await renderSpecificDayEditor(specificSelectedDateStr);
    } catch (e) {
        alert("Erro ao criar horário.");
    }
});

// Salva todos os horários do dia (atualiza horários já existentes)
saveSpecificDayButton.addEventListener('click', async () => {
    if (!specificSelectedDateStr) {
        alert("Por favor, selecione um dia no calendário primeiro.");
        return;
    }
    const token = typeof getToken === 'function' ? getToken() : undefined;
    const timeSlots = specificDaySlotsContainer.querySelectorAll('.time-slot');
    let erro = false;
    for (const slot of timeSlots) {
        const startInput = slot.querySelector('input[data-type="start"]');
        const horarioId = slot.dataset.horarioId;
        if (horarioId) {
            try {
                await updateHorario({
                    id: horarioId,
                    data: specificSelectedDateStr,
                    horarioInicial: startInput.value,
                    token
                });
                slot.dataset.currentValue = startInput.value;
            } catch (e) {
                erro = true;
            }
        }
        const saveButtons = specificDaySlotsContainer.querySelectorAll('.save-slot-btn');
        for (const saveButton of saveButtons) {
            saveButton.disabled = true;
            saveButton.classList.add('disabled-save');
        }
    }
    if (!erro) {
        alert(`Horários para ${specificSelectedDateStr.split('-').reverse().join('/')} salvos com sucesso!`);
    } else {
        alert("Erro ao salvar um ou mais horários.");
    }
});

// --- Lógica de Navegação por Abas ---
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetId = tab.dataset.target;
        navTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        contentSections.forEach(section => { section.classList.add('hidden-section'); });
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            if (targetId === 'edit-programmed') {
                renderProgrammedEditor();
            } else if (targetId === 'edit-specific') {
                renderSpecificCalendar();
            }
        }
    });
});

// --- Event Listeners ---
prevWeekButton.addEventListener('click', async () => {
    currentDate.setDate(currentDate.getDate() - 7);
    renderWeekDays();
    await renderAppointments(selectedDateStr);
});
nextWeekButton.addEventListener('click', async () => {
    currentDate.setDate(currentDate.getDate() + 7);
    renderWeekDays();
    await renderAppointments(selectedDateStr);
});
/*
saveProgrammedButton.addEventListener('click', () => {
    console.log("Salvando agenda programada...");
    const updatedSchedule = {};
    dayAbbreviations.forEach(dayKey => {
        updatedSchedule[dayKey] = [];
        const slotsContainer = document.getElementById(`slots-${dayKey}`);
        if (slotsContainer) {
            const timeSlots = slotsContainer.querySelectorAll('.time-slot');
            timeSlots.forEach(slot => {
                const startInput = slot.querySelector('input[data-type="start"]');
                if (startInput && startInput.value) {
                    updatedSchedule[dayKey].push(startInput.value);
                }
            });
        }
    });
    programmedSchedule = updatedSchedule;
    console.log("Agenda atualizada:", programmedSchedule);
    alert("Agenda programada salva com sucesso! (Verifique o console para detalhes)");
});
*/
prevMonthButtonSpecific.addEventListener('click', () => {
    specificCalendarDate.setMonth(specificCalendarDate.getMonth() - 1);
    renderSpecificCalendar();
});
nextMonthButtonSpecific.addEventListener('click', () => {
    specificCalendarDate.setMonth(specificCalendarDate.getMonth() + 1);
    renderSpecificCalendar();
});

// --- Inicialização ---
(async () => {
    renderWeekDays();
    await renderAppointments(selectedDateStr);
    document.getElementById('view-agenda').classList.remove('hidden-section');
    //document.getElementById('edit-programmed').classList.add('hidden-section');
    document.getElementById('edit-specific').classList.add('hidden-section');
})();



async function recuperarDadosPerfil(id) {


    const url = apiConfig.baseUrl + `/usuarios/${id}`;
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(url, { method: "GET", headers });
    if (response.error) {
        console.error("Erro ao recuperar dados do usuário:", response.error);
        return;
    }
    const dadosUsuarioPerfil = await response.json();

    return dadosUsuarioPerfil;

}

(async function () {
    let userId = null;
    if (typeof getToken === 'function') {
        const token = getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload && payload.id) userId = payload.id;
            } catch (e) { }
        }
    }
    if (userId) {

        let fotoPerfil = "http://localhost:8080/usuarios/" + userId + "/fotoPerfil"; // URL da foto de perfil

        document.getElementById("profile-img").src = fotoPerfil;
        document.getElementById("profile-img-big").src = fotoPerfil;
        const dadosUsuarioLogado = await recuperarDadosPerfil(userId);
        document.getElementById("profile-name").textContent = dadosUsuarioLogado.nomeExibicao;
        console.log(dadosUsuarioLogado);
    }
})();


document.getElementById("edit-profile-card").onclick = function() { window.location.href = "atualizar-perfil.html"; };

