import './style.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png'

export function Transferencia() {

    return (
        <>

            <div className='container'>
                <header className='navbar'>
                    <div className='menu-lateral'>
                        <img src={logo} alt="" />
                    </div>
                    <div className='perfil'>
                        <img className='userPhoto' src={user} alt="" />
                    </div>
                </header>

                <div className='box-mega'>
                    <h1>TRANSFERÊNCIA <br /> DE MATERIAL</h1>
                </div>

                <div className='box-campos'>
                    <label htmlFor="input-quantidadeUMR">Quantidade UMR:</label>
                    <input className='input-quantidadeUMR' type="text" maxLength={10} placeholder='Quantidade UMR' />

                    <label htmlFor="select-tipoMaterial">Tipo de Material:</label>
                    <select className='input-material' type='text'>
                        <option value="" disabled selected>Selecione uma opção</option>
                        <option value="">SAE 1020</option>
                        <option value="">SAE 1045</option>
                        <option value="">HARDOX 450</option>
                    </select>

                    <label htmlFor="select-tipo">Tipo de Transferência:</label>
                    <select className='input-tipoTransferencia' type='text' placeholder="Selecione ou digite">
                        <option value="" disabled selected>Selecione uma opção</option>
                        <option value="">Interna</option>
                        <option value="">Externa</option>
                        <option value="">Devolução</option>
                    </select>

                    <button className='botao-confirmar'>TRANSFERIR</button>
                </div>
            </div>

        </>
    )
}

export default Transferencia