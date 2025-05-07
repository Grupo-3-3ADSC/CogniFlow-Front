import styles from './Setor.module.css'
import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
import NavBar from '../../components/NavBar';

export function Setor() {

    return (
        <>
            <NavBar />

            <div className={styles["tab-container"]}></div>
            {/* <div className={styles.tabActiveUsuario}>Cadastro</div> */}
            <section className={styles.setor}>
                <div className={styles['bloco-fundo-setor']}>
                    <div className={styles["tab-container-user"]}>
                        <div className={styles.tabActiveSetor}>Setor</div>
                    </div>
                </div>
                <aside className={styles['aside-setor']}>
                    <img src={logo} alt="" />
                </aside>
                <main className={styles['form-content-setor']}>
                    <div className={styles['input-group']}>
                        <p>Nome</p>
                        <input placeholder="" type="text" />
                    </div>

                    <div className={styles['input-group']}>
                        <p>Descrição</p>
                        <input placeholder='' type='Text' />
                    </div>


                    <button>CADASTRAR</button>

                    {/* <a onClick={irParaSetor}>Não tem conta? <span>Cadastrar</span></a> */}
                </main>
            </section>

        </>
    );
};

export default Setor;