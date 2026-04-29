// Armazenar token
function salvarToken(token) {
  localStorage.setItem('token', token);
}

function obterToken() {
  return localStorage.getItem('token');
}

function limparToken() {
  localStorage.removeItem('token');
}

function estaAutenticado() {
  return !!obterToken();
}

// API BASE
const API_BASE = window.location.origin + '/api';

// REGISTRO
async function registrar() {
  const email = document.getElementById('reg_email').value;
  const senha = document.getElementById('reg_senha').value;
  const nome = document.getElementById('reg_nome').value;

  try {
    const res = await fetch(`${API_BASE}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha, nome })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Usuário criado! Faça login agora.');
      mostrarLogin();
    } else {
      alert('❌ ' + data.erro);
    }
  } catch (err) {
    alert('Erro ao registrar: ' + err);
  }
}

// LOGIN
async function login() {
  const email = document.getElementById('login_email').value;
  const senha = document.getElementById('login_senha').value;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    if (res.ok) {
      salvarToken(data.token);
      alert('✅ Login realizado!');
      mostrarDashboard();
      carregarAnalises();
    } else {
      alert('❌ ' + data.erro);
    }
  } catch (err) {
    alert('Erro ao fazer login: ' + err);
  }
}

// LOGOUT
function logout() {
  limparToken();
  mostrarLogin();
}

// CARREGAR ANÁLISES
async function carregarAnalises() {
  try {
    const res = await fetch(`${API_BASE}/analises`, {
      headers: { 'Authorization': `Bearer ${obterToken()}` }
    });

    const analises = await res.json();
    let html = '<h3>Suas Análises</h3>';
    
    if (analises.length === 0) {
      html += '<p>Nenhuma análise ainda.</p>';
    } else {
      html += '<ul>';
      analises.forEach(a => {
        html += `<li><strong>${a.tipo_modulo}</strong> - Status: ${a.status}</li>`;
      });
      html += '</ul>';
    }

    document.getElementById('analises_container').innerHTML = html;
  } catch (err) {
    console.error('Erro ao carregar análises:', err);
  }
}

// CRIAR ANÁLISE
async function criarAnalise() {
  const tipo = document.getElementById('tipo_modulo').value;

  try {
    const res = await fetch(`${API_BASE}/analises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({ tipo_modulo: tipo, dados_json: {} })
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Análise criada!');
      carregarAnalises();
    } else {
      alert('❌ Erro: ' + data.erro);
    }
  } catch (err) {
    alert('Erro ao criar análise: ' + err);
  }
}

// AGENDAR
async function agendar() {
  const servico = document.getElementById('tipo_servico').value;
  const data = document.getElementById('data_agendamento').value;

  try {
    const res = await fetch(`${API_BASE}/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obterToken()}`
      },
      body: JSON.stringify({ tipo_servico: servico, data_hora: data })
    });

    const data_res = await res.json();
    if (res.ok) {
      alert('✅ Agendamento realizado!');
      carregarAgendamentos();
    } else {
      alert('❌ Erro: ' + data_res.erro);
    }
  } catch (err) {
    alert('Erro ao agendar: ' + err);
  }
}

// CARREGAR AGENDAMENTOS
async function carregarAgendamentos() {
  try {
    const res = await fetch(`${API_BASE}/agendamentos`, {
      headers: { 'Authorization': `Bearer ${obterToken()}` }
    });

    const agendamentos = await res.json();
    let html = '<h3>Seus Agendamentos</h3>';
    
    if (agendamentos.length === 0) {
      html += '<p>Nenhum agendamento ainda.</p>';
    } else {
      html += '<ul>';
      agendamentos.forEach(a => {
        html += `<li><strong>${a.tipo_servico}</strong> - ${new Date(a.data_hora).toLocaleString()}</li>`;
      });
      html += '</ul>';
    }

    document.getElementById('agendamentos_container').innerHTML = html;
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
  }
}

// CONTROLAR VISIBILIDADE
function mostrarLogin() {
  document.getElementById('login_section').style.display = 'block';
  document.getElementById('dashboard_section').style.display = 'none';
}

function mostrarDashboard() {
  document.getElementById('login_section').style.display = 'none';
  document.getElementById('dashboard_section').style.display = 'block';
}

// INICIALIZAR
window.addEventListener('load', () => {
  if (estaAutenticado()) {
    mostrarDashboard();
    carregarAnalises();
    carregarAgendamentos();
  } else {
    mostrarLogin();
  }
});
