import style from './style.module.css'
import logo from '../../assets/logo-megaplate.png'
import user from '../../assets/User.png';
import progressoImg from '../../assets/progressoOrdemDeCompra.png';
import progressoConcluido from '../../assets/progresso1Concluido.png';
import progresso2Concluido from '../../assets/progresso2Concluido.png';
import progresso3Concluido from '../../assets/progresso3Concluido.png';
import { useState } from 'react';

{/* TIVE QUE USAR MODULE NESSA PARTE POR CAUSA QUE BUGA O CSS DO LOGIN E CADASTRO
    SE NÃO TIVER O CSS MODULE, ÚNICA COISA QUE MUDA É O JEITO DE COLOCAR A VARIÁVEL
    NA CLASSE E TEM QUE MUDAR O NOME DAS CLASSES PARA TIRAR O HÍFEN. */}
export function OrdemDeCompra() {

    const [progresso,setProgresso] = useState(1);
    const [image, setImage] = useState(progressoImg);

    function mudarProgresso() {
        setProgresso(progresso + 1);
    
        if (progresso == 1) {
            setImage(progressoConcluido);
            return;
        }

        if(progresso == 2){
            setImage(progresso2Concluido);
            return;
        }

        if(progresso == 3){
            setImage(progresso3Concluido);
            return;
        }
    }

    return (
        <>
            <nav className={style.navbar}>
                <div className={style.navbarLeft}></div>
                <div className={style.navbarRight}>
                    <img src={user} />
                </div>
            </nav>

            <section className={style.cadastro}>

                <div className={style.progressoSecao}>
                    <img src={image} />
                </div>

                <main className={style.formContent}>
                    <span className={style.spanTitulo}>
                        <h1>ORDEM DE COMPRA</h1>
                    </span>

                    <div className={style.inputs}>
                        <div className={style.inputGroup}>
                            <p>Fornecedor</p>
                            <select></select>
                        </div>

                        <div className={style.inputGroup}>
                            <p>Prazo de entrega</p>
                            <input placeholder="" type="text" />
                        </div>

                        <div className={style.inputGroup}>
                            <p>I.E</p>
                            <input placeholder="" type="text" />
                        </div>

                        <div className={style.inputGroup}>
                            <p>Cond. Pagamento</p>
                            <input placeholder="" type="text" />
                        </div>
                    </div>
                </main>

                <button className={style.proximo} onClick={mudarProgresso}>PRÓXIMO</button>
            </section>
        </>
    );
}

export default OrdemDeCompra;
