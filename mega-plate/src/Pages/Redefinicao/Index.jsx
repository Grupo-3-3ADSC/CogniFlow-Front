import styles from './redefinicao.module.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import {
    toastError,
    toastSuccess,
} from "../../components/toastify/ToastifyService.jsx";
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../provider/api.js';
import { microservico } from '../../provider/microservico.js';

export function Redefinicao() {
   const navigate = useNavigate();
    const location = useLocation();
    const { email } = useParams();
    
    const [visivel, setVisivel] = useState(false);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    // Pega o token do state ou do sessionStorage
    const resetToken = location.state?.resetToken || sessionStorage.getItem('reset_token_temp');
    const decodedEmail = email ? decodeURIComponent(email) : '';

    useEffect(() => {
        if (!resetToken || !decodedEmail) {
            toastError('Sessão inválida. Solicite um novo código.');
            navigate('/Verificacao');
            return;
        }

        // Valida o token antes de permitir a redefinição
        const validarToken = async () => {
            try {
                // Extrai o JTI do token (última parte após o último ponto)
                const tokenParts = resetToken.split('.');
                if (tokenParts.length !== 3) {
                    throw new Error('Token inválido');
                }
                
                const payload = JSON.parse(atob(tokenParts[1]));
                const jti = payload.jti;

                if (!jti) {
                    throw new Error('JTI não encontrado no token');
                }

                // Valida o token no microserviço
                const response = await microservico.post('/microservico/validar-token', { jti });
                
                if (!response.data.valid) {
                    toastError('Token inválido ou expirado.');
                    navigate('/Verificacao');
                }
            } catch (error) {
                console.error('Erro ao validar token:', error);
                toastError('Erro ao validar token. Solicite um novo código.');
                navigate('/Verificacao');
            }
        };

        validarToken();
    }, [resetToken, decodedEmail, navigate]);

    const visorSenha = () => {
        setVisivel(!visivel);
    };

    async function irParaLogin() {
        // Validações
        if (!senha || !confirmarSenha) {
            toastError('Preencha ambos os campos.');
            return;
        }
        if (senha !== confirmarSenha) {
            toastError('As senhas não coincidem.');
            return;
        }
        if (senha.length < 6) {
            toastError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!decodedEmail) {
            toastError('Email do usuário não encontrado.');
            return;
        }
        if (!resetToken) {
            toastError('Token de redefinição não encontrado.');
            navigate('/Verificacao');
            return;
        }

        setCarregando(true);

        try {
            // Extrai o JTI para marcar como usado depois
            const tokenParts = resetToken.split('.');
            const payload = JSON.parse(atob(tokenParts[1]));
            const jti = payload.jti;

            // Atualiza a senha
            await api.put(
                `/api/usuarios/${encodeURIComponent(decodedEmail)}/senha`,
                { password: senha },
                {
                    headers: {
                        'Authorization': `Bearer ${resetToken}`
                    }
                }
            );

            // Marca o token como usado
            if (jti) {
                await microservico.post('/microservico/marcar-token-usado', { jti });
            }

            toastSuccess('Senha atualizada com sucesso!');
            
            // Limpa o sessionStorage
            sessionStorage.removeItem('reset_token_temp');
            sessionStorage.removeItem('reset_email_temp');

            // Redireciona para login
            setTimeout(() => {
                navigate('/');
            }, 750);
        } catch (error) {
            console.error('Erro detalhado:', error);
            
            if (error.response) {
                // Erro do servidor
                const errorMsg = error.response.data?.message || 
                               error.response.data?.error || 
                               'Erro ao atualizar senha';
                
                toastError(errorMsg);
                
                // Se for token inválido, redireciona
                if (error.response.status === 401 || error.response.status === 403) {
                    setTimeout(() => navigate('/Verificacao'), 2000);
                }
            } else if (error.request) {
                // Erro de rede
                toastError('Erro de conexão. Verifique sua internet.');
            } else {
                // Erro na configuração
                toastError('Erro inesperado. Tente novamente.');
            }
        } finally {
            setCarregando(false);
        }
    }
    return (
        <section className={styles.redefinicao}>
            <aside className={styles['aside-redefinicao']}>
                <img src={logo} alt="" />
            </aside>
            <main className={styles['form-content-redefinicao']}>
                <h1>Redefinição de Senha</h1>

                <div className={styles['input-group']}>
                    <p>Nova Senha</p>
                    <input
                        placeholder="********"
                        type={visivel ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                irParaLogin();
                            }
                        }}
                        className='input-senha'
                        disabled={carregando}
                    />

                </div>

                <div className={styles['input-group']}>
                    <p>Confirmar Senha</p>
                    <input
                        placeholder='********'
                        type={visivel ? 'text' : 'password'}
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                irParaLogin();
                            }
                        }}
                        className='input-senha'
                        disabled={carregando}
                    />
                </div>

                {erro && <p style={{ color: 'red', marginBottom: 10 }}>{erro}</p>}

                <button
                    onClick={irParaLogin}
                    disabled={carregando}
                    style={{
                        opacity: carregando ? 0.6 : 1,
                        cursor: carregando ? 'not-allowed' : 'pointer'
                    }}
                >
                    {carregando ? 'REDEFININDO...' : 'REDEFINIR'}
                </button>
            </main>
        </section>
    )
}

export default Redefinicao;