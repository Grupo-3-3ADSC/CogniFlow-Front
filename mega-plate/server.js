import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir a build do Vite
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Exemplo: funcionalidade de envio de código
const codes = {};
app.post('/enviar-codigo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  codes[email] = { codigo, expires: Date.now() + 5 * 60 * 1000 };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cogniflow51@gmail.com',
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"CogniFlow" <cogniflow51@gmail.com>',
    to: email,
    subject: 'Código de Verificação - Mega Plate',
    html: `<p>Seu código de verificação é: <b>${codigo}</b></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
