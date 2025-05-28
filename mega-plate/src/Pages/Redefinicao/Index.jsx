import styles from './Redefinicao.module.css';
import logo from '../../assets/logo-megaplate.png';
import olho from '../../assets/olho.png';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Redefinicao() {
    const navigate = useNavigate();

    const [visivel, setVisivel] = useState(false);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');

    const visorSenha = () => {
        setVisivel(!visivel);
    };

    function irParaLogin() {
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
        setErro('');

        navigate('/Login');
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
                        className='input-senha' />
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
                </div>

                <div className={styles['input-group']}>
                    <p>Senha</p>
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
                        className='input-senha' />
                    <img className='olho' src={olho} onClick={visorSenha} alt='Mostrar senha' />
                </div>

                {erro && <p style={{ color: 'red', marginBottom: 10 }}>{erro}</p>}

                <button onClick={irParaLogin}>REDEFINIR</button>

                {/* <a onClick={irParaCadastro}>Não tem conta? <span>Cadastrar</span></a> */}
                {/* <a onClick={irParaLinks}>Links</a> */}
            </main>
        </section>
    )
}

export default Redefinicao;