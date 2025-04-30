import './style.css';
import logo from '../../assets/logo-megaplate.png';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Verificacao() {
    const navigate = useNavigate();
    const [showEmailScreen, setShowEmailScreen] = useState(true); // Estado para alternar entre telas
    const inputsRef = Array.from({ length: 6 }, () => useRef(null));

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (value.length === 1 && index < inputsRef.length - 1) {
            inputsRef[index + 1].current.focus();
        }
    };

    const handleSendEmail = () => {
        const email = document.querySelector('.email-input').value;
        if (!email) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
        setShowEmailScreen(false);
    };

    const handleVerifyCode = () => {

        const isValidCode = true;
        if (isValidCode) {
            navigate('/Redefinicao');
        } else {
            alert('Código inválido. Tente novamente.');
        }
    };

    return (
        <>
        
        <div className="verificacao">
            <div className="container-verificacao">

                <div className="card" style={{ display: showEmailScreen ? 'block' : 'none' }}>
                    <div className="card-header">REDEFINIR SENHA</div>
                    <p>
                        Insira o e-mail associado à sua conta. Enviaremos um código de 6 dígitos para redefinir sua senha.
                    </p>
                    <input type="email" placeholder="Digite seu e-mail" className="email-input" />
                    <button onClick={handleSendEmail}>ENVIAR</button>
                    <img src={logo} alt="" />
                </div>

                <div className="card" style={{ display: showEmailScreen ? 'none' : 'block' }}>
                    <div className="card-header">VERIFICAÇÃO</div>
                    <p>
                        Enviamos um código de 6 dígitos para o seu e-mail. Insira-o abaixo para continuar com a redefinição da sua senha.
                    </p>
                    <div className="code-inputs">
                        {inputsRef.map((ref, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                ref={ref}
                                onChange={(e) => handleChange(e, index)}
                            />
                        ))}
                    </div>
                    <button onClick={handleVerifyCode}>VERIFICAR</button>
                    <img src={logo} alt="" />
                </div>
            </div>
            </div>
        </>
    );
}

export default Verificacao;