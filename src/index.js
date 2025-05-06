function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(div => div.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    if(screenId === 'cadastro') document.getElementById('btnCliente').classList.add('active');
    else if(screenId === 'login') document.getElementById('btnLogin').classList.add('active');
  }

  // Login seguro
  document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;
    const loginError = document.getElementById('loginError');
    loginError.style.display = 'none';

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });

      if (!response.ok) {
        loginError.style.display = 'block';
        return;
      }

      const data = await response.json();
      if (data && data.token) {
        setToken(data.token); // Função definida em auth.js
        window.location.href = "template-profissional.html";
      } else {
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.style.display = 'block';
    }
  });