const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'revelacao.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar ao banco:', err);
  else console.log('✓ Conectado ao SQLite');
});

// Criar tabelas
db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      nome TEXT,
      especialidade TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de análises
  db.run(`
    CREATE TABLE IF NOT EXISTS analises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tipo_modulo TEXT NOT NULL,
      dados_json TEXT,
      resultado TEXT,
      valor_pago REAL,
      status TEXT DEFAULT 'pendente',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Tabela de pagamentos
  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      analise_id INTEGER,
      valor REAL NOT NULL,
      status TEXT DEFAULT 'pendente',
      stripe_id TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(analise_id) REFERENCES analises(id)
    )
  `);

  // Tabela de agendamentos
  db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      tipo_servico TEXT NOT NULL,
      data_hora DATETIME NOT NULL,
      status TEXT DEFAULT 'agendado',
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  console.log('✓ Tabelas criadas com sucesso');
});

module.exports = db;
