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
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';

    try {
      const response = await fetch(`${apiConfig.baseUrl}/login`, {
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
        window.location.href = "home-profissional.html";
      } else {
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.style.display = 'block';
    }
  });

  //cadastro
  document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const usuario = document.getElementById('cadastroUsuario').value;
    const senha = document.getElementById('cadastroSenha').value;
    const confirmar = document.getElementById('confirmarSenha').value;
    const nome = document.getElementById('cadastroNome').value;
    const cadastroError = document.getElementById('cadastro-error');
    cadastroError.style.display = 'none';

    console.log(senha);
    console.log(confirmar);
    if (senha !== confirmar) {
      cadastroError.style.display = 'block';
      cadastroError.textContent = "As senhas não coincidem.";
      return;
    }
    try {
      const response = await fetch(`${apiConfig.baseUrl}/usuarios/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeExibicao : nome, tipo : "cliente", usuario, senha })
      });

      if (!response.ok) {
        console.log("Erro no cadastro[1]:");
        cadastroError.style.display = 'block';
        return;
      }

      const data = await response.json();
      if (data && data.token) {
        setToken(data.token); // Função definida em auth.js
        window.location.href = "home-profissional.html";
      } else {
        console.log("Erro no cadastro[2]:");
        cadastroError.style.display = 'block';
      }
    } catch (err) {
        console.log(err);
      cadastroError.style.display = 'block';
    }
  });
