import './style.css'
import logo from '../../assets/logo-megaplate.png'
import { useRef } from 'react';

export function Verificacao() {

    const inputsRef = Array.from({ length: 6 }, () => useRef(null));

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (value.length === 1 && index < inputsRef.length - 1) {
            inputsRef[index + 1].current.focus();
        }
    };

    return (
        <>
            <div className='container'>
                <div className='card'>
                    <div className='card-header'>VERIFICAÇÃO</div>
                    <p>
                        Enviamos um código de 6 dígitos para o seu e-mail. Insira-o abaixo para continuar com a redefinição da sua senha.
                    </p>
                    <div className='code-inputs'>
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
                    <button>VERIFICAR</button>
                    <img src={logo} alt="" />
                </div>
            </div>
        </>
    )
}

export default Verificacao;