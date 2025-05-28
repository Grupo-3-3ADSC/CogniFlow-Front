import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota para envio de código de verificação
app.post('/enviar-codigo', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
    }

    // Gera código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Configurações de envio de email
    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        auth: {
            user: 'cogniflow1@outlook.com', // Troque pelo e-mail do grupo
            pass: 'ads3mega'                // Troque pela senha ou senha de app
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: 'cogniflow1@outlook.com',
        to: email,
        subject: 'Código de Verificação - Mega Plate',
        text: `Seu código de verificação é: ${codigo}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Erro ao enviar email.' });
        } else {
            console.log('Email enviado: ' + info.response);
            return res.status(200).json({ success: true, message: 'Código enviado com sucesso!' });
        }
    });
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});