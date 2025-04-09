import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Links() {
    const navigate = useNavigate();

    function irParaCadastro() {
        navigate('/cadastro');
    }
    function irParaLogin() {
        navigate('/');
    }
    function irParaOrdemDeCompra() {
        navigate('/ordemDeCompra');
    }

    return (
        <div className="links">
            <a onClick={irParaCadastro}>Cadastro</a>
            <br/>
            <a onClick={irParaLogin}>Login</a>
            <br/>
            <a onClick={irParaOrdemDeCompra}>Ordem de Compra</a>
            <br/>
        </div>
    );
}

export default Links;