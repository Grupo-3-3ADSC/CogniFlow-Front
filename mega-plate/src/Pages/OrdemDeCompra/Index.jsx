import style from './ordemDeCompra.module.css'
// import logo from '../../assets/logo-megaplate.png'
// import user from '../../assets/User.png';
import progressoImg from '../../assets/progressoOrdemDeCompra.png';
import progressoConcluido from '../../assets/progresso1Concluido.png';
import progresso2Concluido from '../../assets/progresso2Concluido.png';
import progresso3Concluido from '../../assets/progresso3Concluido.png';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../provider/api';
import { jsPDF } from 'jspdf';
import NavBar from '../../components/NavBar';
import { toastError, toastSucess } from '../../components/toastify/ToastifyService';

export function OrdemDeCompra() {

    const [listaFornecedores, setListaFornecedores] = useState([]);
    const [listaMateriais, setListaMateriais] = useState([]);
    function getFornecedores() {
        api.get("/fornecedores").then((resposta) => {
            setListaFornecedores(resposta.data)
        }).catch((erro) => {
            console.error("Erro ao buscar usuários", erro);
        });
    }

    function getMateriaPrima() {
        api.get("/materiais").then((resposta) => {
            setListaMateriais(resposta.data)
        }).catch((erro) => {
            console.error("Erro ao buscar usuários", erro);
        });
    }

    useEffect(() => {
        getFornecedores();
        getMateriaPrima();
    }, []);

    {/* EDITE AQUI PARA MODIFICAR AS INPUTS */ }
    const etapas = {
        1: {
            inputs: [
                { id: 'input1', titulo: 'Fornecedor', tipo: 'select', options: listaFornecedores, optionLabel: 'nomeFantasia' },
                { id: 'input2', titulo: 'Prazo de entrega', tipo: 'text', placeholder: '30 dias'},
                { id: 'input3', titulo: 'I.E', tipo: 'text' },
                { id: 'input4', titulo: 'Cond. Pagamento', tipo: 'text',  }
            ],
            imagem: progressoImg
        },
        2: {
            inputs: [
                { id: 'input1', titulo: 'Valor por Kg', tipo: 'number' },
                { id: 'input2', titulo: 'Rastreabilidade', tipo: 'text' },
                { id: 'input3', titulo: 'Material', tipo: 'select', options: listaMateriais, optionLabel: 'tipoMaterial' },
                { id: 'input4', titulo: 'Valor por peça', tipo: 'number' },
                { id: 'input5', titulo: 'Descrição do material', tipo: 'text' }

            ],
            imagem: progressoConcluido
        },
        3: {
            inputs: [
                { id: 'input1', titulo: 'Valor Unitário', tipo: 'text', },
                { id: 'input2', titulo: 'IPI', tipo: 'text' },
                { id: 'input3', titulo: 'Total', tipo: 'text', disabled: true },
                { id: 'input4', titulo: 'Quantidade', tipo: 'text' }

            ],
            imagem: progresso2Concluido
        },
        4: {
            inputs: [],
            imagem: progresso3Concluido
        }
    };

    const navigate = useNavigate();
    const [progresso, setProgresso] = useState(1);
    const [image, setImage] = useState(etapas[1].imagem);
    const [titulo, setTitulo] = useState('ORDEM DE COMPRA');
    const [nomeBotao, setNomeBotao] = useState('PRÓXIMO');
    const [valoresInput, setValoresInput] = useState({});

    useEffect(() => {
        const valorUnitario = parseFloat((valoresInput['Valor Unitário'] || '').replace(',', '.')) || 0;
        const valorPorKg = parseFloat((valoresInput['Valor por Kg'] || '').replace(',', '.')) || 0;

        const total = valorUnitario * valorPorKg;


        setValoresInput((resultado) => ({
            ...resultado,
            Total: total.toFixed(2),
        }));

    }, [valoresInput['Valor Unitário'], valoresInput['Valor por Kg']]);

    useEffect(() => {
        if (progresso == 5) {
            setTitulo('FORMULÁRIO FINALIZADO COM SUCESSO!');
        } else {
            setTitulo('ORDEM DE COMPRA');
        }

    }
        , [progresso]);

    function validarInputsVazias() {
        const inputs = etapas[progresso].inputs;
        for (let input of inputs) {
            if (!input.disabled && (!valoresInput[input.titulo] || valoresInput[input.titulo].trim() === "")) {
                return true;
            }
        }
        return false;
    }

    function validarInputsEspeciais() {
        const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b/i;
        const inputs = etapas[progresso].inputs;
        for (let input of inputs) {
            const valor = valoresInput[input.titulo];
            if (typeof valor === 'string' && sqlPattern.test(valor)) {
                return false;
            }
            if (typeof valor === 'string' && /<script.*?>.*?<\/script>/gi.test(valor)) {
                return false;
            }
        }
        return true;
    }

    function mudarProgresso() {

        if (!validarInputsEspeciais()) {
            toastError('Comando não permitido em uma das inputs');
            return;
        }

        if (validarInputsVazias()) {
            toastError('Por favor preencher todos os campos dessa seção!')
            return;
        }

        const novoProgresso = progresso + 1;
        if (etapas[novoProgresso]) {
            setProgresso(novoProgresso);
            setImage(etapas[novoProgresso].imagem);
        }

        if (progresso == 2) {
            setNomeBotao('FINALIZAR');
            return;
        }

        if (progresso == 3){
            toastSucess('Ordem de compra finalizada!');
        }
        setNomeBotao('PRÓXIMO');
    }

    function voltarProgresso() {
        const novoProgresso = progresso - 1;
        if (etapas[novoProgresso]) {
            setProgresso(novoProgresso);
            setImage(etapas[novoProgresso].imagem);
        }

        setNomeBotao('PRÓXIMO');
    }

    function reiniciarOrdemDeCompra() {
        setProgresso(1);
        setImage(etapas[1].imagem);
    }

    function irParaDashboard() {
        navigate('/Material')
    }

    function baixarPDF() {

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Ordem de compra', 20, 20);

        doc.setFontSize(12);
        const dataAtual = new Date().toLocaleString();
        doc.text(`Data e Hora: ${dataAtual}`, 20, 40);

        let posicaoY = 50;

        Object.keys(valoresInput).forEach((campo) => {
            doc.text(`${campo}: ${valoresInput[campo]}`, 20, posicaoY);
            posicaoY += 10;
        });

        doc.save('ordemDeCompra.pdf');
    }

    return (
        <>
            <NavBar />

            <section className={style.ordemDeCompra}>

                <div className={style.progressoSecao}>
                    <img src={image} />
                </div>

                <main className={style.formContent}>
                    <span className={style.spanTitulo} style={progresso == 4 ?
                        { backgroundColor: '#1D597B', width: '330px', height: '200px' } :
                        { backgroundColor: '#05314C' }}>
                        <h1>{titulo}</h1>
                    </span>
                    <div className={style.inputs}>
                        {etapas[progresso].inputs.map((input) => (
                            <div key={input.id} className={style.inputGroup}>
                                <p>{input.titulo}</p>
                                {input.tipo === 'select' ? (
                                    <select
                                        value={valoresInput[input.titulo] || ''}
                                        onChange={(e) => setValoresInput({ ...valoresInput, [input.titulo]: e.target.value })}>
                                        <option value="">Selecione</option>
                                        <option value="1">1</option>
                                        {input.options.map((opt, i) => (
                                            <option key={i} value={opt[input.optionLabel]}>{opt[input.optionLabel]}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input type="text"
                                        value={valoresInput[input.titulo] || ''}
                                        onChange={(e) => setValoresInput({ ...valoresInput, [input.titulo]: e.target.value })}
                                        disabled={input.disabled}
                                    />
                                )}

                            </div>

                        ))}


                    </div>

                    <div className={style.botaoPdf}>
                        <button disabled={progresso === 1} style={progresso != 4 ? { display: 'none' } : { display: 'block' }}
                            onClick={baixarPDF}>
                            BAIXAR ORDEM DE COMPRA
                        </button>
                    </div>

                </main>

                <div className={style.botoes}>
                    {progresso > 1 && progresso < 4 ? (
                        <button onClick={voltarProgresso}>VOLTAR</button>
                    ) : (
                        <span disabled={progresso === 1}
                            style={{ visibility: 'hidden' }}>VOLTAR</span>
                    )}

                    <button onClick={mudarProgresso} disabled={progresso === 4}
                        style={progresso == 4 ? { display: 'none' } : { display: 'block' }}>{nomeBotao}</button>

                    {progresso === 4 && (
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                        }}>

                            <button onClick={reiniciarOrdemDeCompra} disabled={progresso < 4}
                                style={progresso < 4 ? { display: 'none' } : { display: 'block' }}>
                                CRIAR NOVA ORDEM DE COMPRA
                            </button>

                            <button onClick={irParaDashboard} disabled={progresso < 4}
                                style={progresso < 4 ? { display: 'none' } : { display: 'block' }}>
                                IR PARA DASHBOARD
                            </button>
                        </div>)}
                </div>
            </section>
        </>
    );
}

export default OrdemDeCompra;
