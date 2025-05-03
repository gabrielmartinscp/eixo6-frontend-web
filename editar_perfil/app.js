document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profileForm');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Validate form inputs
        if (!validateForm()) {
            return;
        }

        // Prepare data to send to the API
        const profileData = {
            email: emailInput.value,
            username: usernameInput.value,
            password: passwordInput.value,
        };

        try {
            // Send data to the API
            const response = await fetch('http://127.0.0.1:8080/api/user/', {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Perfil atualizado com sucesso!');
                console.log(result); // Log the API response for debugging
            } else {
                const error = await response.json();
                alert(`Erro ao atualizar perfil: ${error.message}`);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
            alert('Ocorreu um erro ao tentar atualizar o perfil. Tente novamente mais tarde.');
        }
    });

    function validateForm() {
        let isValid = true;

        if (emailInput.value.trim() === '') {
            isValid = false;
            alert('O campo de e-mail é obrigatório.');
        }

        if (usernameInput.value.trim() === '') {
            isValid = false;
            alert('O campo de nome de usuário é obrigatório.');
        }

        if (passwordInput.value.trim() === '') {
            isValid = false;
            alert('O campo de senha é obrigatório.');
        }

        if (passwordInput.value !== confirmPasswordInput.value) {
            isValid = false;
            alert('As senhas não coincidem.');
        }

        return isValid;
    }
});