import styles from './verificacao.module.css';
import logo from '../../assets/logo-megaplate.png';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Verificacao() {
    const navigate = useNavigate();
    const [showEmailScreen, setShowEmailScreen] = useState(true);
    const [email, setEmail] = useState('');
    const inputsRef = Array.from({ length: 6 }, () => useRef(null));
    const [isVerifying, setIsVerifying] = useState(false);
    const [code, setCode] = useState(Array(6).fill(''));
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleChange = (e, index) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (!value) return;
        const newCode = [...code];
        newCode[index] = value[0];
        setCode(newCode);
        if (value.length === 1 && index < inputsRef.length - 1) {
            inputsRef[index + 1].current.focus();
        }
    };

    const handleSendEmail = async () => {
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
        setModalMessage('Enviando código...');
        setShowModal(true);
        try {
            const response = await fetch('http://localhost:3001/enviar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.success) {
                setModalMessage('Código enviado para seu e-mail!');
                setTimeout(() => {
                    setShowModal(false);
                    setShowEmailScreen(false);
                }, 1500);
            } else {
                setModalMessage(data.message || 'Erro ao enviar código.');
                setTimeout(() => setShowModal(false), 2000);
            }
        } catch (err) {
            setModalMessage('Erro ao conectar com o servidor.');
            setTimeout(() => setShowModal(false), 2000);
        }
    };

    // ✅ FUNÇÃO NOVA - Buscar userId pelo email
    const buscarUsuarioPorEmail = async (email) => {
        try {
            const response = await fetch(`http://localhost:8080/usuarios/buscar-por-email/${encodeURIComponent(email)}`);

            if (!response.ok) {
                throw new Error('Usuário não encontrado');
            }

            const usuario = await response.json();
            return usuario.id;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw new Error('Erro ao encontrar usuário');
        }
    };

    // ✅ FUNÇÃO MODIFICADA - Agora busca o userId antes de navegar
    const handleVerifyCode = async () => {
        const userCode = code.join('');
        if (userCode.length < 6) {
            alert('Digite o código completo.');
            return;
        }
        setIsVerifying(true);

        try {
            // Primeiro verifica o código
            const response = await fetch('http://localhost:3001/verificar-codigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, codigo: userCode })
            });
            const data = await response.json();

            if (data.success) {
                // Se código válido, busca o userId pelo email
                try {
                    const userId = await buscarUsuarioPorEmail(email);
                    // Navega para redefinição com o userId
                    navigate(`/Redefinicao/${userId}`);
                } catch (error) {
                    alert('Erro ao encontrar usuário. Tente novamente.');
                }
            } else {
                alert(data.message || 'Código inválido. Tente novamente.');
            }
        } catch (err) {
            console.error('Erro ao verificar código:', err);
            alert('Erro ao conectar com o servidor.');
        }
        setIsVerifying(false);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (code[index]) {
                // Apenas limpa o campo atual
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            } else if (index > 0) {
                // Vai para o campo anterior e limpa
                inputsRef[index - 1].current.focus();
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
            }
        }
    };

    return (
        <>
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <p>{modalMessage}</p>
                    </div>
                </div>
            )}

            <div className={styles.verificacao}>
                <div className={styles['container-verificacao']}>

                    <div className={styles.card} style={{ display: showEmailScreen ? 'block' : 'none' }}>
                        <div className={styles['card-header']}>REDEFINIR SENHA</div>
                        <p>
                            Insira o e-mail associado à sua conta. Enviaremos um código de 6 dígitos para redefinir sua senha.
                        </p>
                        <input type="email"
                            placeholder="Digite seu e-mail"
                            className={styles["email-input"]}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendEmail();
                                }
                            }}
                        />
                        <button onClick={handleSendEmail}>ENVIAR</button>
                        <img src={logo} alt="" />
                    </div>

                    <div className={styles.card} style={{ display: showEmailScreen ? 'none' : 'block' }}>
                        <div className={styles['card-header']}>VERIFICAÇÃO</div>
                        <p>
                            Enviamos um código de 6 dígitos para o seu e-mail. Insira-o abaixo para continuar com a redefinição da sua senha.
                        </p>
                        <div className={styles['code-inputs']}>
                            {inputsRef.map((ref, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    ref={ref}
                                    value={code[index]}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={e => {
                                        handleKeyDown(e, index);
                                        if (e.key === 'Enter') handleVerifyCode();
                                    }}
                                    onPaste={index === 0 ? (e) => {
                                        const paste = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, 6);
                                        if (paste.length > 1) {
                                            e.preventDefault();
                                            const newCode = paste.split('');
                                            setCode(arr => [
                                                ...newCode,
                                                ...Array(6 - newCode.length).fill('')
                                            ].slice(0, 6));
                                            // Foca no último input preenchido
                                            setTimeout(() => {
                                                if (inputsRef[paste.length - 1]?.current) {
                                                    inputsRef[paste.length - 1].current.focus();
                                                }
                                            }, 0);
                                        }
                                    } : undefined}
                                />
                            ))}
                        </div>
                        <button onClick={handleVerifyCode} disabled={isVerifying}>
                            {isVerifying ? 'Verificando...' : 'VERIFICAR'}
                        </button>
                        <img src={logo} alt="" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Verificacao;