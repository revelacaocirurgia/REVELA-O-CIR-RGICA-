const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_revelacao';

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user_id = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido' });
  }
};

// REGISTRO
app.post('/api/registro', async (req, res) => {
  const { email, senha, nome } = req.body;

  try {
    const senha_hash = await bcrypt.hash(senha, 10);

    db.run(
      'INSERT INTO users (email, senha_hash, nome) VALUES (?, ?, ?)',
      [email, senha_hash, nome],
      (err) => {
        if (err) {
          return res.status(400).json({ erro: 'Email já existe' });
        }
        res.json({ mensagem: 'Usuário criado com sucesso!' });
      }
    );
  } catch (err) {
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

// LOGIN
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).json({ erro: 'Email ou senha incorretos' });

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Email ou senha incorretos' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, nome: user.nome } });
  });
});

// CRIAR ANÁLISE
app.post('/api/analises', authMiddleware, (req, res) => {
  const { tipo_modulo, dados_json } = req.body;

  db.run(
    'INSERT INTO analises (user_id, tipo_modulo, dados_json, status) VALUES (?, ?, ?, ?)',
    [req.user_id, tipo_modulo, JSON.stringify(dados_json), 'pendente'],
    (err) => {
      if (err) return res.status(500).json({ erro: 'Erro ao criar análise' });
      res.json({ mensagem: 'Análise criada!' });
    }
  );
});

// LISTAR ANÁLISES DO USUÁRIO
app.get('/api/analises', authMiddleware, (req, res) => {
  db.all('SELECT * FROM analises WHERE user_id = ?', [req.user_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar análises' });
    res.json(rows);
  });
});

// AGENDAR CONSULTA
app.post('/api/agendamentos', authMiddleware, (req, res) => {
  const { tipo_servico, data_hora } = req.body;

  db.run(
    'INSERT INTO agendamentos (user_id, tipo_servico, data_hora) VALUES (?, ?, ?)',
    [req.user_id, tipo_servico, data_hora],
    (err) => {
      if (err) return res.status(500).json({ erro: 'Erro ao agendar' });
      res.json({ mensagem: 'Agendamento realizado!' });
    }
  );
});

// LISTAR AGENDAMENTOS
app.get('/api/agendamentos', authMiddleware, (req, res) => {
  db.all('SELECT * FROM agendamentos WHERE user_id = ?', [req.user_id], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
