document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const usernameInput = document.getElementById('username');
    const fotoInput = document.getElementById('fotoPerfil');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validação simples
        if (usernameInput.value.trim() === '') {
            alert('O campo de nome de usuário é obrigatório.');
            return;
        }

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
        if (!userId) {
            alert('Não foi possível identificar o usuário autenticado.');
            return;
        }

        // Monta o FormData
        const formData = new FormData();
        // Parte JSON com nomeExibicao e id
        const dados = {
            nomeExibicao: usernameInput.value,
            id: userId
        };
        formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));
        // Parte file (fotoPerfil)
        if (fotoInput && fotoInput.files && fotoInput.files[0]) {
            formData.append('fotoPerfil', fotoInput.files[0]);
        }

        // Recupera o token de autenticação
        let token = null;
        if (typeof getToken === 'function') {
            token = getToken();
        }

        try {
            const response = await fetch('http://localhost:8080/usuarios', {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : undefined
                    // NÃO defina 'Content-Type' manualmente ao usar FormData!
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                alert('Perfil atualizado com sucesso!');
                messageDiv.textContent = "Perfil atualizado com sucesso!";
                window.location = "template-home.html"; // Recarrega a página para refletir as mudanças
                //console.log(result);
            } else {
                let errorMsg = "Erro ao atualizar perfil.";
                try {
                    const error = await response.json();
                    if (error && error.message) errorMsg = error.message;
                } catch {}
                alert(errorMsg);
                messageDiv.textContent = errorMsg;
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            alert('Ocorreu um erro ao tentar atualizar o perfil. Tente novamente mais tarde.');
            messageDiv.textContent = 'Ocorreu um erro ao tentar atualizar o perfil. Tente novamente mais tarde.';
        }
    });
});