import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Armazenamento temporário de códigos
const codes = {};

// Rotas da API
app.post('/api/enviar-codigo', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false, 
            message: 'E-mail é obrigatório.' 
        });
    }
    
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    codes[email] = { codigo, expires: Date.now() + 5 * 60 * 1000 };
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'cogniflow51@gmail.com',
            pass: process.env.GMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: '"CogniFlow" <cogniflow51@gmail.com>',
        to: email,
        subject: 'Código de Verificação - Mega Plate',
        text: `Seu código de verificação é: ${codigo}`,
        html: `<p>Seu código de verificação é: <b>${codigo}</b></p>`
    };
    
    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Código enviado!' });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao enviar e-mail.' 
        });
    }
});

app.post('/api/verificar-codigo', (req, res) => {
    const { email, codigo } = req.body;
    
    if (!email || !codigo) {
        return res.status(400).json({ 
            success: false, 
            message: 'Dados incompletos.' 
        });
    }
    
    const registro = codes[email];
    
    if (registro && registro.codigo === codigo && Date.now() < registro.expires) {
        delete codes[email];
        res.json({ success: true });
    } else {
        res.status(400).json({ 
            success: false, 
            message: 'Código inválido ou expirado.' 
        });
    }
});

// Servir arquivos estáticos do React
app.use(express.static(join(__dirname, 'dist')));

// --- CORREÇÃO AQUI ---
// SPA fallback: Usando Regex /(.*)/ (sem aspas) para capturar todas as rotas
app.get(/(.*)/, (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});
// ---------------------

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`📁 Servindo arquivos de: ${join(__dirname, 'dist')}`);
});

