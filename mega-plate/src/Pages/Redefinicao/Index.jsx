import styles from './redefinicao.module.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export function Redefinicao() {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [visivel, setVisivel] = useState(false);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const visorSenha = () => {
        setVisivel(!visivel);
    };

    // ✅ DESCOMENTADO - Função necessária!
    const atualizarSenha = async (userId, novaSenha) => {
        try {
            const response = await fetch(`http://localhost:8080/usuarios/${userId}/senha`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Se você usar autenticação, adicione aqui:
                    // 'Authorization': `Bearer ${token}`
                    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    password: novaSenha
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro ao atualizar senha');
            }

            return true;
        } catch (error) {
            throw error;
        }
    };

    async function irParaLogin() {
        // Validação antes de navegar
        if (!senha || !confirmarSenha) {
            setErro('Preencha ambos os campos.');
            return;
        }
        if (senha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }
        if (senha.length < 6) {
            setErro('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!userId) {
            setErro('ID do usuário não encontrado.');
            return;
        }

        setErro('');
        setCarregando(true);

        try {
            await atualizarSenha(userId, senha);
            alert('Senha atualizada com sucesso!'); // Opcional
            navigate('/Login');
        } catch (error) {
            setErro('Erro ao atualizar senha: ' + error.message);
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
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
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
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
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