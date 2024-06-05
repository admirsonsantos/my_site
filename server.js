const mysql = require('mysql2');
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const crypto = require('crypto');

const ws = express();
const server = require("http").createServer(ws);
const io = require("socket.io")(server);
dotenv.config();

ws.use(express.static(path.join(__dirname, "projeto")));

// Configurações de conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'z_world'
});

// Conectar ao banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem sucedida ao banco de dados MySQL!');
});

ws.use(express.json());
ws.use(express.urlencoded({ extended: true }));

// Rota para receber os dados do formulário de registro
ws.post('/register', (req, res) => {
  const { nome, apelido, data_nascimento, email, senha} = req.body;

  // Query para inserir os dados na tabela de usuários
  const query = `INSERT INTO users (userName, nickname, date_of_birth, email, password) VALUES (?, ?, ?, ?, ?)`;
  const values = [nome, apelido, data_nascimento, email, senha];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      res.status(500).send('Erro ao registrar users');
      return;
    }
    console.log('Usuário registrado com sucesso');
    res.status(200).send('Usuário registrado com sucesso');
  });
});

// Rota para receber os dados do formulário de login e verificar na base de dados
ws.post('/login', (req, res) => {
    const { nome, senha } = req.body;

    // Consulta para verificar se o nome de usuário e a senha correspondem a um registro na tabela users
    const query = `SELECT * FROM users WHERE userName = ? AND password = ?`;
    const values = [nome, senha];

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao verificar credenciais:', err);
            res.status(500).send('Erro ao verificar credenciais');
            return;
        }

        if (result.length > 0) {
            // Credenciais corretas, redirecionar para a página inicial
            res.status(200).send('Credenciais corretas, redirecionando...');
        } else {
            // Credenciais incorretas, redirecionar de volta para a página de login
            res.status(401).send('Nome de usuário ou senha incorretos');
        }
    });
});


const port = process.env.PORT || 5000;
server.listen(port, function() {
    console.log(`Servidor rodando na porta ${port}`);
});
